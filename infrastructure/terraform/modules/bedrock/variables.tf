variable "cluster_name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ID"
  type        = string
}

variable "redshift_endpoint" {
  description = "Redshift cluster endpoint"
  type        = string
}

variable "redshift_database" {
  description = "Redshift database name"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
