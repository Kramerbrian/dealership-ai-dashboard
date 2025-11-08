# S3 Data Lake Bucket
resource "aws_s3_bucket" "data_lake" {
  bucket = "${var.bucket_name_prefix}-data-lake"
  
  tags = merge(var.tags, {
    Name        = "${var.bucket_name_prefix}-data-lake"
    Purpose     = "Feature store and historical data lake"
    Retention   = "${var.data_retention_days} days"
  })
}

resource "aws_s3_bucket_versioning" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_id
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  
  rule {
    id     = "delete-old-data"
    status = "Enabled"
    
    expiration {
      days = var.data_retention_days
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_s3_bucket_public_access_block" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Audit Log Bucket (write-once)
resource "aws_s3_bucket" "audit" {
  bucket = "${var.bucket_name_prefix}-audit-logs"
  
  tags = merge(var.tags, {
    Name        = "${var.bucket_name_prefix}-audit-logs"
    Purpose     = "Audit logs and compliance records"
    Retention   = "${var.audit_log_retention_days} days"
    WriteOnce   = "true"
  })
}

resource "aws_s3_bucket_versioning" "audit" {
  bucket = aws_s3_bucket.audit.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "audit" {
  bucket = aws_s3_bucket.audit.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_id
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "audit" {
  bucket = aws_s3_bucket.audit.id
  
  rule {
    id     = "delete-old-audit-logs"
    status = "Enabled"
    
    expiration {
      days = var.audit_log_retention_days
    }
    
    # Prevent deletion of recent logs
    noncurrent_version_expiration {
      noncurrent_days = var.audit_log_retention_days
    }
  }
}

resource "aws_s3_bucket_public_access_block" "audit" {
  bucket = aws_s3_bucket.audit.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Policy for audit (write-once enforcement via IAM)
resource "aws_s3_bucket_policy" "audit" {
  bucket = aws_s3_bucket.audit.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyDeleteAndModify"
        Effect = "Deny"
        Principal = "*"
        Action = [
          "s3:DeleteObject",
          "s3:DeleteObjectVersion",
          "s3:PutObjectAcl"
        ]
        Resource = "${aws_s3_bucket.audit.arn}/*"
        Condition = {
          StringNotEquals = {
            "aws:PrincipalArn" = [
              "arn:aws:iam::${var.account_id}:role/aim-compliance-role"
            ]
          }
        }
      }
    ]
  })
}

# S3 Bucket for Redshift Logs
resource "aws_s3_bucket" "redshift_logs" {
  bucket = "${var.bucket_name_prefix}-redshift-logs"
  
  tags = merge(var.tags, {
    Name    = "${var.bucket_name_prefix}-redshift-logs"
    Purpose = "Redshift query and audit logs"
  })
}

resource "aws_s3_bucket_server_side_encryption_configuration" "redshift_logs" {
  bucket = aws_s3_bucket.redshift_logs.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_id
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "redshift_logs" {
  bucket = aws_s3_bucket.redshift_logs.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
