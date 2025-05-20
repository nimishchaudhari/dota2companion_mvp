# Dota 2 Companion POC

This project is a Proof of Concept for a Dota 2 Companion Web App. It aims to provide Dota 2 players with a platform to track their performance, learn about heroes and game mechanics, and analyze matches.

The application is structured as a monorepo with two main components:
*   `/backend`: A Node.js and Express.js application serving the API.
*   `/frontend`: A React.js and Vite application for the user interface.

## Project Structure

```
/
├── backend/              # Node.js/Express API
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies and scripts
│   └── nixpacks.toml     # Nixpacks configuration for Railway (backend service)
├── frontend/             # React/Vite UI
│   ├── src/              # Frontend source code
│   ├── package.json      # Frontend dependencies and scripts
│   └── vite.config.js    # Vite configuration
├── DEPLOY_ON_RAILWAY.md  # Guide for deploying to Railway.app
├── nixpacks.toml         # Nixpacks configuration for Railway (root, if deploying as single service)
└── README.md             # This file
```

## Local Development

### Prerequisites
*   Node.js (version 18.x recommended, as per `package.json` files)
*   npm (comes with Node.js)

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory by copying `.env.example` (if it exists) or by setting the required environment variables. Key variables include:
    *   `PORT` (e.g., 3001)
    *   `SESSION_SECRET`
    *   `FRONTEND_URL_RAILWAY` (for local dev, can be `http://localhost:5173`)
    *   `STEAM_API_KEY` (optional)
    *   `OPENDOTA_API_KEY` (optional)
4.  Start the development server:
    ```bash
    npm run dev
    ```
    Alternatively, for a production-like start (without nodemon):
    ```bash
    npm start
    ```
    The backend will typically run on `http://localhost:3001` (or the port specified in your `.env`).

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory (if needed by your setup, e.g., for `VITE_API_URL`). Set `VITE_API_URL` to your backend's address:
    ```
    VITE_API_URL=http://localhost:3001 
    ```
    (Adjust the port if your backend runs on a different one).
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will typically run on `http://localhost:5173`.

## Deployment

Deployment instructions for Railway.app can be found in `DEPLOY_ON_RAILWAY.md`.

## Linting

The frontend project is set up with ESLint. To run the linter:
```bash
cd frontend
npm run lint
```