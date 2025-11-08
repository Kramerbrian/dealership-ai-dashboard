# CloudTrail for API audit logging
resource "aws_cloudtrail" "main" {
  name           = "${var.cluster_name_prefix}-cloudtrail"
  s3_bucket_name = var.audit_bucket_name
  s3_key_prefix  = "cloudtrail/"
  
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_logging                = true
  enable_log_file_validation    = true
  
  event_selector {
    read_write_type                 = "All"
    include_management_events       = true
    
    data_resource {
      type   = "AWS::S3::Object"
      values = ["${var.s3_data_lake_arn}/*"]
    }
    
    data_resource {
      type   = "AWS::S3::Object"
      values = ["${var.audit_bucket_arn}/*"]
    }
  }
  
  event_selector {
    read_write_type           = "All"
    include_management_events = true
    
    data_resource {
      type   = "AWS::Lambda::Function"
      values = ["arn:aws:lambda:*:*:function:${var.cluster_name_prefix}-*"]
    }
  }
  
  kms_key_id = var.kms_key_id
  
  tags = var.tags
}

# CloudTrail S3 Bucket Policy
resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = var.audit_bucket_name
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = var.audit_bucket_arn
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudtrail:${var.region}:${var.account_id}:trail/${var.cluster_name_prefix}-cloudtrail"
          }
        }
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${var.audit_bucket_arn}/cloudtrail/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudtrail:${var.region}:${var.account_id}:trail/${var.cluster_name_prefix}-cloudtrail"
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# AWS Config for compliance monitoring
resource "aws_config_configuration_recorder" "main" {
  name     = "${var.cluster_name_prefix}-config-recorder"
  role_arn = aws_iam_role.config.arn
  
  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
  
  depends_on = [aws_config_delivery_channel.main]
}

resource "aws_config_delivery_channel" "main" {
  name           = "${var.cluster_name_prefix}-config-delivery"
  s3_bucket_name = var.audit_bucket_name
  s3_key_prefix  = "config/"
  
  snapshot_delivery_properties {
    delivery_frequency = "TwentyFour_Hours"
  }
}

# IAM Role for Config
resource "aws_iam_role" "config" {
  name = "${var.cluster_name_prefix}-config-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/ConfigRole"
}

resource "aws_iam_role_policy" "config" {
  name = "${var.cluster_name_prefix}-config-policy"
  role = aws_iam_role.config.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = "${var.audit_bucket_arn}/config/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetBucketAcl"
        ]
        Resource = var.audit_bucket_arn
      }
    ]
  })
}

# Config Rules for compliance
resource "aws_config_config_rule" "encrypted_volumes" {
  name = "${var.cluster_name_prefix}-encrypted-volumes"
  
  source {
    owner             = "AWS"
    source_identifier = "ENCRYPTED_VOLUMES"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "s3_bucket_encryption" {
  name = "${var.cluster_name_prefix}-s3-bucket-encryption"
  
  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "redshift_cluster_encryption" {
  name = "${var.cluster_name_prefix}-redshift-encryption"
  
  source {
    owner             = "AWS"
    source_identifier = "REDSHIFT_CLUSTER_ENCRYPTION_ENABLED"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "secrets_rotation" {
  name = "${var.cluster_name_prefix}-secrets-rotation"
  
  source {
    owner             = "AWS"
    source_identifier = "SECRETSMANAGER_ROTATED_SECRET_CHECK"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

# CloudWatch Alarms for compliance
resource "aws_cloudwatch_metric_alarm" "config_compliance" {
  name          = "${var.cluster_name_prefix}-config-compliance-alarm"
  alarm_description = "Alert when compliance rules fail"
  
  metric_name   = "Compliance"
  namespace     = "AWS/Config"
  statistic     = "Maximum"
  period        = 300
  evaluation_periods = 1
  threshold     = 1
  comparison_operator = "GreaterThanThreshold"
  
  dimensions = {
    ConfigRuleName = aws_config_config_rule.encrypted_volumes.name
  }
  
  alarm_actions = [var.sns_topic_arn]
  
  tags = var.tags
}
