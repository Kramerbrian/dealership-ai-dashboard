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

variable "audit_bucket_name" {
  description = "S3 audit bucket name"
  type        = string
}

variable "audit_bucket_arn" {
  description = "S3 audit bucket ARN"
  type        = string
}

variable "s3_data_lake_arn" {
  description = "S3 data lake bucket ARN"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ID"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for compliance alerts"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
