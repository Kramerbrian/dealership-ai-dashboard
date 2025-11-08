variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "aim-cluster"
}

variable "eks_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.28"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
  default     = ["m5.xlarge", "m5.2xlarge"]
}

variable "node_desired_size" {
  description = "Desired number of EKS nodes"
  type        = number
  default     = 3
}

variable "node_min_size" {
  description = "Minimum number of EKS nodes"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum number of EKS nodes"
  type        = number
  default     = 10
}

variable "msk_instance_type" {
  description = "MSK broker instance type"
  type        = string
  default     = "kafka.m5.large"
}

variable "msk_broker_count" {
  description = "Number of MSK brokers"
  type        = number
  default     = 3
}

variable "redshift_node_type" {
  description = "Redshift node type"
  type        = string
  default     = "dc2.large"
}

variable "redshift_node_count" {
  description = "Number of Redshift nodes"
  type        = number
  default     = 2
}

variable "data_retention_days" {
  description = "Data retention period in days for derived metrics"
  type        = number
  default     = 180
}

variable "audit_log_retention_days" {
  description = "Audit log retention period in days"
  type        = number
  default     = 365
}

variable "secrets_rotation_days" {
  description = "Secrets rotation period in days"
  type        = number
  default     = 30
}

variable "redshift_master_password" {
  description = "Redshift master password"
  type        = string
  sensitive   = true
}
