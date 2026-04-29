# CI/CD Setup Guide: GitHub Actions + AWS

## 🎯 Overview

This guide sets up a complete CI/CD pipeline for ENDevo with:
- **3 Environments:** Development, QA (Staging), Production
- **Automated Testing** on every PR
- **Progressive Deployment** (dev → qa → prod)
- **Rollback Capability**
- **Security Scanning**

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                                                              │
│  Feature Branch → PR → Run Tests → Merge to main           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions Workflow                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│     DEV      │      │      QA      │      │     PROD     │
│              │      │   (Staging)  │      │              │
│ Auto-deploy  │  →   │ Auto-deploy  │  →   │ Manual gate  │
│ on merge     │      │ after dev    │      │ + approval   │
└──────────────┘      └──────────────┘      └──────────────┘
     AWS               AWS                    AWS
  Amplify/ECS        Amplify/ECS           Amplify/ECS
```

## 📁 Project Structure

Create these files in your repository:

```
endevo-saas-prototype/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Continuous Integration
│       ├── deploy-dev.yml         # Deploy to Dev
│       ├── deploy-qa.yml          # Deploy to QA
│       ├── deploy-prod.yml        # Deploy to Production
│       └── rollback.yml           # Emergency rollback
├── infrastructure/
│   ├── terraform/                 # Infrastructure as Code
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── qa/
│   │   │   └── prod/
│   │   └── modules/
│   └── scripts/
│       ├── deploy.sh
│       └── health-check.sh
└── docs/
    └── CICD_SETUP.md             # This file
```

---

## 🔧 Step 1: AWS Infrastructure Setup

### Option A: AWS Amplify (Easiest - Recommended for Next.js)

**Benefits:**
- Zero-config deployments
- Automatic preview environments
- Built-in CDN
- SSR support

**Setup:**

1. **Install Amplify CLI**
```bash
npm install -g @aws-amplify/cli
amplify configure
```

2. **Initialize Amplify**
```bash
amplify init

# Choose:
# - Environment: dev
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source directory: src
# - Build directory: .next
# - Build command: npm run build
# - Start command: npm run start
```

3. **Add Hosting**
```bash
amplify add hosting

# Choose:
# - Amplify Console (Managed hosting)
# - Continuous deployment (Git-based)
```

4. **Create Environment Config**
```bash
# Create amplify.yml in project root
```

### Option B: AWS ECS + Fargate (More Control)

**Benefits:**
- Full container control
- Better for microservices
- More customizable

**Setup:**

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name endevo-saas-dev
aws ecr create-repository --repository-name endevo-saas-qa
aws ecr create-repository --repository-name endevo-saas-prod
```

2. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name endevo-dev
aws ecs create-cluster --cluster-name endevo-qa
aws ecs create-cluster --cluster-name endevo-prod
```

---

## 📝 Step 2: GitHub Actions Workflows

### 2.1 Continuous Integration (CI)

Create `.github/workflows/ci.yml`:

```yaml
name: CI - Test & Lint

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  NODE_VERSION: '20.x'

jobs:
  test:
    name: 🧪 Test & Lint
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Run ESLint
        run: npm run lint

      - name: 🎨 Check TypeScript
        run: npx tsc --noEmit

      - name: 🧪 Run tests
        run: npm test
        if: false  # Enable when you have tests

      - name: 🏗️ Build project
        run: npm run build

      - name: 📊 Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: .next/
          retention-days: 7

  security:
    name: 🔒 Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔍 Run npm audit
        run: npm audit --production --audit-level=moderate
        continue-on-error: true

      - name: 🛡️ Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  lighthouse:
    name: 🚦 Lighthouse Performance
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🏗️ Build project
        run: npm run build

      - name: 🚦 Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        continue-on-error: true
```

### 2.2 Deploy to Development

Create `.github/workflows/deploy-dev.yml`:

```yaml
name: 🚀 Deploy to Development

