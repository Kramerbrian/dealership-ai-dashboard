terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  
  # Backend configuration - UPDATE THESE VALUES BEFORE DEPLOYING
  # Option 1: Uncomment and configure backend here
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "auction-intelligence-mesh/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "your-terraform-locks-table"
  # }
  
  # Option 2: Use partial backend configuration via CLI
  # terraform init -backend-config="bucket=your-bucket" -backend-config="key=path/to/state"
  
  # Option 3: Use backend config file (backend.hcl - NOT tracked in git)
  # terraform init -backend-config=backend.hcl
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "AuctionIntelligenceMesh"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      module.eks.cluster_name
    ]
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Local values
locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
  
  common_tags = {
    Project     = "AuctionIntelligenceMesh"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
  
  cluster_name_prefix = "${var.cluster_name}-${var.environment}"
  
  # Namespace names from blueprint
  namespaces = [
    "auction-manheim",
    "auction-acv",
    "auction-adesa",
    "vin-graph",
    "valuation",
    "guarantee",
    "compliance"
  ]
  
  # MSK topic names
  kafka_topics = [
    "auction-observations",
    "vin-features",
    "model-outputs",
    "offer-events"
  ]
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  cluster_name_prefix = local.cluster_name_prefix
  vpc_cidr            = "10.0.0.0/16"
  availability_zones = data.aws_availability_zones.available.names
  
  tags = local.common_tags
}

# Security Module (KMS, IAM, Secrets) - Created first
module "security" {
  source = "./modules/security"
  
  account_id              = local.account_id
  eks_oidc_provider_arn   = ""  # Will be updated after EKS creation
  msk_cluster_arn        = ""   # Will be updated after MSK creation
  s3_data_lake_arn         = "" # Will be updated after S3 creation
  s3_audit_arn             = "" # Will be updated after S3 creation
  secrets_rotation_days    = var.secrets_rotation_days
  
  tags = local.common_tags
}

# S3 Module - Needs KMS key from security
module "s3" {
  source = "./modules/s3"
  
  bucket_name_prefix        = local.cluster_name_prefix
  account_id                = local.account_id
  kms_key_id                = module.security.kms_key_id
  data_retention_days       = var.data_retention_days
  audit_log_retention_days  = var.audit_log_retention_days
  
  tags = local.common_tags
}

# EKS Module - Needs security roles
module "eks" {
  source = "./modules/eks"
  
  cluster_name         = var.cluster_name
  eks_version          = var.eks_version
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.private_subnet_ids
  node_instance_types  = var.node_instance_types
  node_desired_size    = var.node_desired_size
  node_min_size        = var.node_min_size
  node_max_size        = var.node_max_size
  namespaces           = local.namespaces
  
  playwright_observer_role_arn = module.security.playwright_observer_role_arn
  parser_normalizer_role_arn   = module.security.parser_normalizer_role_arn
  feature_builder_role_arn     = module.security.feature_builder_role_arn
  valuation_engine_role_arn     = module.security.valuation_engine_role_arn
  offer_engine_role_arn         = module.security.offer_engine_role_arn
  compliance_role_arn           = module.security.compliance_role_arn
  
  tags = local.common_tags
}

# MSK Module - Needs KMS key
module "msk" {
  source = "./modules/msk"
  
  cluster_name_prefix = local.cluster_name_prefix
  broker_count        = var.msk_broker_count
  instance_type       = var.msk_instance_type
  subnet_ids          = module.vpc.private_subnet_ids
  vpc_id              = module.vpc.vpc_id
  vpc_cidr            = module.vpc.vpc_cidr
  kms_key_id          = module.security.kms_key_id
  
  tags = local.common_tags
}

# Redshift Module
module "redshift" {
  source = "./modules/redshift"
  
  cluster_name_prefix = local.cluster_name_prefix
  node_type          = var.redshift_node_type
  node_count         = var.redshift_node_count
  master_username    = "aim_admin"
  master_password    = var.redshift_master_password
  subnet_ids         = module.vpc.private_subnet_ids
  vpc_id             = module.vpc.vpc_id
  vpc_cidr           = module.vpc.vpc_cidr
  kms_key_id         = module.security.kms_key_id
  kms_key_arn        = module.security.kms_key_arn
  s3_data_lake_arn   = module.s3.data_lake_bucket_arn
  s3_logging_bucket  = module.s3.redshift_logs_bucket_name
  
  tags = local.common_tags
  
  depends_on = [module.vpc, module.security, module.s3]
}

# SageMaker Module
module "sagemaker" {
  source = "./modules/sagemaker"
  
  cluster_name_prefix  = local.cluster_name_prefix
  account_id            = local.account_id
  region                = local.region
  s3_data_lake_arn      = module.s3.data_lake_bucket_arn
  s3_data_lake_bucket   = module.s3.data_lake_bucket_name
  kms_key_arn           = module.security.kms_key_arn
  
  tags = local.common_tags
  
  depends_on = [module.s3, module.security]
}

# Bedrock Module
module "bedrock" {
  source = "./modules/bedrock"
  
  cluster_name_prefix = local.cluster_name_prefix
  region              = local.region
  kms_key_id          = module.security.kms_key_id
  redshift_endpoint   = module.redshift.cluster_endpoint
  redshift_database   = module.redshift.database_name
  
  tags = local.common_tags
  
  depends_on = [module.redshift, module.security]
}

# API Gateway Module
module "api_gateway" {
  source = "./modules/api_gateway"
  
  cluster_name_prefix  = local.cluster_name_prefix
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.private_subnet_ids
  redshift_cluster_id  = module.redshift.cluster_identifier
  redshift_database    = module.redshift.database_name
  redshift_secret_arn  = module.redshift.redshift_secret_arn
  bedrock_agent_id     = module.bedrock.agent_id
  bedrock_kb_id        = module.bedrock.knowledge_base_id
  eks_cluster_name     = module.eks.cluster_name
  msk_cluster_arn      = module.msk.cluster_arn
  
  tags = local.common_tags
  
  depends_on = [
    module.vpc,
    module.redshift,
    module.bedrock,
    module.eks,
    module.msk
  ]
}

# Compliance Module
module "compliance" {
  source = "./modules/compliance"
  
  cluster_name_prefix = local.cluster_name_prefix
  account_id          = local.account_id
  region              = local.region
  audit_bucket_name   = module.s3.audit_bucket_name
  audit_bucket_arn    = module.s3.audit_bucket_arn
  s3_data_lake_arn    = module.s3.data_lake_bucket_arn
  kms_key_id          = module.security.kms_key_id
  
  tags = local.common_tags
  
  depends_on = [module.s3, module.security]
}
