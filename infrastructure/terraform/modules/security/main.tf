# KMS Key for encryption
resource "aws_kms_key" "main" {
  description             = "KMS key for AIM encryption (S3, Redshift, MSK)"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow EKS to use key"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow Redshift to use key"
        Effect = "Allow"
        Principal = {
          Service = "redshift.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow MSK to use key"
        Effect = "Allow"
        Principal = {
          Service = "kafka.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_kms_alias" "main" {
  name          = "alias/aim-encryption"
  target_key_id = aws_kms_key.main.key_id
}

# Secrets Manager structure for auction platform credentials
resource "aws_secretsmanager_secret" "auction_manheim" {
  name                    = "auction-agents/manheim/credentials"
  description             = "Manheim auction platform credentials"
  recovery_window_in_days = 7
  kms_key_id              = aws_kms_key.main.arn
  
  rotation_rules {
    automatically_after_days = var.secrets_rotation_days
  }
  
  tags = var.tags
}

resource "aws_secretsmanager_secret" "auction_acv" {
  name                    = "auction-agents/acv/credentials"
  description             = "ACV auction platform credentials"
  recovery_window_in_days = 7
  kms_key_id              = aws_kms_key.main.arn
  
  rotation_rules {
    automatically_after_days = var.secrets_rotation_days
  }
  
  tags = var.tags
}

resource "aws_secretsmanager_secret" "auction_adesa" {
  name                    = "auction-agents/adesa/credentials"
  description             = "ADESA auction platform credentials"
  recovery_window_in_days = 7
  kms_key_id              = aws_kms_key.main.arn
  
  rotation_rules {
    automatically_after_days = var.secrets_rotation_days
  }
  
  tags = var.tags
}

resource "aws_secretsmanager_secret" "platform_salts" {
  name                    = "auction-agents/platform-salts"
  description             = "Platform-specific salts for bidder hash generation"
  recovery_window_in_days = 7
  kms_key_id              = aws_kms_key.main.arn
  
  tags = var.tags
}

# IAM Role for Playwright Observer Pods
resource "aws_iam_role" "playwright_observer" {
  name = "aim-playwright-observer-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.eks_oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:sub" = "system:serviceaccount:auction-*:playwright-observer"
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "playwright_observer" {
  name = "aim-playwright-observer-policy"
  role = aws_iam_role.playwright_observer.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.auction_manheim.arn,
          aws_secretsmanager_secret.auction_acv.arn,
          aws_secretsmanager_secret.auction_adesa.arn,
          aws_secretsmanager_secret.platform_salts.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = [
          aws_kms_key.main.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kafka-cluster:Connect",
          "kafka-cluster:DescribeCluster",
          "kafka-cluster:WriteData",
          "kafka-cluster:CreateTopic"
        ]
        Resource = var.msk_cluster_arn != "" ? [var.msk_cluster_arn] : ["*"]
      }
    ]
  })
}

# IAM Role for Parser/Normalizer Jobs
resource "aws_iam_role" "parser_normalizer" {
  name = "aim-parser-normalizer-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.eks_oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:sub" = "system:serviceaccount:vin-graph:parser-normalizer"
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "parser_normalizer" {
  name = "aim-parser-normalizer-policy"
  role = aws_iam_role.parser_normalizer.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kafka-cluster:Connect",
          "kafka-cluster:DescribeCluster",
          "kafka-cluster:ReadData",
          "kafka-cluster:DescribeTopic"
        ]
        Resource = var.msk_cluster_arn
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
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${var.s3_data_lake_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.main.arn
      }
    ]
  })
}

# IAM Role for Feature Builder
resource "aws_iam_role" "feature_builder" {
  name = "aim-feature-builder-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.eks_oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:sub" = "system:serviceaccount:vin-graph:feature-builder"
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "feature_builder" {
  name = "aim-feature-builder-policy"
  role = aws_iam_role.feature_builder.id
  
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
          "kafka-cluster:Connect",
          "kafka-cluster:DescribeCluster",
          "kafka-cluster:WriteData"
        ]
        Resource = var.msk_cluster_arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.main.arn
      }
    ]
  })
}

# IAM Role for Valuation Engine
resource "aws_iam_role" "valuation_engine" {
  name = "aim-valuation-engine-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.eks_oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:sub" = "system:serviceaccount:valuation:valuation-engine"
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "valuation_engine" {
  name = "aim-valuation-engine-policy"
  role = aws_iam_role.valuation_engine.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sagemaker:InvokeEndpoint",
          "sagemaker:DescribeEndpoint",
          "sagemaker:DescribeModel"
        ]
        Resource = "*"
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
          "kafka-cluster:Connect",
          "kafka-cluster:DescribeCluster",
          "kafka-cluster:WriteData"
        ]
        Resource = var.msk_cluster_arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = aws_kms_key.main.arn
      }
    ]
  })
}

# IAM Role for GOE (Guaranteed Offer Engine)
resource "aws_iam_role" "offer_engine" {
  name = "aim-offer-engine-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.eks_oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:sub" = "system:serviceaccount:guarantee:offer-engine"
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "offer_engine" {
  name = "aim-offer-engine-policy"
  role = aws_iam_role.offer_engine.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kafka-cluster:Connect",
          "kafka-cluster:DescribeCluster",
          "kafka-cluster:ReadData"
        ]
        Resource = var.msk_cluster_arn
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
          "kms:Decrypt"
        ]
        Resource = aws_kms_key.main.arn
      }
    ]
  })
}

# IAM Role for Compliance (Vault Rotator, Audit Logger)
resource "aws_iam_role" "compliance" {
  name = "aim-compliance-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.eks_oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:sub" = "system:serviceaccount:compliance:*"
            "${replace(var.eks_oidc_provider_arn, "/^(.*provider/)/", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "compliance" {
  name = "aim-compliance-policy"
  role = aws_iam_role.compliance.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:RotateSecret",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.auction_manheim.arn,
          aws_secretsmanager_secret.auction_acv.arn,
          aws_secretsmanager_secret.auction_adesa.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${var.s3_audit_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudtrail:PutEventSelectors",
          "cloudtrail:GetEventSelectors",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.main.arn
      }
    ]
  })
}
