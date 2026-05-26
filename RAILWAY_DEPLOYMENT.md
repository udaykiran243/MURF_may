# MURF - Railway Deployment Guide

Quick start for deploying MURF to Railway.app (recommended free option)

## Prerequisites

- ✅ GitHub account
- ✅ Code pushed to GitHub repository
- ✅ Railway account (free signup at railway.app)

## Step 1: Prepare GitHub Repository

```bash
# If not already done:
cd c:\Users\udayk\Downloads\MURF

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/MURF_may.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

### Via Railway CLI (Fastest)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Navigate to project
cd c:\Users\udayk\Downloads\MURF

# Initialize Railway project
railway init

# Set up database service
railway add --service postgresql

# Deploy
railway up
```

### Via Web Dashboard (Easiest)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `MURF_may` repository
6. Click "Deploy"

Railway will auto-detect:
- Docker Compose configuration
- Multiple services (backend, frontend, database)
- Environment requirements

## Step 3: Configure Environment Variables

In Railway Dashboard:

1. Go to your project
2. Click on "backend" service
3. Go to "Variables" tab
4. Add these variables:

```
OPENAI_API_KEY=sk-your-openai-key-here
MURF_API_KEY=ap2_your-murf-key-here
JWT_SECRET=your-very-secret-key-min-32-characters
DATABASE_URL=[will be auto-filled by PostgreSQL service]
```

## Step 4: Database Setup

Railway automatically creates PostgreSQL service if docker-compose.yml includes it.

**To use your existing Neon database instead:**

1. Replace `DATABASE_URL` with your Neon URL:
```
postgresql://neondb_owner:npg_2oW6VhlJvpTt@ep-twilight-sun-aq2g85h8-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

2. Remove the `postgres` service from docker-compose.yml or set it in Railway to skip

## Step 5: Verify Deployment

Once deployed, you'll see:

```
✅ Frontend URL: https://murf-frontend-prod-xxxx.railway.app
✅ Backend URL: https://murf-backend-prod-xxxx.railway.app
```

Test endpoints:

```bash
# Backend health check
curl https://murf-backend-prod-xxxx.railway.app/docs

# Frontend
https://murf-frontend-prod-xxxx.railway.app
```

## Step 6: Update Frontend API URL

Update frontend to use deployed backend:

Edit [frontend/app/providers.tsx](frontend/app/providers.tsx):

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window === 'undefined' ? 'http://localhost:8000' : 'https://murf-backend-prod-xxxx.railway.app');
```

Or set environment variable in Railway Dashboard:
```
NEXT_PUBLIC_API_URL=https://murf-backend-prod-xxxx.railway.app
```

## Cost Breakdown

| Item | Cost |
|------|------|
| Backend (FastAPI uvicorn) | $1-2/month |
| Frontend (Next.js) | $0-1/month |
| PostgreSQL | $0 (if using Neon) or $1-5/month |
| **Total** | **$1-8/month** |

Railway's $5 free monthly credit usually covers everything!

## Troubleshooting

### Issue: Deployment fails with "Docker build error"
**Solution:** Check Dockerfile paths, ensure requirements.txt and package.json exist

### Issue: Backend can't connect to database
**Solution:** Verify DATABASE_URL environment variable, check PostgreSQL service is running

### Issue: Frontend shows "Cannot GET /"
**Solution:** Verify frontend build was successful, check NEXT_PUBLIC_API_URL is set

### Issue: Voice API returns 401/403
**Solution:** Check MURF_API_KEY and OPENAI_API_KEY are correctly set

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Railway (or Vercel for better performance)
3. Set environment variables
4. Test chat functionality with live app
5. Monitor logs in Railway Dashboard
6. Share your app URL!

## Railway Dashboard Tips

- **Logs:** View real-time logs for debugging
- **Deployments:** Rollback to previous versions if needed
- **Metrics:** Monitor CPU, memory, network usage
- **Shell:** SSH into running containers for debugging

## Need Help?

- Railway Docs: https://docs.railway.app
- MURF Deployment: See DEPLOYMENT_STEPS.md
