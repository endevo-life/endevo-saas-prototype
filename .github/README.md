# GitHub Actions Workflows

This directory contains the CI/CD pipeline configuration for ENDevo SaaS platform.

## 📁 Workflow Files

### 🧪 [ci.yml](workflows/ci.yml)
**Continuous Integration** - Runs on every PR and push to main/develop
- Linting (ESLint)
- Type checking (TypeScript)
- Building the project
- Security scanning (npm audit)
- Build artifact upload

**Triggers:** Pull requests and pushes to `main` or `develop`

### 🚀 [deploy-dev.yml](workflows/deploy-dev.yml)
**Development Deployment** - Auto-deploys to development environment
- Builds production bundle
- Deploys to dev environment
- Posts deployment status

**Triggers:** Push to `main` or `develop`, or manual trigger

### 🎯 [deploy-prod.yml](workflows/deploy-prod.yml)
**Production Deployment** - Deploys to production with safeguards
- Pre-deployment validation
- Requires manual approval
- Builds production bundle
- Deploys to production
- Runs smoke tests
- Sends notifications

**Triggers:** Release published, or manual trigger with confirmation

## 🔐 Required Secrets

Add these secrets in **Repository Settings → Secrets and Variables → Actions**:

### Deployment Platform (Choose One)

**For Vercel (Recommended):**
```
VERCEL_TOKEN          # From vercel.com/account/tokens
VERCEL_ORG_ID         # From vercel.com/[team]/settings
VERCEL_PROJECT_ID     # From project settings
```

**For AWS Amplify:**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### Optional (for notifications):
```
SLACK_WEBHOOK         # For Slack notifications
EMAIL_USERNAME        # For email notifications
EMAIL_PASSWORD
```

## 🚦 Workflow Status

| Workflow | Status | Last Run |
|----------|--------|----------|
| CI | [![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml) | - |
| Deploy Dev | [![Deploy Dev](../../actions/workflows/deploy-dev.yml/badge.svg)](../../actions/workflows/deploy-dev.yml) | - |
| Deploy Prod | [![Deploy Prod](../../actions/workflows/deploy-prod.yml/badge.svg)](../../actions/workflows/deploy-prod.yml) | - |

## 🎯 Quick Start

### 1. First-time Setup (5 minutes)

```bash
# 1. Enable workflows (if disabled)
gh workflow enable ci.yml
gh workflow enable deploy-dev.yml
gh workflow enable deploy-prod.yml

# 2. Add deployment secrets
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

### 2. Test the Pipeline (10 minutes)

```bash
# Create a test PR
git checkout -b test/ci-pipeline
echo "// CI test" >> src/app/page.tsx
git add .
git commit -m "test: CI pipeline"
git push -u origin test/ci-pipeline
gh pr create --title "Test CI" --body "Testing automated CI"

# Watch it run
gh run watch
```

### 3. Enable Deployment (2 minutes)

Edit `deploy-dev.yml` and change:
```yaml
if: false  # Enable this when ready
```
to:
```yaml
if: true  # Deployment enabled
```

## 📊 How It Works

```
┌─────────────────────────────────────────────────────────┐
│              Developer pushes code                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Pull Request Created                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           CI Workflow Runs (ci.yml)                      │
│   • Linting  • Type Check  • Build  • Security         │
└─────────────────────────────────────────────────────────┘
                        ↓
                    ✅ Pass
                        ↓
┌─────────────────────────────────────────────────────────┐
│              PR Merged to Main                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│       Deploy to Dev (deploy-dev.yml)                     │
│   • Build  • Deploy  • Health Check                     │
└─────────────────────────────────────────────────────────┘
                        ↓
                (Manual Approval)
                        ↓
┌─────────────────────────────────────────────────────────┐
│       Deploy to Prod (deploy-prod.yml)                   │
│   • Validate  • Deploy  • Test  • Notify               │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Customization

### Add Slack Notifications

1. Create webhook: https://api.slack.com/messaging/webhooks
2. Add secret: `gh secret set SLACK_WEBHOOK`
3. Uncomment Slack steps in workflows

### Add Email Notifications

1. Generate app password (Gmail)
2. Add secrets: `EMAIL_USERNAME`, `EMAIL_PASSWORD`
3. Uncomment email steps in `deploy-prod.yml`

### Add Environment Variables

Edit workflow files and add to `env:` section:
```yaml
env:
  NEXT_PUBLIC_API_URL: https://api.endevo.com
  CUSTOM_VAR: value
```

### Change Deployment Trigger

Edit `on:` section in workflow files:
```yaml
on:
  push:
    branches: [main]  # Deploy only on main
  schedule:
    - cron: '0 0 * * 0'  # Weekly deployment
```

## 🆘 Troubleshooting

### Workflow not running?
```bash
# Check workflow status
gh workflow list

# View recent runs
gh run list --workflow=ci.yml

# View specific run logs
gh run view <run-id> --log
```

### Build failing?
```bash
# Common issues:
# 1. Missing secrets - check repository settings
# 2. Node version mismatch - update workflow Node version
# 3. TypeScript errors - run `npm run build` locally first
```

### Deployment not working?
```bash
# Check deployment platform:
# Vercel: vercel.com/dashboard
# AWS: console.aws.amazon.com

# Verify secrets are set:
gh secret list
```

## 📚 Documentation

- [Complete CI/CD Guide](../docs/CICD_SETUP.md)
- [Quick Setup (30 min)](../docs/QUICK_CICD_SETUP.md)
- [Deployment Checklist](../docs/DEPLOYMENT_CHECKLIST.md)

## 🎓 Best Practices

1. **Always test in dev first** - Never skip development deployment
2. **Use branch protection** - Require CI to pass before merge
3. **Keep secrets secure** - Never commit secrets to repository
4. **Monitor deployments** - Check logs after every deployment
5. **Have rollback plan** - Test rollback procedure regularly

## 🚀 Next Steps

1. ✅ Enable workflows
2. ✅ Add secrets
3. ✅ Test with a PR
4. ✅ Configure production environment
5. ✅ Set up monitoring
6. ✅ Document team procedures

## 💬 Need Help?

- Read the [Quick Setup Guide](../docs/QUICK_CICD_SETUP.md)
- Check [GitHub Actions docs](https://docs.github.com/en/actions)
- Ask in team Slack channel

---

**Status:** ✅ Workflows configured and ready to use
