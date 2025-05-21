# Deploying the Dota 2 Companion POC on Railway.app

This guide provides step-by-step instructions to deploy the backend and frontend services of the Dota 2 Companion POC application to Railway.app.

**Prerequisites:**

1.  **Railway Account:** You'll need a Railway.app account.
2.  **GitHub Repository:** Push the entire project (including `backend` and `frontend` directories) to a GitHub repository (`https://github.com/nimishchaudhari/dota2companion_mvp`). Railway will deploy from this repository.
3.  **Steam API Key (Optional but Recommended):** For Steam authentication features (though the POC uses mock auth, the backend is set up for it). If you have one, keep it handy.
4.  **OpenDota API Key (Optional):** OpenDota is often usable without an API key for low request volumes, but having one can provide higher rate limits.

**Deployment Steps:**

We will deploy this as two separate services on Railway: one for the backend and one for the frontend.

**Part 1: Deploying the Backend Service (Node.js/Express)**

1.  **Create New Project on Railway:**
    *   Log in to your Railway dashboard.
    *   Click "New Project".
    *   Select "Deploy from GitHub repo".
    *   Choose the GitHub repository where you pushed the project.

2.  **Configure Backend Service:**
    *   Railway will likely detect multiple potential services or ask you to configure one. If it doesn't automatically create a service or if you need to add one manually: Click "+ New Service" or "Add a service".
    *   Choose "From GitHub" and select your repository again if needed.
    *   **Service Name:** Name it something descriptive (e.g., `dota2-poc-backend`).
    *   **Root Directory:** In the service settings (usually under "Build" or "Settings"), set the **Root Directory** to `backend`. This tells Railway to look for the backend code in the `backend` subfolder.
    *   **Build Method:** Railway should auto-detect it as a Node.js app using Nixpacks. Default build command (`npm run build` if present, then uses start command) and start command (`npm start` from `package.json`) should work.
        *   _Build Command:_ Nixpacks will handle `npm install`.
        *   _Start Command:_ Should pick up `npm start` from `backend/package.json` (which runs `node server.js`).

3.  **Set Environment Variables for Backend:**
    *   Navigate to your backend service settings in Railway.
    *   Go to the "Variables" tab.
    *   Add the following environment variables:
        *   `SESSION_SECRET`: A strong, random string for session encryption (e.g., `openssl rand -hex 32`).
        *   `NODE_ENV`: Set to `production`.
        *   `FRONTEND_URL_RAILWAY`: **Leave this blank for now.** You'll fill this in after deploying the frontend service and getting its public URL.
        *   `STEAM_API_KEY`: (Optional) Your Steam API key, if you have one.
        *   `OPENDOTA_API_KEY`: (Optional) Your OpenDota API key, if you have one.
        *   `PORT`: Railway provides this automatically, your `server.js` is already configured to use it.

4.  **Deploy and Get Backend URL:**
    *   Railway will automatically start deploying once the service is configured from GitHub.
    *   Check the "Deployments" tab for build and deploy logs.
    *   Once deployed, go to the "Settings" tab of your backend service and find its public URL (e.g., `something-backend.up.railway.app`). **Copy this URL.** You'll need it for the frontend.

**Part 2: Deploying the Frontend Service (React/Vite)**

1.  **Add Frontend Service to the Same Project:**
    *   In your Railway project, click "+ New Service" (or "Add a service").
    *   Choose "From GitHub" and select your repository again.
    *   **Service Name:** Name it something descriptive (e.g., `dota2-poc-frontend`).
    *   **Root Directory:** In the service settings, set the **Root Directory** to `frontend`.
    *   **Build Method:** Railway should auto-detect it as a Vite app using Nixpacks.
        *   _Build Command:_ `npm run build` (from `frontend/package.json`). Nixpacks will also run `npm install`.
        *   _Publish Directory (or Output Directory):_ Should be `dist` (Vite's default). Railway/Nixpacks usually detects this for Vite.
    *   **Start Command (for static site):** Nixpacks should automatically serve the static content from the publish directory. If SPA routing (direct access to `/heroes`, `/player/123`, etc.) doesn't work out of the box, you might need to configure a custom start command or use a Dockerfile (see Fallback section). For Vite, Nixpacks often handles this well.

2.  **Set Environment Variables for Frontend:**
    *   Navigate to your frontend service settings in Railway.
    *   Go to the "Variables" tab.
    *   Add the following environment variable:
        *   `VITE_API_URL`: Paste the public URL of your **deployed backend service** (e.g., `https://something-backend.up.railway.app`).

3.  **Deploy and Get Frontend URL:**
    *   Railway will automatically start deploying.
    *   Check the "Deployments" tab for logs.
    *   Once deployed, go to the "Settings" tab of your frontend service and find its public URL (e.g., `something-frontend.up.railway.app`). This is the main URL for your application.

**Part 3: Finalize Backend Configuration**

1.  **Update `FRONTEND_URL_RAILWAY` on Backend:**
    *   Go back to your **backend service** settings on Railway.
    *   In the "Variables" tab, set the `FRONTEND_URL_RAILWAY` variable to the public URL of your **deployed frontend service** (e.g., `https://something-frontend.up.railway.app`). This is crucial for CORS to work correctly in production.
    *   This will trigger a redeploy of your backend service.

**Verification:**

*   Open the public URL of your frontend service in a browser.
*   Test the mock login.
*   Test navigation to different pages (Heroes, Player Search, Profile pages, Match details).
*   Check browser console and Railway service logs for any errors.

**Troubleshooting & Fallbacks (If Nixpacks auto-detection isn't perfect):**

*   **SPA Routing for Frontend:** If direct navigation to routes like `/heroes` on your deployed frontend gives a 404, Nixpacks might not be serving `index.html` for all paths.
    *   **Option 1 (Railway Start Command):** You might be able to set a custom start command for the frontend service like `npx serve -s dist -l tcp://0.0.0.0:$PORT` (you'd need to add `serve` as a dependency to `frontend/package.json`: `npm install serve`).
    *   **Option 2 (Dockerfile):** The most robust solution is to use a Dockerfile for the frontend with a static web server like Caddy or Nginx that is configured for SPA `try_files` (as researched earlier). Railway supports Dockerfile deployments.
*   **Backend Start/Build:** If the backend doesn't build or start correctly, check the build logs on Railway. You might need to specify Node versions or build commands more explicitly using a `railway.json` or `nixpacks.toml` file, or resort to a `Dockerfile`.

This guide assumes a Nixpacks-first approach which is often the simplest for Railway.
