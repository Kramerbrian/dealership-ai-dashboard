variable "cluster_name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for Lambda"
  type        = list(string)
}

variable "redshift_cluster_id" {
  description = "Redshift cluster identifier"
  type        = string
}

variable "redshift_database" {
  description = "Redshift database name"
  type        = string
}

variable "redshift_secret_arn" {
  description = "Redshift credentials secret ARN"
  type        = string
}

variable "bedrock_agent_id" {
  description = "Bedrock agent ID"
  type        = string
}

variable "bedrock_kb_id" {
  description = "Bedrock knowledge base ID"
  type        = string
}

variable "eks_cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "msk_cluster_arn" {
  description = "MSK cluster ARN"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
