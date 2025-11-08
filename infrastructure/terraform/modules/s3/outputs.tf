output "data_lake_bucket_name" {
  description = "S3 data lake bucket name"
  value       = aws_s3_bucket.data_lake.id
}

output "data_lake_bucket_arn" {
  description = "S3 data lake bucket ARN"
  value       = aws_s3_bucket.data_lake.arn
}

output "audit_bucket_name" {
  description = "S3 audit bucket name"
  value       = aws_s3_bucket.audit.id
}

output "audit_bucket_arn" {
  description = "S3 audit bucket ARN"
  value       = aws_s3_bucket.audit.arn
}

output "redshift_logs_bucket_name" {
  description = "S3 Redshift logs bucket name"
  value       = aws_s3_bucket.redshift_logs.id
}
