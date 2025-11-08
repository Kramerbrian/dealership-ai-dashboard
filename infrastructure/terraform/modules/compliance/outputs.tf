output "cloudtrail_arn" {
  description = "CloudTrail ARN"
  value       = aws_cloudtrail.main.arn
}

output "config_recorder_name" {
  description = "Config recorder name"
  value       = aws_config_configuration_recorder.main.name
}
