output "cluster_arn" {
  description = "MSK cluster ARN"
  value       = aws_msk_cluster.main.arn
}

output "cluster_name" {
  description = "MSK cluster name"
  value       = aws_msk_cluster.main.cluster_name
}

output "bootstrap_brokers" {
  description = "MSK bootstrap brokers (TLS)"
  value       = aws_msk_cluster.main.bootstrap_brokers_tls
  sensitive   = true
}

output "zookeeper_connect_string" {
  description = "Zookeeper connect string"
  value       = aws_msk_cluster.main.zookeeper_connect_string
  sensitive   = true
}
