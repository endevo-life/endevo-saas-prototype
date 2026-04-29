# Quick CI/CD Setup Guide - 30 Minutes

## 🚀 Get Your CI/CD Pipeline Running in 30 Minutes

### Prerequisites
- GitHub repository (you have this ✅)
- GitHub account with admin access
- Choose deployment platform (Vercel recommended for Next.js)

---

## Step 1: Choose Deployment Platform (5 minutes)

### Option A: Vercel (Recommended - Easiest)

**Pros:** Zero config, automatic previews, built for Next.js, free tier
**Setup time:** 5 minutes

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Deploy"
5. Done! ✅

### Option B: AWS Amplify

**Pros:** More control, AWS ecosystem, scalable
**Setup time:** 30 minutes

See [CICD_SETUP.md](./CICD_SETUP.md) for detailed instructions

---

## Step 2: Add GitHub Secrets (10 minutes)

Go to: **Repository → Settings → Secrets and Variables → Actions → New repository secret**

### For Vercel:
```bash
VERCEL_TOKEN          # Get from vercel.com/account/tokens
VERCEL_ORG_ID         # Get from vercel.com/[team]/settings
VERCEL_PROJECT_ID     # Get from project settings
```

### For AWS:
```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

---

## Step 3: Enable GitHub Actions (2 minutes)

The workflow files are already created in `.github/workflows/`:
- ✅ `ci.yml` - Runs tests on every PR
- ✅ `deploy-dev.yml` - Deploys to development
- ✅ `deploy-prod.yml` - Deploys to production

**Enable them:**
```bash
# If workflows are disabled, enable them:
gh workflow enable ci.yml
gh workflow enable deploy-dev.yml
gh workflow enable deploy-prod.yml
```

Or via GitHub UI:
1. Go to **Actions** tab
2. Select workflow
3. Click "Enable workflow"

---

## Step 4: Test the Pipeline (10 minutes)

### Test 1: Create a PR (triggers CI)
```bash
# 1. Create test branch
git checkout -b test/ci-pipeline

# 2. Make a small change
echo "// CI test" >> src/app/page.tsx

# 3. Commit and push
git add .
git commit -m "test: CI pipeline"
git push -u origin test/ci-pipeline

# 4. Create PR
gh pr create --title "Test CI pipeline" --body "Testing automated CI"

# 5. Watch Actions run
# Go to: https://github.com/[username]/endevo-saas-prototype/actions
```

**Expected Result:** ✅ CI workflow runs tests and build

### Test 2: Merge to main (triggers deployment)
```bash
# 1. Merge PR
gh pr merge --auto --squash

# 2. Watch deployment
# Go to: Actions tab → Deploy to Development workflow
```

**Expected Result:** ✅ Deployment workflow runs

---

## Step 5: Configure Environments (5 minutes)

Go to: **Repository → Settings → Environments**

### Create 3 Environments:

**1. development**
- No protection rules
- Secrets: Same as repository secrets

**2. qa** (optional for now)
- Protection rules: None
- Secrets: Same as repository secrets

**3. production**
- Protection rules:
  - ✅ Required reviewers: 1 (add yourself)
  - ✅ Wait timer: 5 minutes
  - ✅ Deployment branches: main only
- Secrets: Add production-specific secrets

---

## 🎯 Verification Checklist

- [ ] GitHub workflows are in `.github/workflows/`
- [ ] Deployment platform configured (Vercel or AWS)
- [ ] GitHub secrets added
- [ ] Environments created
- [ ] Test PR successfully ran CI
- [ ] Merge to main triggered deployment

---

## 🚀 What Happens Now?

### Every Pull Request:
1. ✅ Runs linting (ESLint)
2. ✅ Type checks (TypeScript)
3. ✅ Builds the project
4. ✅ Security scan (npm audit)
5. ✅ Comments status on PR

### Every Merge to Main:
1. ✅ Runs CI checks
2. ✅ Builds production bundle
3. ✅ Deploys to development
4. ✅ (Optional) Auto-deploys to QA

### Manual Production Deploy:
1. ✅ Create GitHub Release
2. ✅ Requires approval
3. ✅ Runs full test suite
4. ✅ Deploys to production
5. ✅ Sends notifications

---

## 📊 Monitor Your Deployments

### Vercel Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- See all deployments, logs, and analytics

### GitHub Actions
- Go to **Actions** tab in repository
- See all workflow runs and logs

---

## 🔧 Customize Your Pipeline

### Enable Vercel Deployment

Edit `.github/workflows/deploy-dev.yml`:

```yaml
# Change this line from:
if: false  # Enable this when ready

# To:
if: true  # Vercel deployment enabled
```

Then commit:
```bash
git add .github/workflows/deploy-dev.yml
git commit -m "Enable Vercel deployment"
git push
```

### Add Slack Notifications

1. Create Slack webhook: [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)
2. Add to GitHub Secrets: `SLACK_WEBHOOK`
3. Uncomment Slack steps in workflows

### Add Email Notifications

1. Generate app password (Gmail: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords))
2. Add secrets: `EMAIL_USERNAME`, `EMAIL_PASSWORD`
3. Uncomment email steps in `deploy-prod.yml`

---

## 🆘 Troubleshooting

### Workflow not running?
```bash
# Check if workflows are enabled
gh workflow list

# Enable specific workflow
gh workflow enable <workflow-name>
```

### Build failing?
```bash
# Check logs in Actions tab
# Common issues:
# - Missing environment variables
# - npm ci vs npm install
# - TypeScript errors
```

### Deployment not working?
```bash
# Verify secrets are set
gh secret list

# Check Vercel logs
vercel logs [deployment-url]

# Test build locally
npm run build
```

---

## 📚 Next Steps

1. **Add Tests** - Write unit tests and enable test step
2. **Add Monitoring** - Set up Sentry for error tracking
3. **Add Database** - Connect to Supabase/PostgreSQL
4. **Add Secrets** - Configure production secrets
5. **Add Backups** - Set up database backup automation

See [CICD_SETUP.md](./CICD_SETUP.md) for advanced configuration

---

## 🎉 You're Done!

Your CI/CD pipeline is now active! Every commit goes through:
1. Automated testing
2. Security scanning
3. Automated deployment

**No more manual deployments!** 🚀

---

## 💡 Pro Tips

1. **Use Branch Protection** - Require CI to pass before merge
   - Settings → Branches → Add rule
   - Require status checks: CI - Test & Lint

2. **Use Preview Deployments** - Vercel creates preview for every PR
   - Automatic staging URL
   - Test changes before merging

3. **Use Semantic Versioning** - Tag releases properly
   ```bash
   git tag v1.0.0
   git push --tags
   ```

4. **Monitor Your Pipelines** - Check Actions tab weekly
   - Look for failing workflows
   - Update dependencies regularly

---

Need help? See the complete guide: [CICD_SETUP.md](./CICD_SETUP.md)