on:
  push:
    branches: [develop, main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ENVIRONMENT: dev

jobs:
  deploy:
    name: 🚀 Deploy to Dev
    runs-on: ubuntu-latest
    environment:
      name: development
      url: https://dev.endevo.com

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔑 Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # Option A: Deploy to AWS Amplify
      - name: 🚀 Deploy to AWS Amplify
        run: |
          npm install -g @aws-amplify/cli
          amplify publish --yes
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      # Option B: Deploy to ECS (if using containers)
      # - name: 🐳 Build and push Docker image
      #   run: |
      #     aws ecr get-login-password --region ${{ env.AWS_REGION }} | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
      #     docker build -t endevo-saas-dev .
      #     docker tag endevo-saas-dev:latest ${{ secrets.ECR_REGISTRY }}/endevo-saas-dev:${{ github.sha }}
      #     docker push ${{ secrets.ECR_REGISTRY }}/endevo-saas-dev:${{ github.sha }}

      # - name: 🚢 Deploy to ECS
      #   run: |
      #     aws ecs update-service --cluster endevo-dev --service endevo-service --force-new-deployment

      - name: 🏥 Health check
        run: |
          sleep 30
          curl -f https://dev.endevo.com/api/health || exit 1

      - name: 📢 Slack notification
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Dev deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        continue-on-error: true
```

### 2.3 Deploy to QA (Staging)

Create `.github/workflows/deploy-qa.yml`:

```yaml
name: 🧪 Deploy to QA (Staging)

on:
  workflow_run:
    workflows: ["🚀 Deploy to Development"]
    types: [completed]
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ENVIRONMENT: qa

jobs:
  deploy:
    name: 🧪 Deploy to QA
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    environment:
      name: qa
      url: https://qa.endevo.com

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔑 Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: 🚀 Deploy to AWS Amplify (QA)
        run: |
          npm install -g @aws-amplify/cli
          amplify env checkout qa
          amplify publish --yes
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: 🧪 Run smoke tests
        run: |
          npm install -g newman
          newman run tests/postman/smoke-tests.json \
            --env-var "BASE_URL=https://qa.endevo.com"
        continue-on-error: true

      - name: 🏥 Health check
        run: |
          sleep 30
          curl -f https://qa.endevo.com/api/health || exit 1

      - name: 📢 Notify QA team
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: 'success'
          text: '✅ QA environment updated! Ready for testing.'
          webhook_url: ${{ secrets.SLACK_WEBHOOK_QA }}
```

### 2.4 Deploy to Production

Create `.github/workflows/deploy-prod.yml`:

```yaml
name: 🎯 Deploy to Production

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true
        type: string

env:
  AWS_REGION: us-east-1
  ENVIRONMENT: prod

jobs:
  pre-deployment:
    name: 🔍 Pre-deployment checks
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: ✅ Verify QA deployment
        run: |
          curl -f https://qa.endevo.com/api/health || (echo "QA is unhealthy!" && exit 1)

      - name: 🧪 Run full test suite
        run: |
          npm ci
          npm run test:all
        continue-on-error: false

  deploy:
    name: 🎯 Deploy to Production
    runs-on: ubuntu-latest
    needs: pre-deployment
    environment:
      name: production
      url: https://endevo.com

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔑 Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: ${{ env.AWS_REGION }}

      - name: 📸 Take database backup
        run: |
          aws rds create-db-snapshot \
            --db-snapshot-identifier endevo-prod-pre-deploy-$(date +%Y%m%d-%H%M%S) \
            --db-instance-identifier endevo-prod

      - name: 🚀 Deploy to AWS Amplify (Production)
        run: |
          npm install -g @aws-amplify/cli
          amplify env checkout prod
          amplify publish --yes
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}

      - name: ⏳ Wait for deployment
        run: sleep 60

      - name: 🏥 Production health check
        run: |
          for i in {1..5}; do
            if curl -f https://endevo.com/api/health; then
              echo "Health check passed!"
              exit 0
            fi
            echo "Attempt $i failed, retrying..."
            sleep 10
          done
          echo "Health check failed after 5 attempts"
          exit 1

      - name: 🧪 Run critical path tests
        run: |
          npm install -g newman
          newman run tests/postman/critical-path.json \
            --env-var "BASE_URL=https://endevo.com"

      - name: 📊 Record deployment
        run: |
          echo "Deployment successful at $(date)" >> deployments.log
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add deployments.log
          git commit -m "Record production deployment"
          git push

  post-deployment:
    name: 📊 Post-deployment
    runs-on: ubuntu-latest
    needs: deploy
    if: always()

    steps:
      - name: 📢 Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ needs.deploy.result }}
          text: |
            🎯 Production Deployment ${{ needs.deploy.result }}
            Version: ${{ github.ref_name }}
            URL: https://endevo.com
          webhook_url: ${{ secrets.SLACK_WEBHOOK_PROD }}

      - name: 📧 Email stakeholders
        if: success()
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: '✅ ENDevo Production Deployment Successful'
          to: stakeholders@endevo.com
          from: devops@endevo.com
          body: |
            Production deployment completed successfully.

            Version: ${{ github.ref_name }}
            Deployed at: ${{ github.event.head_commit.timestamp }}
            URL: https://endevo.com
