# Deployment Instructions

## GitHub Pages + Railway Deployment

### Frontend (GitHub Pages)

1. **Enable GitHub Pages in your repository:**
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`

2. **The workflow will automatically:**
   - Build the React app when you push to `master`
   - Deploy to `https://nimishchaudhari.github.io/dota2companion_mvp/`

### Backend (Railway - Recommended)

1. **Deploy to Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Deploy from the backend directory
   cd backend
   railway deploy
   ```

2. **Configure environment variables in Railway:**
   - `NODE_ENV=production`
   - `SESSION_SECRET=your-secure-session-secret`
   - `FRONTEND_URL_RAILWAY=https://nimishchaudhari.github.io`

3. **Update frontend production URL:**
   - Edit `frontend/.env.production`
   - Set `VITE_API_URL=https://your-backend-url.railway.app`

### Alternative: Vercel Deployment

1. **Backend on Vercel:**
   ```bash
   cd backend
   vercel --prod
   ```

2. **Add `vercel.json` in backend:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

### CORS Configuration

Update your backend CORS settings for production:

```javascript
const corsOptions = {
  origin: [
    'https://nimishchaudhari.github.io',
    'http://localhost:5173' // Keep for local development
  ],
  credentials: true,
};
```

### Testing the Deployment

1. **Local testing with production build:**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Test GitHub Pages deployment:**
   - Push changes to master branch
   - Check Actions tab for build status
   - Visit: `https://nimishchaudhari.github.io/dota2companion_mvp/`

### Current Status

✅ Frontend configured for GitHub Pages
✅ GitHub Actions workflow ready
✅ Environment variables configured
⏳ Backend needs to be deployed to Railway/Vercel
⏳ Frontend .env.production needs backend URL update

### Next Steps

1. Deploy backend to Railway
2. Update `VITE_API_URL` in `.env.production`
3. Push changes to trigger GitHub Pages deployment
4. Test the live application