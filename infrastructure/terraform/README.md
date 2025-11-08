# Auction Intelligence Mesh (AIM) - Terraform Infrastructure

This Terraform configuration deploys the complete AWS infrastructure for the Auction Intelligence Mesh system as specified in the deployment blueprint.

## Architecture Overview

The infrastructure includes:

- **EKS Cluster**: Kubernetes cluster hosting Playwright agents, ETL pods, and model-runner services
- **MSK Cluster**: Kafka-compatible message bus for auction observations
- **Redshift**: Data warehouse for feature store and historical data
- **S3**: Data lake and audit log storage
- **SageMaker**: Model training pipelines (BV, CE, AE, GOE)
- **Bedrock**: LLM agent for VIN reports and natural language explanations
- **API Gateway + Lambda**: Public API endpoints
- **CloudTrail + Config**: Compliance and audit logging

## ⚠️ SECURITY WARNING - READ BEFORE PROCEEDING

**CRITICAL**: Before committing or deploying:

1. **Review `SECURITY_CHECKLIST.md`** - Complete security checklist
2. **Never commit**:
   - `terraform.tfvars` (contains sensitive values)
   - `*.tfstate` files (contain infrastructure state)
   - `backend.hcl` (may contain bucket names)
   - Any `.env` or credential files
3. **Configure backend** - Update backend configuration before deploying
4. **Use example files** - Copy `terraform.tfvars.example` and `backend.hcl.example`

See `SECURITY_CHECKLIST.md` for complete security guidelines.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.5.0
3. kubectl (for EKS access)
4. S3 bucket for Terraform state (see Backend Configuration below)

## Deployment Steps

### 1. Configure Backend

**IMPORTANT**: The backend is commented out in `main.tf` for security. Choose one option:

**Option A: Use backend.hcl (Recommended - Not committed to git)**
```bash
cp backend.hcl.example backend.hcl
# Edit backend.hcl with your values
terraform init -backend-config=backend.hcl
```

**Option B: Uncomment and configure in main.tf**
```hcl
backend "s3" {
  bucket         = "your-terraform-state-bucket"
  key            = "auction-intelligence-mesh/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "your-terraform-locks-table"
}
```

**Option C: Use CLI flags**
```bash
terraform init \
  -backend-config="bucket=your-bucket" \
  -backend-config="key=auction-intelligence-mesh/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="dynamodb_table=your-table"
```

**Create Required Resources First:**
```bash
# Create S3 bucket for state
aws s3 mb s3://your-terraform-state-bucket --region us-east-1
aws s3api put-bucket-versioning \
  --bucket your-terraform-state-bucket \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locks
aws dynamodb create-table \
  --table-name your-terraform-locks-table \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 2. Create terraform.tfvars

**IMPORTANT**: Copy the example file (never commit the actual file):

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

Create a `terraform.tfvars` file (this file is in .gitignore):

```hcl
aws_region              = "us-east-1"
environment            = "prod"
cluster_name           = "aim"
eks_version            = "1.28"
node_instance_types    = ["m5.xlarge", "m5.2xlarge"]
node_desired_size      = 3
node_min_size          = 2
node_max_size          = 10
msk_instance_type      = "kafka.m5.large"
msk_broker_count       = 3
redshift_node_type     = "dc2.large"
redshift_node_count    = 2
redshift_master_password = "YourSecurePassword123!"
data_retention_days    = 180
audit_log_retention_days = 365
secrets_rotation_days  = 30
```

### 3. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### 4. Plan Deployment

```bash
terraform plan -out=tfplan
```

Review the plan carefully. The deployment will create:
- VPC with public/private subnets
- EKS cluster with namespaces
- MSK cluster
- Redshift cluster
- S3 buckets
- IAM roles and policies
- SageMaker pipelines
- Bedrock agents
- API Gateway and Lambda functions
- CloudTrail and Config

### 5. Apply Infrastructure

```bash
terraform apply tfplan
```

This will take approximately 30-45 minutes to complete.

### 6. Post-Deployment Configuration

#### Initialize Redshift Schema

The Redshift schema initialization Lambda will run automatically. Verify:

```bash
aws lambda invoke \
  --function-name aim-prod-redshift-schema-init \
  --payload '{}' \
  response.json
