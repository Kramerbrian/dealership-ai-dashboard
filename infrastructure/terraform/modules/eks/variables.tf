variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "eks_version" {
  description = "Kubernetes version"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for EKS"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for EKS"
  type        = list(string)
}

variable "node_instance_types" {
  description = "EC2 instance types for nodes"
  type        = list(string)
}

variable "node_desired_size" {
  description = "Desired number of nodes"
  type        = number
}

variable "node_min_size" {
  description = "Minimum number of nodes"
  type        = number
}

variable "node_max_size" {
  description = "Maximum number of nodes"
  type        = number
}

variable "namespaces" {
  description = "List of Kubernetes namespaces to create"
  type        = list(string)
}

variable "playwright_observer_role_arn" {
  description = "IAM role ARN for Playwright observer"
  type        = string
}

variable "parser_normalizer_role_arn" {
  description = "IAM role ARN for parser/normalizer"
  type        = string
}

variable "feature_builder_role_arn" {
  description = "IAM role ARN for feature builder"
  type        = string
}

variable "valuation_engine_role_arn" {
  description = "IAM role ARN for valuation engine"
  type        = string
}

variable "offer_engine_role_arn" {
  description = "IAM role ARN for offer engine"
  type        = string
}

variable "compliance_role_arn" {
  description = "IAM role ARN for compliance"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
