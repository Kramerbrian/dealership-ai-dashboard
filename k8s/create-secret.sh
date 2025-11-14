#!/bin/bash
# Create Kubernetes Secret for Agent API token
# 
# Usage:
#   ./k8s/create-secret.sh
#   ./k8s/create-secret.sh sk-proj-your-token-here

set -euo pipefail

NAMESPACE="${NAMESPACE:-dealershipai}"
SECRET_NAME="agentapi-cred"
KEY_NAME="AGENTAPI_TOKEN"

# Get token from argument or prompt
if [ $# -eq 1 ]; then
  TOKEN="$1"
else
  echo "Enter your Agent API token (starts with sk-proj-...):"
  read -s TOKEN
  echo
fi

if [ -z "$TOKEN" ]; then
  echo "ERROR: Token cannot be empty"
  exit 1
fi

echo "Creating secret ${SECRET_NAME} in namespace ${NAMESPACE}..."

kubectl -n "${NAMESPACE}" create secret generic "${SECRET_NAME}" \
  --from-literal="${KEY_NAME}=${TOKEN}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secret created successfully!"
echo ""
echo "To verify:"
echo "  kubectl -n ${NAMESPACE} get secret ${SECRET_NAME}"
echo ""
echo "To view (base64 encoded):"
echo "  kubectl -n ${NAMESPACE} get secret ${SECRET_NAME} -o jsonpath='{.data.${KEY_NAME}}' | base64 -d"