```

#### Configure Kafka Topics

Create Kafka topics using the MSK bootstrap brokers:

```bash
# Get bootstrap brokers
terraform output msk_bootstrap_brokers

# Create topics (using kafka CLI or application code)
kafka-topics.sh --create \
  --bootstrap-server <bootstrap-brokers> \
  --topic auction-observations \
  --partitions 3 \
  --replication-factor 3
```

#### Deploy Kubernetes Workloads

After EKS is ready, deploy your application pods:

```bash
# Configure kubectl
aws eks update-kubeconfig --name aim-cluster --region us-east-1

# Deploy Playwright observers, parsers, etc.
kubectl apply -f ../kubernetes/
```

## Module Structure

```
terraform/
├── main.tf                 # Root configuration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
└── modules/
    ├── vpc/                # VPC and networking
    ├── security/           # KMS, IAM, Secrets Manager
    ├── s3/                 # S3 buckets
    ├── eks/                # EKS cluster and namespaces
    ├── msk/                # MSK Kafka cluster
    ├── redshift/           # Redshift cluster and schema
    ├── sagemaker/          # SageMaker training pipelines
    ├── bedrock/            # Bedrock agents and knowledge base
    ├── api_gateway/        # API Gateway and Lambda functions
    └── compliance/         # CloudTrail and Config
```

## Key Outputs

After deployment, retrieve important values:

```bash
# API Gateway URL
terraform output api_gateway_url

# EKS cluster endpoint
terraform output eks_cluster_endpoint

# Redshift endpoint
terraform output redshift_cluster_endpoint

# MSK bootstrap brokers
terraform output msk_bootstrap_brokers
```

## Security

### Infrastructure Security
- All data is encrypted at rest using KMS
- Secrets are stored in Secrets Manager with automatic rotation
- Network policies isolate Kubernetes namespaces
- CloudTrail logs all API calls
- Config monitors compliance rules

### Code Security (Before Committing)
- ✅ Review `SECURITY_CHECKLIST.md` before every commit
- ✅ Never commit `terraform.tfvars` or `.tfstate` files
- ✅ Use `terraform.tfvars.example` as a template
- ✅ Use `backend.hcl.example` for backend configuration
- ✅ Verify `.gitignore` is working: `git status`

See `SECURITY_CHECKLIST.md` for complete security guidelines.

## Cost Estimation

Approximate monthly costs (us-east-1):

- EKS: ~$150 (cluster) + ~$300 (nodes)
- MSK: ~$450 (3 brokers)
- Redshift: ~$600 (2-node cluster)
- SageMaker: Variable (training jobs)
- Bedrock: Pay-per-use
- S3: ~$50 (storage + requests)
- Data Transfer: Variable

**Total: ~$1,550/month base + variable costs**

## Troubleshooting

### EKS Cluster Not Accessible

```bash
# Verify OIDC provider
aws eks describe-cluster --name aim-cluster --query "cluster.identity.oidc.issuer"

# Update kubeconfig
aws eks update-kubeconfig --name aim-cluster --region us-east-1
```

### Redshift Schema Not Created

Check Lambda logs:

```bash
aws logs tail /aws/lambda/aim-prod-redshift-schema-init --follow
```

### MSK Connection Issues

Verify security groups allow traffic from EKS subnets on ports 9092-9098.

### API Gateway 500 Errors

Check Lambda function logs in CloudWatch.

## Next Steps

1. Deploy Kubernetes workloads (Playwright observers, parsers, etc.)
2. Initialize Kafka topics
3. Start data ingestion
4. Train initial models in SageMaker
5. Test API endpoints

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all data. Ensure backups are taken before destroying.
