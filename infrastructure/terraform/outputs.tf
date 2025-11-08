output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "msk_cluster_arn" {
  description = "MSK cluster ARN"
  value       = module.msk.cluster_arn
}

output "msk_bootstrap_brokers" {
  description = "MSK bootstrap brokers"
  value       = module.msk.bootstrap_brokers
  sensitive   = true
}

output "redshift_cluster_endpoint" {
  description = "Redshift cluster endpoint"
  value       = module.redshift.cluster_endpoint
}

output "api_gateway_url" {
  description = "API Gateway base URL"
  value       = module.api_gateway.api_url
}

output "s3_data_lake_bucket" {
  description = "S3 data lake bucket name"
  value       = module.s3.data_lake_bucket_name
}

output "s3_audit_bucket" {
  description = "S3 audit log bucket name"
  value       = module.s3.audit_bucket_name
}

output "kms_key_id" {
  description = "KMS encryption key ID"
  value       = module.security.kms_key_id
}

output "bedrock_agent_id" {
  description = "Bedrock agent ID for VIN reports"
  value       = module.bedrock.agent_id
  sensitive   = true
}
