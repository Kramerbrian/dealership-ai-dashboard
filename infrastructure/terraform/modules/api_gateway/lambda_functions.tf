# Lambda Function for /appraise endpoint
resource "aws_lambda_function" "appraise" {
  filename         = data.archive_file.appraise_lambda.output_path
  function_name    = "${var.cluster_name_prefix}-appraise"
  role            = aws_iam_role.lambda_api.arn
  handler         = "index.handler"
  runtime         = "python3.11"
  timeout         = 30
  memory_size     = 512
  
  environment {
    variables = {
      REDSHIFT_CLUSTER_ID = var.redshift_cluster_id
      REDSHIFT_DATABASE   = var.redshift_database
      REDSHIFT_SECRET_ARN = var.redshift_secret_arn
      BEDROCK_AGENT_ID    = var.bedrock_agent_id
      BEDROCK_KB_ID       = var.bedrock_kb_id
    }
  }
  
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }
  
  tags = var.tags
}

data "archive_file" "appraise_lambda" {
  type        = "zip"
  output_path = "/tmp/appraise_lambda.zip"
  source {
    content = file("${path.module}/lambda_code/appraise.py")
    filename = "index.py"
  }
}

# Lambda Function for /vin/history endpoint
resource "aws_lambda_function" "vin_history" {
  filename         = data.archive_file.vin_history_lambda.output_path
  function_name    = "${var.cluster_name_prefix}-vin-history"
  role            = aws_iam_role.lambda_api.arn
  handler         = "index.handler"
  runtime         = "python3.11"
  timeout         = 60
  memory_size     = 1024
  
  environment {
    variables = {
      REDSHIFT_CLUSTER_ID = var.redshift_cluster_id
      REDSHIFT_DATABASE   = var.redshift_database
      REDSHIFT_SECRET_ARN = var.redshift_secret_arn
      BEDROCK_AGENT_ID    = var.bedrock_agent_id
      BEDROCK_KB_ID       = var.bedrock_kb_id
    }
  }
  
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }
  
  tags = var.tags
}

data "archive_file" "vin_history_lambda" {
  type        = "zip"
  output_path = "/tmp/vin_history_lambda.zip"
  source {
    content = file("${path.module}/lambda_code/vin_history.py")
    filename = "index.py"
  }
}

# Lambda Function for /vin/value endpoint
resource "aws_lambda_function" "vin_value" {
  filename         = data.archive_file.vin_value_lambda.output_path
  function_name    = "${var.cluster_name_prefix}-vin-value"
  role            = aws_iam_role.lambda_api.arn
  handler         = "index.handler"
  runtime         = "python3.11"
  timeout         = 30
  memory_size     = 512
  
  environment {
    variables = {
      REDSHIFT_CLUSTER_ID = var.redshift_cluster_id
      REDSHIFT_DATABASE   = var.redshift_database
      REDSHIFT_SECRET_ARN = var.redshift_secret_arn
    }
  }
  
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }
  
  tags = var.tags
}

data "archive_file" "vin_value_lambda" {
  type        = "zip"
  output_path = "/tmp/vin_value_lambda.zip"
  source {
    content = file("${path.module}/lambda_code/vin_value.py")
    filename = "index.py"
  }
}

# Lambda Function for /health endpoint
resource "aws_lambda_function" "health" {
  filename         = data.archive_file.health_lambda.output_path
  function_name    = "${var.cluster_name_prefix}-health"
  role            = aws_iam_role.lambda_api.arn
  handler         = "index.handler"
  runtime         = "python3.11"
  timeout         = 10
  memory_size     = 128
  
  environment {
    variables = {
      EKS_CLUSTER_NAME = var.eks_cluster_name
      MSK_CLUSTER_ARN  = var.msk_cluster_arn
      REDSHIFT_CLUSTER_ID = var.redshift_cluster_id
    }
  }
  
  tags = var.tags
}

data "archive_file" "health_lambda" {
  type        = "zip"
  output_path = "/tmp/health_lambda.zip"
  source {
    content = file("${path.module}/lambda_code/health.py")
    filename = "index.py"
  }
}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_api" {
  name = "${var.cluster_name_prefix}-lambda-api-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "lambda_api" {
  name = "${var.cluster_name_prefix}-lambda-api-policy"
  role = aws_iam_role.lambda_api.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
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
          "secretsmanager:GetSecretValue"
        ]
        Resource = var.redshift_secret_arn
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeAgent",
          "bedrock:Retrieve",
          "bedrock:RetrieveAndGenerate"
        ]
        Resource = [
          var.bedrock_agent_id,
          var.bedrock_kb_id
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ]
        Resource = "*"
      }
    ]
  })
}

# Security Group for Lambda functions
resource "aws_security_group" "lambda" {
  name        = "${var.cluster_name_prefix}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = var.vpc_id
  
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.tags, {
    Name = "${var.cluster_name_prefix}-lambda-sg"
  })
}