```

### 2.5 Emergency Rollback

Create `.github/workflows/rollback.yml`:

```yaml
name: ⚠️ Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - dev
          - qa
          - prod
      version:
        description: 'Version to rollback to (leave empty for previous)'
        required: false
        type: string

jobs:
  rollback:
    name: ⚠️ Rollback ${{ github.event.inputs.environment }}
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.version || 'HEAD~1' }}

      - name: 🔑 Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: 🔙 Rollback deployment
        run: |
          npm install -g @aws-amplify/cli
          amplify env checkout ${{ github.event.inputs.environment }}
          amplify publish --yes

      - name: 🏥 Verify rollback
        run: |
          sleep 30
          curl -f https://${{ github.event.inputs.environment }}.endevo.com/api/health

      - name: 📢 Alert team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            ⚠️ ROLLBACK EXECUTED
            Environment: ${{ github.event.inputs.environment }}
            Version: ${{ github.event.inputs.version || 'previous' }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🔐 Step 3: GitHub Secrets Setup

Add these secrets to your GitHub repository:

### Repository Settings → Secrets and Variables → Actions

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID           # IAM user for dev/qa
AWS_SECRET_ACCESS_KEY       # IAM user for dev/qa
AWS_ACCESS_KEY_ID_PROD      # Separate IAM user for production
AWS_SECRET_ACCESS_KEY_PROD  # Production secret

# Container Registry (if using ECS)
ECR_REGISTRY               # 123456789.dkr.ecr.us-east-1.amazonaws.com

# Database
DATABASE_URL_DEV           # Supabase/PostgreSQL dev
DATABASE_URL_QA            # Supabase/PostgreSQL qa
DATABASE_URL_PROD          # Supabase/PostgreSQL prod

# Application Secrets
NEXTAUTH_SECRET_DEV
NEXTAUTH_SECRET_QA
NEXTAUTH_SECRET_PROD
NEXTAUTH_URL_DEV           # https://dev.endevo.com
NEXTAUTH_URL_QA            # https://qa.endevo.com
NEXTAUTH_URL_PROD          # https://endevo.com

# Third-party Services
SLACK_WEBHOOK              # For dev/qa notifications
SLACK_WEBHOOK_QA           # QA team channel
SLACK_WEBHOOK_PROD         # Production alerts
SNYK_TOKEN                 # Security scanning
EMAIL_USERNAME             # For production notifications
EMAIL_PASSWORD

# Supabase
NEXT_PUBLIC_SUPABASE_URL_DEV
NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV
NEXT_PUBLIC_SUPABASE_URL_QA
NEXT_PUBLIC_SUPABASE_ANON_KEY_QA
NEXT_PUBLIC_SUPABASE_URL_PROD
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
```

### How to add secrets:
```bash
# Via GitHub CLI
gh secret set AWS_ACCESS_KEY_ID --body "YOUR_KEY_HERE"

# Or via GitHub UI:
# Repository → Settings → Secrets → New repository secret
```

---

## 🌍 Step 4: Environment Configuration

### 4.1 Create Environment Files

Create `.env.development`, `.env.qa`, `.env.production`:

```bash
# .env.development
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_API_URL=https://dev-api.endevo.com
NEXT_PUBLIC_APP_URL=https://dev.endevo.com
DATABASE_URL=${{ secrets.DATABASE_URL_DEV }}
NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET_DEV }}
NEXTAUTH_URL=https://dev.endevo.com
```

### 4.2 Create Amplify Configuration

Create `amplify.yml`:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - env | grep -e NEXT_PUBLIC_ >> .env.production
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
    appRoot: /
```

### 4.3 GitHub Environments Setup

1. Go to **Repository → Settings → Environments**
2. Create three environments:

**Development:**
- No protection rules
- Auto-deploys on merge to main

**QA:**
- Required reviewers: QA team (optional)
- Auto-deploys after dev succeeds

**Production:**
- Required reviewers: 2 approvers
- Wait timer: 5 minutes
- Protected branch: main only

---

## 🚀 Step 5: Deployment Scripts

Create `infrastructure/scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh [dev|qa|prod] [version]"
  exit 1
fi

echo "🚀 Deploying to $ENVIRONMENT..."

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
  export $(cat .env.$ENVIRONMENT | xargs)
fi

# Build
echo "📦 Building application..."
npm ci
npm run build

# Deploy to AWS Amplify
echo "🚀 Deploying to AWS..."
amplify env checkout $ENVIRONMENT
amplify publish --yes

# Health check
echo "🏥 Running health check..."
sleep 30
curl -f $NEXT_PUBLIC_APP_URL/api/health || exit 1

echo "✅ Deployment to $ENVIRONMENT complete!"
```

Create `infrastructure/scripts/health-check.sh`:

