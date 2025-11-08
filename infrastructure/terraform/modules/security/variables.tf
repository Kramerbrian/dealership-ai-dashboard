variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "eks_oidc_provider_arn" {
  description = "EKS OIDC provider ARN for IRSA"
  type        = string
}

variable "msk_cluster_arn" {
  description = "MSK cluster ARN"
  type        = string
}

variable "s3_data_lake_arn" {
  description = "S3 data lake bucket ARN"
  type        = string
}

variable "s3_audit_arn" {
  description = "S3 audit bucket ARN"
  type        = string
}

variable "secrets_rotation_days" {
  description = "Secrets rotation period in days"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
