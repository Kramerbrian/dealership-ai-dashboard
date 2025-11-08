# Deployment Order

This document outlines the recommended deployment order for the Auction Intelligence Mesh infrastructure, matching the blueprint specification.

## Phase 1: Foundation (Security & Networking)

1. **VPC Module** - Creates networking foundation
2. **Security Module** - KMS keys, IAM roles, Secrets Manager structure
3. **S3 Module** - Data lake and audit buckets

**Dependencies**: None

## Phase 2: Compute & Storage

4. **EKS Module** - Kubernetes cluster with namespaces
5. **MSK Module** - Kafka cluster for message bus
6. **Redshift Module** - Data warehouse with schema initialization

**Dependencies**: VPC, Security, S3

## Phase 3: ML & Intelligence

7. **SageMaker Module** - Training pipelines for BV, CE, AE, GOE models
8. **Bedrock Module** - LLM agents and knowledge base

**Dependencies**: Redshift, S3, Security

## Phase 4: API & Compliance

9. **API Gateway Module** - REST endpoints with Lambda functions
10. **Compliance Module** - CloudTrail and Config rules

**Dependencies**: All previous modules

## Deployment Commands

### Step-by-Step Deployment

```bash
# 1. Initialize
terraform init

# 2. Validate
terraform validate

# 3. Plan Phase 1
terraform plan -target=module.vpc -target=module.security -target=module.s3 -out=phase1.tfplan

# 4. Apply Phase 1
terraform apply phase1.tfplan

# 5. Plan Phase 2
terraform plan -target=module.eks -target=module.msk -target=module.redshift -out=phase2.tfplan

# 6. Apply Phase 2
terraform apply phase2.tfplan

# 7. Plan Phase 3
terraform plan -target=module.sagemaker -target=module.bedrock -out=phase3.tfplan

# 8. Apply Phase 3
terraform apply phase3.tfplan

# 9. Plan Phase 4
terraform plan -target=module.api_gateway -target=module.compliance -out=phase4.tfplan

# 10. Apply Phase 4
terraform apply phase4.tfplan

# 11. Final apply to catch any remaining resources
terraform apply
```

## Post-Deployment Tasks

After infrastructure is deployed:

1. **Initialize Redshift Schema**
   ```bash
   aws lambda invoke \
     --function-name $(terraform output -raw redshift_schema_init_function_name) \
     --payload '{}' \
     response.json
   ```

2. **Create Kafka Topics**
   ```bash
   # Get bootstrap brokers
   BOOTSTRAP=$(terraform output -raw msk_bootstrap_brokers)
   
   # Create topics (requires Kafka CLI or application)
   kafka-topics.sh --create \
     --bootstrap-server $BOOTSTRAP \
     --topic auction-observations \
     --partitions 3 \
     --replication-factor 3
   ```

3. **Deploy Kubernetes Workloads**
   ```bash
   # Configure kubectl
   aws eks update-kubeconfig --name $(terraform output -raw eks_cluster_name)
   
   # Deploy application pods
   kubectl apply -f ../kubernetes/playwright-observer.yaml
   kubectl apply -f ../kubernetes/parser-normalizer.yaml
   kubectl apply -f ../kubernetes/feature-builder.yaml
   kubectl apply -f ../kubernetes/valuation-engine.yaml
   kubectl apply -f ../kubernetes/offer-engine.yaml
   ```

4. **Verify Health Endpoint**
   ```bash
   API_URL=$(terraform output -raw api_gateway_url)
   curl $API_URL/api/v1/health
   ```

5. **Test API Endpoints**
   ```bash
   # Test /appraise
   curl -X POST $API_URL/api/v1/appraise \
     -H "Content-Type: application/json" \
     -d '{"vin": "1HGBH41JXMN109186"}'
   
   # Test /vin/history
   curl "$API_URL/api/v1/vin/history?vin=1HGBH41JXMN109186"
   
   # Test /vin/value
   curl "$API_URL/api/v1/vin/value?vin=1HGBH41JXMN109186"
   ```

## Verification Checklist

- [ ] VPC created with public/private subnets
- [ ] KMS key created and accessible
- [ ] Secrets Manager secrets created
- [ ] S3 buckets created with encryption
- [ ] EKS cluster accessible via kubectl
- [ ] All namespaces created
- [ ] MSK cluster healthy
- [ ] Redshift cluster accessible
- [ ] Redshift schema initialized
- [ ] SageMaker pipelines created
- [ ] Bedrock agent and KB created
- [ ] API Gateway endpoints responding
- [ ] CloudTrail logging enabled
- [ ] Config rules active
- [ ] Health endpoint returns 200

## Rollback Procedure

If deployment fails:

1. **Partial Rollback**: Use `terraform destroy -target=<module>` for failed modules
2. **Full Rollback**: `terraform destroy` (destroys all resources)
3. **State Recovery**: Restore from S3 backend if state is corrupted

## Monitoring During Deployment

Watch CloudWatch logs:

```bash
# EKS cluster creation
aws logs tail /aws/eks/aim-cluster/cluster --follow

# Lambda function logs
aws logs tail /aws/lambda/aim-prod-redshift-schema-init --follow

# API Gateway logs
aws logs tail /aws/apigateway/aim-prod --follow
```
