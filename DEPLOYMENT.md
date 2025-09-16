# 🚀 Deployment Guide for Buy Lead App

## Overview
This guide covers deploying the Buy Lead App with:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway or Render (Node.js + SQLite/PostgreSQL)

## 📋 Deployment Steps

### Step 1: Deploy Backend First

#### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `Buy-Lead-App` repository
5. Choose the `backend` folder as root directory
6. Set environment variables:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
7. Deploy and note the backend URL (e.g., `https://your-app.railway.app`)

#### Option B: Render
1. Go to [Render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables (same as Railway)

### Step 2: Deploy Frontend to Vercel

#### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: buy-lead-app
# - Directory: ./frontend
```

#### Method 2: Vercel Dashboard
1. Go to [Vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your `Buy-Lead-App` repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Configure Environment Variables

#### Vercel Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

#### Backend Environment Variables
Update your backend deployment with the Vercel frontend URL:
```
CORS_ORIGIN=https://your-app.vercel.app
```

## 🔧 Production Configuration

### Database Setup
For production, update your backend to use PostgreSQL:

1. **Railway**: Automatically provides PostgreSQL
2. **Render**: Add PostgreSQL add-on
3. Update `DATABASE_URL` in environment variables

### Security Checklist
- ✅ Use strong JWT_SECRET
- ✅ Configure CORS_ORIGIN correctly
- ✅ Enable HTTPS only
- ✅ Set NODE_ENV=production
- ✅ Remove debug endpoints in production

## 🧪 Testing Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test API endpoints
3. **Integration**: Test login and CSV import
4. **CORS**: Ensure frontend can communicate with backend

## 📝 Common Issues & Solutions

### CORS Errors
```javascript
// backend/src/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### Environment Variables Not Loading
- Ensure variables are set in deployment platform
- Restart services after adding variables
- Check variable names match exactly

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Review build logs for specific errors

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:
- **Vercel**: Auto-deploys on push to main branch
- **Railway**: Auto-deploys on push to connected branch

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and usage

### Backend Monitoring
- Use Railway/Render built-in monitoring
- Set up error tracking (Sentry)
- Monitor database performance

## 🚀 Going Live Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible  
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Error monitoring setup
- [ ] Performance monitoring setup
- [ ] Backup strategy in place

## 📞 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check CORS configuration
5. Review this deployment guide

---

**Happy Deploying! 🎉**
