#!/bin/bash
# ReLoop AWS Deployment Script (Free Tier / $70 credits)
# Uses: ECR + ECS Fargate + MongoDB Atlas + S3
#
# Prerequisites:
# - AWS CLI configured (aws configure)
# - Docker installed
# - MongoDB Atlas cluster (free M0 tier)
#
# Cost estimate on free tier:
# - ECS Fargate: ~$0.04/hour for 0.5vCPU + 1GB RAM = ~$30/month
# - S3: 5GB free, then $0.023/GB
# - ECR: 500MB free storage
# - CloudWatch Logs: 5GB free
# - Bedrock: pay-per-token (Claude Sonnet ~$3/1M input tokens)
# Total: ~$30-40/month within $70 credits

set -e

REGION="ap-south-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="reloop-backend"
CLUSTER_NAME="reloop-cluster"
SERVICE_NAME="reloop-service"

echo "=== ReLoop AWS Deployment ==="
echo "Account: $ACCOUNT_ID"
echo "Region: $REGION"

# 1. Create ECR repository (if not exists)
echo "[1/6] Creating ECR repository..."
aws ecr describe-repositories --repository-names $ECR_REPO --region $REGION 2>/dev/null || \
  aws ecr create-repository --repository-name $ECR_REPO --region $REGION

# 2. Build and push Docker image
echo "[2/6] Building and pushing Docker image..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
docker build -t $ECR_REPO ./backend
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# 3. Create ECS cluster (if not exists)
echo "[3/6] Creating ECS cluster..."
aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION | grep -q "ACTIVE" || \
  aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $REGION

# 4. Create S3 bucket for uploads
echo "[4/6] Creating S3 bucket..."
S3_BUCKET="reloop-uploads-$ACCOUNT_ID"
aws s3 mb s3://$S3_BUCKET --region $REGION 2>/dev/null || true
aws s3api put-bucket-cors --bucket $S3_BUCKET --cors-configuration '{
  "CORSRules": [{"AllowedOrigins": ["*"], "AllowedMethods": ["GET"], "AllowedHeaders": ["*"]}]
}'

# 5. Store secrets in SSM Parameter Store
echo "[5/6] Storing secrets in SSM..."
echo "  (Ensure you've set these via AWS Console or CLI)"
echo "  /reloop/MONGO_URI"
echo "  /reloop/JWT_SECRET"
echo "  /reloop/WEBHOOK_SECRET"
echo "  /reloop/RAZORPAY_KEY_ID"
echo "  /reloop/RAZORPAY_KEY_SECRET"
echo "  /reloop/S3_BUCKET = $S3_BUCKET"
echo "  /reloop/CORS_ORIGINS = https://your-domain.com"

# 6. Register task definition and create service
echo "[6/6] Registering task definition..."
sed -e "s/ACCOUNT_ID/$ACCOUNT_ID/g" deploy/aws/task-definition.json > /tmp/reloop-task.json
aws ecs register-task-definition --cli-input-json file:///tmp/reloop-task.json --region $REGION

echo ""
echo "=== Deployment complete ==="
echo "Next steps:"
echo "1. Set SSM parameters (secrets) via AWS Console"
echo "2. Create ECS service: aws ecs create-service --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --task-definition reloop --desired-count 1 --launch-type FARGATE --network-configuration '...'"
echo "3. Set up ALB for HTTPS"
echo ""
echo "For demo mode, set APP_MODE=demo in task environment."
echo "For production, set APP_MODE=production."
