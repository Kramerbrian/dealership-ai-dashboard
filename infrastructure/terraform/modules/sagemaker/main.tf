# SageMaker Execution Role
resource "aws_iam_role" "sagemaker_execution" {
  name = "${var.cluster_name_prefix}-sagemaker-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sagemaker.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "sagemaker_execution" {
  role       = aws_iam_role.sagemaker_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

resource "aws_iam_role_policy" "sagemaker_custom" {
  name = "${var.cluster_name_prefix}-sagemaker-custom-policy"
  role = aws_iam_role.sagemaker_execution.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "${var.s3_data_lake_arn}/*",
          var.s3_data_lake_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "redshift-data:ExecuteStatement",
          "redshift-data:DescribeStatement",
          "redshift-data:GetStatementResult"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = var.kms_key_arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# SageMaker Pipeline for BV (Base Value) Model
resource "aws_sagemaker_pipeline" "bv_model" {
  pipeline_name        = "${var.cluster_name_prefix}-bv-model-pipeline"
  pipeline_display_name = "Base Value Model Training Pipeline"
  pipeline_description = "Weekly retraining pipeline for Base Value prediction model"
  role_arn             = aws_iam_role.sagemaker_execution.arn
  
  pipeline_definition = jsonencode({
    Version = "2020-12-01"
    Metadata = {}
    Parameters = [
      {
        Name        = "TrainingInstanceType"
        Type        = "String"
        DefaultValue = "ml.m5.xlarge"
      },
      {
        Name        = "TrainingInstanceCount"
        Type        = "Integer"
        DefaultValue = 1
      }
    ]
    PipelineExperimentConfig = {
      ExperimentName = "${var.cluster_name_prefix}-bv-experiment"
      TrialName      = "${var.cluster_name_prefix}-bv-trial"
    }
    Steps = [
      {
        Name = "DataProcessing"
        Type = "Processing"
        Arguments = {
          ProcessingInputs = [
            {
              InputName = "input-data"
              S3Input = {
                S3Uri        = "s3://${var.s3_data_lake_bucket}/training-data/"
                LocalPath    = "/opt/ml/processing/input"
                S3DataType   = "S3Prefix"
                S3InputMode  = "File"
                S3DataDistributionType = "FullyReplicated"
              }
            }
          ]
          ProcessingOutputConfig = {
            Outputs = [
              {
                OutputName = "processed-data"
                S3Output = {
                  S3Uri       = "s3://${var.s3_data_lake_bucket}/processed-data/"
                  LocalPath   = "/opt/ml/processing/output"
                  S3UploadMode = "EndOfJob"
                }
              }
            ]
          }
          ProcessingResources = {
            ClusterConfig = {
              InstanceType  = "ml.m5.xlarge"
              InstanceCount = 1
              VolumeSizeInGB = 30
            }
          }
          AppSpecification = {
            ImageUri = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/aim-data-processor:latest"
          }
          RoleArn = aws_iam_role.sagemaker_execution.arn
        }
      },
      {
        Name = "ModelTraining"
        Type = "Training"
        Arguments = {
          AlgorithmSpecification = {
            TrainingImage = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/aim-bv-model:latest"
            TrainingInputMode = "File"
          }
          InputDataConfig = [
            {
              ChannelName = "training"
              DataSource = {
                S3DataSource = {
                  S3DataType   = "S3Prefix"
                  S3Uri        = "s3://${var.s3_data_lake_bucket}/processed-data/"
                  S3DataDistributionType = "FullyReplicated"
                }
              }
            }
          ]
          OutputDataConfig = {
            S3OutputPath = "s3://${var.s3_data_lake_bucket}/models/bv/"
          }
          ResourceConfig = {
            InstanceType  = "ml.m5.xlarge"
            InstanceCount = 1
            VolumeSizeInGB = 30
          }
          StoppingCondition = {
            MaxRuntimeInSeconds = 3600
          }
          RoleArn = aws_iam_role.sagemaker_execution.arn
        }
      },
      {
        Name = "ModelRegistration"
        Type = "Model"
        Arguments = {
          ExecutionRoleArn = aws_iam_role.sagemaker_execution.arn
          PrimaryContainer = {
            Image = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/aim-bv-model:latest"
            ModelDataUrl = "s3://${var.s3_data_lake_bucket}/models/bv/"
            Environment = {
              MODEL_NAME = "base-value-model"
            }
          }
        }
      }
    ]
  })
  
  tags = var.tags
}

# EventBridge Rule for Weekly Training
resource "aws_cloudwatch_event_rule" "weekly_training" {
  name                = "${var.cluster_name_prefix}-weekly-training"
  description         = "Trigger weekly model retraining"
  schedule_expression = "cron(0 2 ? * SUN *)"  # Every Sunday at 2 AM
  
  tags = var.tags
}

resource "aws_cloudwatch_event_target" "sagemaker_pipeline" {
  rule      = aws_cloudwatch_event_rule.weekly_training.name
  target_id = "SageMakerPipeline"
  arn       = aws_sagemaker_pipeline.bv_model.arn
  role_arn  = aws_iam_role.eventbridge_sagemaker.arn
}

resource "aws_iam_role" "eventbridge_sagemaker" {
  name = "${var.cluster_name_prefix}-eventbridge-sagemaker-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "eventbridge_sagemaker" {
  name = "${var.cluster_name_prefix}-eventbridge-sagemaker-policy"
  role = aws_iam_role.eventbridge_sagemaker.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sagemaker:StartPipelineExecution"
        ]
        Resource = aws_sagemaker_pipeline.bv_model.arn
      }
    ]
  })
}

# Similar pipelines for CE, AE, GOE models (simplified - can be expanded)
# Note: In production, create separate pipelines for each model type
