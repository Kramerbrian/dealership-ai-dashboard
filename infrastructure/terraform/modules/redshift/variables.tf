variable "cluster_name_prefix" {
  description = "Prefix for Redshift cluster name"
  type        = string
}

variable "node_type" {
  description = "Redshift node type"
  type        = string
  default     = "dc2.large"
}

variable "node_count" {
  description = "Number of Redshift nodes"
  type        = number
  default     = 2
}

variable "master_username" {
  description = "Redshift master username"
  type        = string
  default     = "aim_admin"
}

variable "master_password" {
  description = "Redshift master password"
  type        = string
  sensitive   = true
}

variable "subnet_ids" {
  description = "Subnet IDs for Redshift"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN"
  type        = string
}

variable "s3_data_lake_arn" {
  description = "S3 data lake bucket ARN"
  type        = string
}

variable "s3_logging_bucket" {
  description = "S3 bucket for Redshift logs"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
