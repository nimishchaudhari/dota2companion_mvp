# Frontend-Only GitHub Pages Deployment (Backend Preserved for Future)

This guide provides step-by-step instructions to deploy the **frontend-only** version of the Dota 2 Companion application to GitHub Pages. The frontend now works independently by connecting directly to the OpenDota API, eliminating the need for the backend in the current deployment.

## Current Architecture

The application currently operates as a **frontend-only** solution that:
- Connects directly to the OpenDota API for match data, player statistics, and hero information
- Runs entirely in the browser without requiring a backend server
- Can be deployed as a static site on GitHub Pages

## Frontend-Only Deployment (Current)

### Prerequisites
1. **GitHub Repository:** The project should be in a GitHub repository
2. **GitHub Pages enabled:** Enable GitHub Pages in your repository settings

### Immediate Deployment Steps

1. **Navigate to Frontend Directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

4. **Deploy to GitHub Pages:**
   
   **Option A: Using GitHub Actions (Recommended)**
   - Push your code to the `main` branch
   - GitHub Actions will automatically build and deploy to GitHub Pages
   - The workflow is configured in `.github/workflows/` (if present)

   **Option B: Manual Deployment**
   ```bash
   # Install gh-pages if not already installed
   npm install --save-dev gh-pages
   
   # Deploy the dist folder to gh-pages branch
   npx gh-pages -d dist
   ```

5. **Configure GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "Deploy from a branch"
   - Select the `gh-pages` branch and `/ (root)` folder
   - Save the settings

6. **Access Your Application:**
   - Your app will be available at: `https://yourusername.github.io/repository-name`
   - It may take a few minutes for the deployment to be live

### Environment Configuration

The frontend is configured to work without backend environment variables. All API calls go directly to OpenDota's public API endpoints.

---

## Backend Deployment (Future Use)

*The following information is preserved for future development when backend features are needed.*

### When Backend Will Be Required

The backend will be necessary for future features such as:
- User authentication and personalized data storage
- Custom match analysis and statistics
- User preferences and saved configurations
- Rate limiting and API key management
- Advanced features requiring server-side processing

### Railway.app Deployment (For Future Backend)

When the backend is needed, here are the preserved deployment instructions:

**Prerequisites:**
1. **Railway Account:** You'll need a Railway.app account
2. **GitHub Repository:** The backend code is ready in the `backend/` directory
3. **Steam API Key (Optional):** For Steam authentication features
4. **OpenDota API Key (Optional):** For higher rate limits

**Backend Deployment Steps:**

1. **Create New Project on Railway:**
   - Log in to your Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your GitHub repository

2. **Configure Backend Service:**
   - Name the service (e.g., `dota2-companion-backend`)
   - Set **Root Directory** to `backend`
   - Railway will auto-detect it as a Node.js app using Nixpacks

3. **Set Environment Variables for Backend:**
   - `SESSION_SECRET`: A strong, random string for session encryption
   - `NODE_ENV`: Set to `production`
   - `FRONTEND_URL_RAILWAY`: Your deployed frontend URL
   - `STEAM_API_KEY`: (Optional) Your Steam API key
   - `OPENDOTA_API_KEY`: (Optional) Your OpenDota API key
   - `PORT`: Railway provides this automatically

4. **Deploy and Get Backend URL:**
   - Railway will automatically deploy
   - Copy the public URL for frontend integration

**Frontend with Backend Integration:**

When integrating with the backend:

1. **Update Environment Variables:**
   - Set `VITE_API_URL` to your Railway backend URL
   - Update frontend code to use backend endpoints instead of direct API calls

2. **Redeploy Frontend:**
   - Build and deploy the updated frontend
   - Update `FRONTEND_URL_RAILWAY` in backend environment variables

### Two-Service Architecture (Future)

When fully deployed with backend:
- **Frontend Service:** Static React app served from Railway or GitHub Pages
- **Backend Service:** Node.js/Express API on Railway
- **Communication:** Frontend makes API calls to backend, backend handles external API integration

**Verification for Full Deployment:**
- Test authentication flows
- Verify API endpoints work correctly
- Check CORS configuration
- Test all features requiring backend integration

---

## Troubleshooting

### Frontend-Only Issues
- **SPA Routing:** GitHub Pages may need additional configuration for single-page app routing
- **API Limits:** Direct OpenDota API calls may hit rate limits; consider implementing client-side caching
- **CORS Issues:** Generally not an issue with OpenDota API, but check browser console for errors

### Future Backend Issues
- **CORS Configuration:** Ensure backend properly allows frontend domain
- **Environment Variables:** Double-check all required variables are set
- **Build Failures:** Check Railway build logs for dependency or configuration issues

## Current vs Future Features

### Available Now (Frontend-Only)
- Hero browsing and details
- Player search and profile viewing  
- Match history and details
- Basic statistics and performance metrics
- All data sourced directly from OpenDota API

### Planned Features (Requiring Backend)
- User accounts and authentication
- Personalized dashboards and saved data
- Custom statistics and analysis
- Social features and match sharing
- Advanced filtering and search capabilities
- API rate limiting and optimization