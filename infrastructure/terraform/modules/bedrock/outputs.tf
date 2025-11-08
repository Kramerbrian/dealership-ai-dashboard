output "agent_id" {
  description = "Bedrock agent ID"
  value       = aws_bedrock_agent.vin_history.agent_id
}

output "agent_arn" {
  description = "Bedrock agent ARN"
  value       = aws_bedrock_agent.vin_history.agent_arn
}

output "knowledge_base_id" {
  description = "Bedrock knowledge base ID"
  value       = aws_bedrock_knowledge_base.vin_data.knowledge_base_id
}
