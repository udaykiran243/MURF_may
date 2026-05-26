# Deployment Instructions for MURF

## 1. GitHub Push (Prerequisites)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Create a repository named `MURF_may` (or your preferred name)
3. DO NOT initialize with README (we already have one)

### Step 2: Push Your Local Code
After creating the repository, run these commands:

```bash
cd c:\Users\udayk\Downloads\MURF
git remote add origin https://github.com/YOUR_USERNAME/MURF_may.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 2. Recommended Free Deployment Options

### **OPTION A: Railway.app (RECOMMENDED - Full Stack)**
Best for: Complete application with both frontend and backend

**Advantages:**
- ✅ Free tier: $5 credits/month (plenty for this app)
- ✅ One-click deployment from GitHub
- ✅ Automatic environment variables
- ✅ Built-in PostgreSQL support
- ✅ Simple dashboard

**Setup Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → Import from GitHub
4. Select `MURF_may` repository
5. Railway auto-detects Docker Compose setup
6. Configure environment variables:
   - `OPENAI_API_KEY=sk-...`
   - `MURF_API_KEY=ap2_...`
   - `JWT_SECRET=your-secret-key`
   - `DATABASE_URL=your-neon-url` (from Neon PostgreSQL)
7. Deploy!

**Cost:** ~$1-2/month for this small app

---

### **OPTION B: Vercel + Railway (BEST FOR PERFORMANCE)**

**Frontend - Vercel:**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import project → Select `MURF_may`
4. Set root directory: `frontend`
5. Environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app`
6. Deploy!

**Backend - Railway:**
- Follow Option A but deploy only backend

**Cost:** Frontend free, backend $1-2/month

---

### **OPTION C: Render + Vercel**

**Backend on Render:**
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Set environment variables (same as above)
6. Deploy!

**Frontend on Vercel** (same as Option B)

**Cost:** Backend starts free, frontend free

---

## 3. Environment Variables Needed

Create these for any platform:

```
# Backend
OPENAI_API_KEY=sk-your-openai-key
MURF_API_KEY=ap2_your-murf-key
JWT_SECRET=your-jwt-secret-min-32-chars
DATABASE_URL=postgresql://user:password@host/database

# Frontend (optional, for API URL)
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 4. Database Setup (Neon - Already Done)

Your database is already on Neon PostgreSQL, which works with any deployment platform. No additional setup needed!

**URL:** `postgresql://neondb_owner:npg_2oW6VhlJvpTt@ep-twilight-sun-aq2g85h8-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

---

## 5. Deployment Quick Checklist

- [ ] Create GitHub repository
- [ ] Run `git push` commands
- [ ] Choose deployment platform (Railway recommended)
- [ ] Connect GitHub repo to platform
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test: Visit your app URL
- [ ] Check backend health: `https://your-backend-url/docs`

---

## 6. Troubleshooting

**Issue:** App not starting
- Check environment variables are set
- Check logs in deployment dashboard
- Verify database URL is accessible

**Issue:** Frontend can't reach backend
- Set `NEXT_PUBLIC_API_URL` in frontend env vars
- Ensure backend URL is correct and accessible

**Issue:** Voice API not working
- Check `MURF_API_KEY` is correct
- Verify OpenAI API key has credits

**Issue:** Database connection error
- Verify `DATABASE_URL` is correct
- Check Neon PostgreSQL connection limit

---

## Next Steps

1. ✅ Push to GitHub first
2. ✅ Deploy backend to Railway/Render
3. ✅ Deploy frontend to Vercel
4. ✅ Test all features with live URLs
5. ✅ Share your deployed app!
