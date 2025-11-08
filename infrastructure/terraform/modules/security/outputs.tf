output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.main.arn
}

output "playwright_observer_role_arn" {
  description = "IAM role ARN for Playwright observer pods"
  value       = aws_iam_role.playwright_observer.arn
}

output "parser_normalizer_role_arn" {
  description = "IAM role ARN for parser/normalizer jobs"
  value       = aws_iam_role.parser_normalizer.arn
}

output "feature_builder_role_arn" {
  description = "IAM role ARN for feature builder"
  value       = aws_iam_role.feature_builder.arn
}

output "valuation_engine_role_arn" {
  description = "IAM role ARN for valuation engine"
  value       = aws_iam_role.valuation_engine.arn
}

output "offer_engine_role_arn" {
  description = "IAM role ARN for offer engine"
  value       = aws_iam_role.offer_engine.arn
}

output "compliance_role_arn" {
  description = "IAM role ARN for compliance services"
  value       = aws_iam_role.compliance.arn
}

output "secrets_arns" {
  description = "Map of secret ARNs"
  value = {
    manheim = aws_secretsmanager_secret.auction_manheim.arn
    acv     = aws_secretsmanager_secret.auction_acv.arn
    adesa   = aws_secretsmanager_secret.auction_adesa.arn
    salts   = aws_secretsmanager_secret.platform_salts.arn
  }
}
