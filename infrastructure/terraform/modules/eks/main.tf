# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"
  
  cluster_name    = var.cluster_name
  cluster_version = var.eks_version
  
  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids
  
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true
  
  cluster_enabled_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]
  
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
  
  # EKS Managed Node Groups
  eks_managed_node_groups = {
    main = {
      min_size     = var.node_min_size
      max_size     = var.node_max_size
      desired_size = var.node_desired_size
      
      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"
      
      labels = {
        role = "general"
      }
      
      # Enable encryption
      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 100
            volume_type           = "gp3"
            encrypted             = true
            delete_on_termination = true
          }
        }
      }
    }
  }
  
  # IRSA (IAM Roles for Service Accounts)
  enable_irsa = true
  
  tags = var.tags
}

# Kubernetes namespaces
resource "kubernetes_namespace" "namespaces" {
  for_each = toset(var.namespaces)
  
  metadata {
    name = each.value
    labels = {
      managed-by = "terraform"
    }
  }
  
  depends_on = [module.eks]
}

# Network policies for namespace isolation
resource "kubernetes_network_policy" "namespace_isolation" {
  for_each = toset(var.namespaces)
  
  metadata {
    name      = "${each.value}-isolation"
    namespace = kubernetes_namespace.namespaces[each.value].metadata[0].name
  }
  
  spec {
    pod_selector {}
    policy_types = ["Ingress", "Egress"]
    
    # Allow ingress from same namespace only
    ingress {
      from {
        namespace_selector {
          match_labels = {
            name = each.value
          }
        }
      }
    }
    
    # Allow egress to MSK, Redshift, S3
    egress {
      to {}
    }
  }
  
  depends_on = [kubernetes_namespace.namespaces]
}

# Service accounts with IRSA annotations
resource "kubernetes_service_account" "playwright_observer" {
  for_each = toset(["auction-manheim", "auction-acv", "auction-adesa"])
  
  metadata {
    name      = "playwright-observer"
    namespace = each.value
    annotations = {
      "eks.amazonaws.com/role-arn" = var.playwright_observer_role_arn
    }
  }
  
  depends_on = [kubernetes_namespace.namespaces]
}

resource "kubernetes_service_account" "parser_normalizer" {
  metadata {
    name      = "parser-normalizer"
    namespace = "vin-graph"
    annotations = {
      "eks.amazonaws.com/role-arn" = var.parser_normalizer_role_arn
    }
  }
  
  depends_on = [kubernetes_namespace.namespaces]
}

resource "kubernetes_service_account" "feature_builder" {
  metadata {
    name      = "feature-builder"
    namespace = "vin-graph"
    annotations = {
      "eks.amazonaws.com/role-arn" = var.feature_builder_role_arn
    }
  }
  
  depends_on = [kubernetes_namespace.namespaces]
}

resource "kubernetes_service_account" "valuation_engine" {
  metadata {
    name      = "valuation-engine"
    namespace = "valuation"
    annotations = {
      "eks.amazonaws.com/role-arn" = var.valuation_engine_role_arn
    }
  }
  
  depends_on = [kubernetes_namespace.namespaces]
}

resource "kubernetes_service_account" "offer_engine" {
  metadata {
    name      = "offer-engine"
    namespace = "guarantee"
    annotations = {
      "eks.amazonaws.com/role-arn" = var.offer_engine_role_arn
    }
  }
  
  depends_on = [kubernetes_namespace.namespaces]
}

resource "kubernetes_service_account" "compliance" {
  for_each = toset(["vault-rotator", "audit-logger"])
  
  metadata {
    name      = each.value
    namespace = "compliance"
    annotations = {
      "eks.amazonaws.com/role-arn" = var.compliance_role_arn
    }
  }
  
  depends_on = [kubernetes_namespace.namespaces]
}
