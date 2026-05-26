# 🚀 Railway Deployment - Step by Step

## Prerequisites
- GitHub account
- Railway account (free)
- Your API keys ready

---

## STEP 1: Create GitHub Repository (2 minutes)

1. Open browser → https://github.com/new
2. Fill in:
   - Repository name: `MURF_may`
   - Description: "AI-powered emotional support with voice therapy"
   - Visibility: **Public**
3. **DO NOT check** "Initialize this repository with a README"
4. Click **"Create repository"**

---

## STEP 2: Push Code to GitHub (1 minute)

Open PowerShell in your project folder:

```powershell
cd c:\Users\udayk\Downloads\MURF
```

Copy & paste these 4 commands one by one:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/MURF_may.git
```
*(Replace YOUR_USERNAME with your GitHub username)*

```powershell
git branch -M main
```

```powershell
git push -u origin main
```

**Expected output:**
```
✅ Enumerating objects: 48, done.
✅ Writing objects: 100% (48/48)
✅ Unpacking objects: 100%
✅ remote: Create pull request for main
✅ To https://github.com/YOUR_USERNAME/MURF_may.git
✅ [new branch]      main -> main
```

✅ Your code is now on GitHub!

---

## STEP 3: Create Railway Account (2 minutes)

1. Go to https://railway.app
2. Click **"Start free"** or **"Login"**
3. Click **"Continue with GitHub"**
4. Authorize Railway to access your GitHub
5. You're in! ✅

---

## STEP 4: Create New Project in Railway (1 minute)

1. In Railway dashboard, click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Search for: `MURF_may`
4. Click your repository
5. Click **"Deploy now"** button

**Railway will auto-detect:**
- ✅ Docker Compose setup
- ✅ Backend service (FastAPI)
- ✅ Frontend service (Next.js)
- ✅ PostgreSQL database

Deployment starts! ⏳ (Takes 3-5 minutes first time)

---

## STEP 5: Add Environment Variables (3 minutes)

⚠️ **IMPORTANT:** Must do before deployment completes

### For Backend Service:

1. In Railway, you'll see 3 services: `backend`, `frontend`, `postgres`
2. Click on **`backend`** service
3. Click **"Variables"** tab
4. Click **"New Variable"** and add these one by one:

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | `sk-proj-YOUR_OPENAI_KEY` |
| `MURF_API_KEY` | `ap2_086463a6-8b23-42eb-8709-aef8b2524905` |
| `JWT_SECRET` | `super-secret-key-min-32-characters-long!!!` |

### Get OpenAI Key:
1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Copy it → Paste in Railway as `OPENAI_API_KEY`

### For Database:

If Railway creates PostgreSQL automatically:
- `DATABASE_URL` = already set automatically ✅

**If you want to use Neon instead:**
1. Add new variable: `DATABASE_URL`
2. Value: `postgresql://neondb_owner:npg_2oW6VhlJvpTt@ep-twilight-sun-aq2g85h8-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### For Frontend Service:

1. Click on **`frontend`** service
2. Click **"Variables"** tab
3. Add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND-URL` |

*(Copy the backend URL from Railway dashboard)*

---

## STEP 6: Wait for Deployment (3-5 minutes)

In Railway dashboard:

1. You'll see **"Building..."** then **"Deploying..."**
2. Green checkmarks appear when services start
3. Wait until all 3 services show ✅ green status

**You'll see URLs:**
```
Frontend: https://murf-frontend-prod-xxxxx.railway.app
Backend:  https://murf-backend-prod-xxxxx.railway.app
Database: (internal, auto-managed)
```

---

## STEP 7: Test Your Deployment (2 minutes)

### Test 1: Backend API
Open browser:
```
https://YOUR-BACKEND-URL/docs
```
*(Replace YOUR-BACKEND-URL with your actual URL)*

**You should see:** Swagger API documentation ✅

### Test 2: Frontend
Open browser:
```
https://YOUR-FRONTEND-URL
```

**You should see:** MURF login page ✅

### Test 3: Full Chat
1. Click "Sign Up"
2. Create account
3. Login
4. Select personality
5. Send message: `hello`
6. Should get voice response ✅

---

## STEP 8: Check Logs (If Something's Wrong)

In Railway:

1. Click the service (backend/frontend)
2. Click **"Logs"** tab
3. Look for red errors
4. Common issues:

**Error: "No such file or directory: requirements.txt"**
- Backend path wrong in docker-compose.yml
- Solution: Check backend/requirements.txt exists ✅

**Error: "Cannot connect to database"**
- DATABASE_URL wrong
- Solution: Verify DATABASE_URL in variables

**Error: "OPENAI_API_KEY not found"**
- Environment variable not set
- Solution: Add OPENAI_API_KEY in Variables tab

---

## STEP 9: Monitor & Scale (Optional)

### View Metrics:
1. Click service → "Metrics" tab
2. See CPU, Memory, Network usage

### View Real-time Logs:
1. Click service → "Logs" tab
2. Logs update live

### Redeploy if Needed:
1. Make changes locally
2. `git push` to GitHub
3. Railway auto-redeploys! ✅

---

## STEP 10: Share Your App! 🎉

Your app is live!

**Share links:**
```
Frontend: https://YOUR-FRONTEND-URL
Backend API: https://YOUR-BACKEND-URL/docs
```

---

## 💰 Costs

| Item | Price |
|------|-------|
| Railway free monthly credit | **$5** |
| Your app usage | **$1-3/month** |
| **Result** | **FREE!** ✅ |

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Check backend logs, verify env vars |
| Can't reach backend | Verify `NEXT_PUBLIC_API_URL` in frontend |
| Voice not working | Check `OPENAI_API_KEY` and `MURF_API_KEY` |
| Database errors | Verify `DATABASE_URL` is correct |
| 404 on frontend | Wait 5 min, refresh. Check build logs. |

---

## Success Checklist

- [ ] Created GitHub account & repository
- [ ] Pushed code to GitHub
- [ ] Created Railway account
- [ ] Deployed project from GitHub
- [ ] Added all environment variables
- [ ] Backend shows ✅ green status
- [ ] Frontend shows ✅ green status
- [ ] Can access `/docs` endpoint
- [ ] Can load frontend page
- [ ] Can send message & get voice response
- [ ] Shared your app links!

---

## 🎯 Summary

```
⏱️ Total Time: ~10-15 minutes
💰 Cost: FREE (within $5 credit)
📍 Location: Cloud hosted
🔒 HTTPS/SSL: Automatic
⚡ Performance: Good
🚀 Status: LIVE!
```

**Congrats! Your MURF app is now deployed on Railway!** 🚀
