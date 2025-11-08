variable "bucket_name_prefix" {
  description = "Prefix for S3 bucket names"
  type        = string
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
}

variable "data_retention_days" {
  description = "Data retention period in days"
  type        = number
  default     = 180
}

variable "audit_log_retention_days" {
  description = "Audit log retention period in days"
  type        = number
  default     = 365
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
