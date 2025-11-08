output "sagemaker_execution_role_arn" {
  description = "SageMaker execution role ARN"
  value       = aws_iam_role.sagemaker_execution.arn
}

output "bv_pipeline_arn" {
  description = "Base Value model pipeline ARN"
  value       = aws_sagemaker_pipeline.bv_model.arn
}
