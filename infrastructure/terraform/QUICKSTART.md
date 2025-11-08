# Quick Start Guide

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** >= 1.5.0 installed
3. **AWS CLI** configured
4. **kubectl** installed (for EKS access)

## 1. Configure Variables

Create `terraform.tfvars`:

```hcl
aws_region              = "us-east-1"
environment            = "prod"
cluster_name           = "aim"
redshift_master_password = "ChangeThisPassword123!"
```

## 2. Initialize

```bash
terraform init
```

## 3. Review Plan

```bash
terraform plan
```

## 4. Deploy

```bash
terraform apply
```

Type `yes` when prompted.

## 5. Get Outputs

```bash
# API URL
terraform output api_gateway_url

# EKS cluster name
terraform output eks_cluster_name

# Configure kubectl
aws eks update-kubeconfig --name $(terraform output -raw eks_cluster_name)
```

## 6. Verify Deployment

```bash
# Check health endpoint
curl $(terraform output -raw api_gateway_url)/api/v1/health

# List EKS namespaces
kubectl get namespaces

# Check MSK cluster
aws kafka describe-cluster --cluster-arn $(terraform output -raw msk_cluster_arn)
```

## Next Steps

1. Initialize Redshift schema (Lambda runs automatically)
2. Create Kafka topics
3. Deploy Kubernetes workloads
4. Start data ingestion

See `README.md` for detailed instructions.
