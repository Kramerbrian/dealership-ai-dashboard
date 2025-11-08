variable "cluster_name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "s3_data_lake_arn" {
  description = "S3 data lake bucket ARN"
  type        = string
}

variable "s3_data_lake_bucket" {
  description = "S3 data lake bucket name"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
