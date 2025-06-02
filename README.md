# Dota 2 Companion POC

This project is a Proof of Concept for a Dota 2 Companion Web App. It provides Dota 2 players with a platform to track their performance, learn about heroes and game mechanics, and analyze matches.

## Current Deployment Status

The application is **currently deployed as a frontend-only solution** that connects directly to the OpenDota API. This allows for immediate deployment to GitHub Pages or other static hosting services without requiring backend infrastructure.

### Current Architecture
- **Frontend:** React.js and Vite application deployed as a static site
- **Data Source:** Direct integration with OpenDota API
- **Hosting:** GitHub Pages (or any static site hosting)
- **Backend:** Preserved in codebase for future feature expansion

## Project Structure

```
/
├── backend/              # Node.js/Express API (preserved for future use)
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies and scripts
│   └── nixpacks.toml     # Railway configuration (for future deployment)
├── frontend/             # React/Vite UI (currently deployed)
│   ├── src/              # Frontend source code
│   ├── package.json      # Frontend dependencies and scripts
│   └── vite.config.js    # Vite configuration
├── DEPLOY_INSTRUCTIONS.md # Deployment guide (frontend-only + future backend)
├── nixpacks.toml         # Nixpacks configuration (for future full-stack deployment)
└── README.md             # This file
```

## Quick Start (Frontend-Only)

### Prerequisites
- Node.js (version 18.x recommended)
- npm (comes with Node.js)

### Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/nimishchaudhari/dota2companion_mvp.git
   cd dota2companion_mvp
   ```

2. **Navigate to frontend and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:5173`

### Production Deployment
See `DEPLOY_INSTRUCTIONS.md` for detailed GitHub Pages deployment instructions.

**Quick deployment:**
```bash
cd frontend
npm install
npm run build
npx gh-pages -d dist  # Deploys to GitHub Pages
```

## Features

### Currently Available (Frontend-Only)
- **Hero Browser:** Browse all Dota 2 heroes with detailed information
- **Player Search:** Search players by Steam ID, Dota 2 ID, or persona name
- **Player Profiles:** View detailed player statistics and performance metrics
- **Match History:** Browse recent matches with comprehensive details
- **Match Analysis:** Detailed match breakdowns including hero performance and statistics
- **Responsive Design:** Works seamlessly on desktop and mobile devices

### Planned Features (Requiring Backend)
The backend is preserved in the codebase to support these future features:
- **User Authentication:** Steam login and personalized user accounts
- **Saved Data:** Personal dashboards and saved player/match preferences
- **Advanced Analytics:** Custom match analysis and performance tracking
- **Social Features:** Match sharing and community interactions
- **API Optimization:** Rate limiting, caching, and enhanced data processing
- **Real-time Updates:** Live match tracking and notifications

## Backend (Future Use)

The backend code is fully implemented and ready for deployment when advanced features are needed. It includes:

### Backend Features (Ready for Deployment)
- Express.js REST API with comprehensive endpoints
- Steam authentication integration (passport-steam)
- Session management and security middleware
- OpenDota API integration with error handling
- CORS configuration for production deployment
- Environment-based configuration

### Backend Setup (For Future Development)
```bash
cd backend
npm install
# Set up environment variables (see DEPLOY_INSTRUCTIONS.md)
npm run dev  # Development server on http://localhost:3001
```

### Environment Configuration
The backend requires these environment variables:
- `SESSION_SECRET`: Session encryption key
- `FRONTEND_URL_RAILWAY`: Frontend URL for CORS
- `STEAM_API_KEY`: (Optional) Steam API access
- `OPENDOTA_API_KEY`: (Optional) Enhanced OpenDota access
- `NODE_ENV`: Environment setting

## API Integration

### Current (Direct OpenDota)
The frontend makes direct calls to OpenDota's public API endpoints:
- Player data: `https://api.opendota.com/api/players/{player_id}`
- Match data: `https://api.opendota.com/api/matches/{match_id}`
- Hero data: `https://api.opendota.com/api/heroes`
- Search: `https://api.opendota.com/api/search`

### Future (via Backend)
When the backend is deployed, API calls will be routed through the backend for:
- Enhanced error handling and retry logic
- Rate limiting and request optimization
- Authentication-gated features
- Custom data aggregation and caching

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Development (When Needed)
```bash
cd backend
npm run dev      # Development server with nodemon
npm start        # Production server
```

## Deployment Options

### Current (Frontend-Only)
- **GitHub Pages** (recommended for static hosting)
- **Vercel** (excellent for React apps)
- **Netlify** (great for static sites)
- **Railway** (static site deployment)

### Future (Full-Stack)
- **Railway.app** (recommended for full-stack deployment)
- **Vercel** (frontend) + **Railway** (backend)
- **Netlify** (frontend) + **Heroku** (backend)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (frontend-only for now)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is a proof of concept and is available under the MIT License.

## Acknowledgments

- **OpenDota API** for providing comprehensive Dota 2 match and player data
- **Valve Corporation** for Dota 2 and related game data
- **React and Vite** for the excellent development experience
- **Tailwind CSS** for rapid UI development