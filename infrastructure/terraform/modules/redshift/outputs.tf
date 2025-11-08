output "cluster_endpoint" {
  description = "Redshift cluster endpoint"
  value       = aws_redshift_cluster.main.endpoint
}

output "cluster_identifier" {
  description = "Redshift cluster identifier"
  value       = aws_redshift_cluster.main.cluster_identifier
}

output "database_name" {
  description = "Redshift database name"
  value       = aws_redshift_cluster.main.database_name
}

output "redshift_s3_role_arn" {
  description = "IAM role ARN for Redshift S3 access"
  value       = aws_iam_role.redshift_s3.arn
}

output "redshift_secret_arn" {
  description = "Redshift credentials secret ARN"
  value       = aws_secretsmanager_secret.redshift_credentials.arn
}
