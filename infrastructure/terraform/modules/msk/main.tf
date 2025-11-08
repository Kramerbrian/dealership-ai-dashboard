# MSK Cluster
resource "aws_msk_cluster" "main" {
  cluster_name           = "${var.cluster_name_prefix}-msk"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = var.broker_count
  
  broker_node_group_info {
    instance_type   = var.instance_type
    client_subnets  = var.subnet_ids
    security_groups = [aws_security_group.msk.id]
    
    storage_info {
      ebs_storage_info {
        volume_size = 100
        provisioned_throughput {
          enabled           = false
          volume_throughput = 250
        }
      }
    }
  }
  
  encryption_info {
    encryption_at_rest_kms_key_id = var.kms_key_id
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }
  
  client_authentication {
    sasl {
      iam = true
    }
    tls {
      certificate_authority_arns = []
    }
  }
  
  open_monitoring {
    prometheus {
      jmx_exporter {
        enabled_in_broker = true
      }
    }
  }
  
  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.msk.name
      }
    }
  }
  
  tags = var.tags
}

# Security Group for MSK
resource "aws_security_group" "msk" {
  name        = "${var.cluster_name_prefix}-msk-sg"
  description = "Security group for MSK cluster"
  vpc_id      = var.vpc_id
  
  ingress {
    description = "Kafka from EKS"
    from_port   = 9092
    to_port     = 9098
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  ingress {
    description = "Kafka TLS from EKS"
    from_port   = 9094
    to_port     = 9096
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks  = ["0.0.0.0/0"]
  }
  
  tags = merge(var.tags, {
    Name = "${var.cluster_name_prefix}-msk-sg"
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "msk" {
  name              = "/aws/msk/${var.cluster_name_prefix}"
  retention_in_days = 7
  
  tags = var.tags
}

# Kafka Topics (created via Lambda or external tool)
# Note: MSK doesn't support topic creation via Terraform directly
# Topics will be created by application code or Kafka admin tools
