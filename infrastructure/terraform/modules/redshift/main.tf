# Redshift Subnet Group
resource "aws_redshift_subnet_group" "main" {
  name       = "${var.cluster_name_prefix}-subnet-group"
  subnet_ids = var.subnet_ids
  
  tags = var.tags
}

# Redshift Parameter Group
resource "aws_redshift_parameter_group" "main" {
  name   = "${var.cluster_name_prefix}-params"
  family = "redshift-1.0"
  
  parameter {
    name  = "enable_user_activity_logging"
    value = "true"
  }
  
  parameter {
    name  = "require_ssl"
    value = "true"
  }
  
  tags = var.tags
}

# Redshift Cluster
resource "aws_redshift_cluster" "main" {
  cluster_identifier  = "${var.cluster_name_prefix}-cluster"
  database_name       = "aim_db"
  master_username     = var.master_username
  master_password     = var.master_password
  node_type           = var.node_type
  number_of_nodes     = var.node_count
  cluster_type        = var.node_count > 1 ? "multi-node" : "single-node"
  
  vpc_security_group_ids = [aws_security_group.redshift.id]
  cluster_subnet_group_name = aws_redshift_subnet_group.main.name
  cluster_parameter_group_name = aws_redshift_parameter_group.main.name
  
  # Encryption
  encrypted  = true
  kms_key_id = var.kms_key_id
  
  # Logging
  enable_logging = true
  logging {
    bucket_name  = var.s3_logging_bucket
    s3_key_prefix = "redshift-logs/"
  }
  
  # Maintenance
  preferred_maintenance_window = "sun:04:00-sun:05:00"
  automated_snapshot_retention_period = 7
  
  # Backup
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.cluster_name_prefix}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = var.tags
}

# Security Group for Redshift
resource "aws_security_group" "redshift" {
  name        = "${var.cluster_name_prefix}-redshift-sg"
  description = "Security group for Redshift cluster"
  vpc_id      = var.vpc_id
  
  ingress {
    description = "Redshift from EKS"
    from_port   = 5439
    to_port     = 5439
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.tags, {
    Name = "${var.cluster_name_prefix}-redshift-sg"
  })
}

# Redshift IAM Role for S3 access
resource "aws_iam_role" "redshift_s3" {
  name = "${var.cluster_name_prefix}-redshift-s3-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "redshift.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "redshift_s3" {
  name = "${var.cluster_name_prefix}-redshift-s3-policy"
  role = aws_iam_role.redshift_s3.id
  
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
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = var.kms_key_arn
      }
    ]
  })
}

resource "aws_redshift_cluster_iam_roles" "main" {
  cluster_identifier = aws_redshift_cluster.main.cluster_identifier
  iam_role_arns     = [aws_iam_role.redshift_s3.arn]
}

# Redshift Data API - Schema creation
# Note: Schema will be created via Redshift Data API or SQL scripts
# This Lambda function can be used to initialize schema

resource "aws_lambda_function" "redshift_schema_init" {
  filename         = data.archive_file.schema_init.output_path
  function_name    = "${var.cluster_name_prefix}-redshift-schema-init"
  role            = aws_iam_role.lambda_redshift.arn
  handler         = "index.handler"
  runtime         = "python3.11"
  timeout         = 300
  
  environment {
    variables = {
      CLUSTER_IDENTIFIER = aws_redshift_cluster.main.cluster_identifier
      DATABASE_NAME      = aws_redshift_cluster.main.database_name
      DB_USER            = var.master_username
      SECRET_ARN         = aws_secretsmanager_secret.redshift_credentials.arn
    }
  }
  
  tags = var.tags
}

data "archive_file" "schema_init" {
  type        = "zip"
  output_path = "/tmp/redshift_schema_init.zip"
  source {
    content = file("${path.module}/schema_init.py")
    filename = "index.py"
  }
}

resource "aws_iam_role" "lambda_redshift" {
  name = "${var.cluster_name_prefix}-lambda-redshift-role"
  
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

resource "aws_iam_role_policy" "lambda_redshift" {
  name = "${var.cluster_name_prefix}-lambda-redshift-policy"
  role = aws_iam_role.lambda_redshift.id
  
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
        Resource = aws_secretsmanager_secret.redshift_credentials.arn
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

resource "aws_secretsmanager_secret" "redshift_credentials" {
  name        = "${var.cluster_name_prefix}-redshift-credentials"
  description = "Redshift master credentials"
  kms_key_id  = var.kms_key_id
  
  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "redshift_credentials" {
  secret_id = aws_secretsmanager_secret.redshift_credentials.id
  secret_string = jsonencode({
    username = var.master_username
    password = var.master_password
  })
}