```bash
#!/bin/bash
set -e

URL=$1
MAX_RETRIES=5
RETRY_DELAY=10

echo "🏥 Health checking $URL..."

for i in $(seq 1 $MAX_RETRIES); do
  if curl -f "$URL/api/health"; then
    echo "✅ Health check passed!"
    exit 0
  fi

  echo "⚠️ Attempt $i failed, retrying in ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1
```

Make scripts executable:
```bash
chmod +x infrastructure/scripts/*.sh
```

---

## 📊 Step 6: Monitoring & Alerting

### 6.1 Create Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    // const dbHealthy = await checkDatabase();

    // Check external services
    // const servicesHealthy = await checkExternalServices();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NEXT_PUBLIC_ENV,
      version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      checks: {
        database: 'ok',
        services: 'ok',
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
```

### 6.2 AWS CloudWatch Alarms

Create alarms for each environment:

```bash
# Create CloudWatch alarm for production
aws cloudwatch put-metric-alarm \
  --alarm-name endevo-prod-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789:prod-alerts
```

---

## 🎯 Step 7: Complete Setup Instructions

### Day 1: AWS Setup (2-3 hours)

```bash
# 1. Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# 2. Configure AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Output (json)

# 3. Create IAM users for CI/CD
aws iam create-user --user-name github-actions-dev
aws iam create-user --user-name github-actions-prod

# 4. Attach policies
aws iam attach-user-policy \
  --user-name github-actions-dev \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify

# 5. Create access keys
aws iam create-access-key --user-name github-actions-dev
# Save these keys as GitHub secrets!
```

### Day 2: GitHub Setup (1-2 hours)

```bash
# 1. Create workflow directory
mkdir -p .github/workflows

# 2. Copy workflow files (from above)
# ci.yml, deploy-dev.yml, deploy-qa.yml, deploy-prod.yml, rollback.yml

# 3. Add secrets to GitHub
# Go to: Repository → Settings → Secrets → Actions
# Add all secrets listed in Step 3

# 4. Create environments
# Go to: Repository → Settings → Environments
# Create: development, qa, production
# Configure protection rules for production

# 5. Commit and push
git add .github/
git commit -m "Add CI/CD workflows"
git push
```

### Day 3: Test Deployment (1-2 hours)

```bash
# 1. Create a test branch
git checkout -b test/cicd-setup

# 2. Make a small change
echo "// Test deployment" >> src/app/page.tsx

# 3. Create PR
gh pr create --title "Test CI/CD pipeline" --body "Testing automated deployment"

# 4. Watch GitHub Actions run
# Go to: Actions tab in GitHub

# 5. Merge to main
gh pr merge --auto --squash

# 6. Verify deployment
curl https://dev.endevo.com/api/health
```

---

## ✅ Verification Checklist

- [ ] AWS credentials configured
- [ ] IAM users created with correct permissions
- [ ] GitHub secrets added
- [ ] GitHub environments created
- [ ] Workflow files in `.github/workflows/`
- [ ] Environment config files created
- [ ] Health check endpoint working
- [ ] Test PR triggers CI workflow
- [ ] Merge to main triggers dev deployment
- [ ] Dev deployment triggers qa deployment
- [ ] Production deployment requires approval
- [ ] Rollback workflow tested
- [ ] Slack notifications working
- [ ] CloudWatch alarms configured

---

## 🚨 Troubleshooting

### Issue: Workflow not triggering
```bash
# Check if workflows are enabled
gh api repos/:owner/:repo/actions/workflows | jq '.workflows[].state'

# Enable workflow
gh workflow enable <workflow-id>
```

### Issue: AWS credentials not working
```bash
# Verify credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam get-user-policy --user-name github-actions-dev --policy-name policy-name
```

### Issue: Deployment fails
```bash
# Check Amplify logs
amplify console

# Check CloudWatch logs
aws logs tail /aws/amplify/app-id --follow
```

---

## 🎓 Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Use separate AWS accounts** - Isolate prod from dev/qa
3. **Require reviews for prod** - At least 2 approvers
4. **Test in QA first** - Never deploy directly to prod
5. **Monitor everything** - CloudWatch, Sentry, LogRocket
6. **Have rollback plan** - Test rollback workflow quarterly
7. **Document incidents** - Create postmortems
8. **Automate testing** - More tests = more confidence

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Amplify CI/CD](https://docs.amplify.aws/guides/hosting/git-based-deployments/q/platform/js/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [AWS ECS Deployment](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)

---

Your CI/CD pipeline is now ready! 🚀

Next steps: See [MONITORING_SETUP.md](./MONITORING_SETUP.md) for observability
