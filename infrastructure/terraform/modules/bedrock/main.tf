# Bedrock Agent for VIN History Reports
resource "aws_bedrock_agent" "vin_history" {
  agent_name              = "${var.cluster_name_prefix}-vin-history-agent"
  agent_resource_role_arn = aws_iam_role.bedrock_agent.arn
  description             = "Generates comprehensive VIN History Reports using Titan Embeddings and Claude"
  foundation_model        = "anthropic.claude-v2"
  
  instruction = <<-EOT
    You are an expert automotive valuation analyst. Generate comprehensive VIN History Reports that include:
    1. Vehicle identification and specifications
    2. Auction history across platforms (Manheim, ACV, ADESA)
    3. Valuation trends and confidence intervals
    4. Risk assessment and suspicious activity flags
    5. Natural language explanations of valuation factors
    
    Always cite data sources and provide confidence levels for each claim.
  EOT
  
  tags = var.tags
}

# Bedrock Knowledge Base for VIN data
resource "aws_bedrock_knowledge_base" "vin_data" {
  name     = "${var.cluster_name_prefix}-vin-knowledge-base"
  role_arn = aws_iam_role.bedrock_knowledge_base.arn
  
  knowledge_base_configuration {
    vector_knowledge_base_configuration {
      embedding_model_configuration {
        embedding_model_arn = "arn:aws:bedrock:${var.region}::foundation-model/amazon.titan-embed-text-v1"
      }
    }
  }
  
  storage_configuration {
    type = "REDSHIFT"
    redshift_configuration {
      connection_string = "jdbc:redshift://${var.redshift_endpoint}/${var.redshift_database}"
      credentials_secret_arn = aws_secretsmanager_secret.redshift_credentials.arn
      metadata_schema = "aim_observations"
      table_name = "observations"
    }
  }
  
  tags = var.tags
}

# IAM Role for Bedrock Agent
resource "aws_iam_role" "bedrock_agent" {
  name = "${var.cluster_name_prefix}-bedrock-agent-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "bedrock_agent" {
  name = "${var.cluster_name_prefix}-bedrock-agent-policy"
  role = aws_iam_role.bedrock_agent.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:Retrieve"
        ]
        Resource = [
          "arn:aws:bedrock:${var.region}::foundation-model/anthropic.claude-v2",
          "arn:aws:bedrock:${var.region}::foundation-model/amazon.titan-embed-text-v1"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:Retrieve",
          "bedrock:RetrieveAndGenerate"
        ]
        Resource = aws_bedrock_knowledge_base.vin_data.arn
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
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.redshift_credentials.arn
      }
    ]
  })
}

# IAM Role for Bedrock Knowledge Base
resource "aws_iam_role" "bedrock_knowledge_base" {
  name = "${var.cluster_name_prefix}-bedrock-kb-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "bedrock_knowledge_base" {
  name = "${var.cluster_name_prefix}-bedrock-kb-policy"
  role = aws_iam_role.bedrock_knowledge_base.id
  
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
          "bedrock:InvokeModel"
        ]
        Resource = "arn:aws:bedrock:${var.region}::foundation-model/amazon.titan-embed-text-v1"
      }
    ]
  })
}

resource "aws_secretsmanager_secret" "redshift_credentials" {
  name        = "${var.cluster_name_prefix}-bedrock-redshift-credentials"
  description = "Redshift credentials for Bedrock Knowledge Base"
  kms_key_id  = var.kms_key_id
  
  tags = var.tags
}
