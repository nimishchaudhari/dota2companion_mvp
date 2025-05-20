# MVP Technical Specification: Dota 2 Companion Web App POC

## 1. Introduction and Goals

### 1.1. Document Purpose
This document outlines the technical specifications for building a Proof of Concept (POC) version of the Dota 2 Companion Web App. It details the proposed technology stack, architecture, API integration strategy, data models, deployment approach, and scope for the POC.

### 1.2. POC Goals
*   Validate the core functionality of fetching and displaying player statistics, hero information, and basic match details from external Dota 2 APIs.
*   Implement user authentication via Steam OpenID.
*   Test the feasibility of the chosen technology stack for rapid development.
*   Gather early feedback on the user experience of the core features.
*   Identify potential technical challenges and risks for full MVP development.
*   The POC is not intended to be feature-complete or production-ready but rather a means to demonstrate core viability.

### 1.3. Target Audience for this Document
This document is intended for the development team, including software engineers, architects, and potentially product managers involved in the POC development.

## 2. Proposed Technology Stack

### 2.1. Frontend
*   **Language:** JavaScript (with ES6+ features) or TypeScript (for improved type safety, optional for POC but recommended for larger project).
*   **Framework/Library:** React.js (with Hooks and Context API or a lightweight state management like Zustand/Jotai for simplicity in POC).
    *   *Alternatives:* Vue.js, Svelte.
*   **Styling:** CSS Modules, Tailwind CSS, or a component library like Material-UI/Chakra UI (choose one that allows for rapid UI development). For POC, Tailwind CSS is a strong candidate for speed.
*   **Build Tool:** Vite (for fast development server and optimized builds) or Create React App.

### 2.2. Backend
*   **Language:** Node.js (with Express.js framework).
    *   *Alternatives:* Python (with Flask/Django), Ruby on Rails.
*   **Runtime Environment:** Node.js.
*   **API Client:** Axios or node-fetch for making requests to external Dota 2 APIs.

### 2.3. Database
*   **Type:** NoSQL Document Database or Relational Database. For the POC, a simple solution is prioritized.
*   **Choice (POC):**
    *   **Option 1 (NoSQL):** MongoDB (using MongoDB Atlas free tier) - Good for flexible schemas, which might be useful when dealing with varied API responses.
    *   **Option 2 (Relational):** PostgreSQL (using a free tier on Heroku Postgres or similar) - Solid choice if more structured data or transactions become important quickly.
    *   **Option 3 (Simplest for POC if only user session/SteamID is stored):** A key-value store like Redis for session management, with user details (SteamID, persona name, avatar) potentially being transient or lightly cached if no other persistent user data is needed for POC.
*   **For this POC, assuming minimal persistent user data beyond Steam ID for identification, we might defer complex DB setup or use a very lightweight option. If user-specific settings or tracked data were part of POC, MongoDB or PostgreSQL would be chosen.** Let's assume for now the POC will focus on API data display and Steam login, minimizing backend DB complexity. Session store (e.g. Redis or cookie-based session with backend component) will be needed for user login.

### 2.4. Version Control
*   **System:** Git.
*   **Hosting:** GitHub, GitLab, or Bitbucket.

### 2.5. Justification for Choices
*   **React.js (Frontend):** Large community, component-based architecture, rich ecosystem, suitable for single-page applications (SPAs). Vite offers a very fast development experience.
*   **Node.js/Express.js (Backend):** JavaScript full-stack (consistency with frontend), event-driven non-blocking I/O suitable for API-heavy applications, large number of available packages (npm).
*   **MongoDB/PostgreSQL (Database):** Chosen for their popularity, good documentation, and availability of free tiers for POC stage. The choice between them can be finalized based on how much structured user-specific data the POC will actually persist. For extreme POC simplicity, a DB might be minimized.
*   **Git/GitHub:** Standard for version control and collaboration.
*   **Overall:** The stack is modern, widely used, has strong community support, and allows for relatively rapid development, which is ideal for a POC.

## 3. High-Level Architecture

### 3.1. System Architecture Overview
The POC will follow a traditional three-tier client-server architecture:

```
+-----------------+      +---------------------+      +----------------------+
|   User/Browser  |<---->|    Frontend (SPA)   |<---->|    Backend Server    |
| (React.js App)  |      | (Hosted on Vercel/  |      | (Node.js/Express.js |
|                 |      |  Netlify/S3+CF)     |      |  on Heroku/AWS EC2)  |
+-----------------+      +---------------------+      +----------------------+
                                                            /|\
                                                           / | \
                                                          /  |  \
                                                         /   |   \
                                                        /    |    \
+-------------------------+  +------------------------+  +--------------------+
| Steam Web API           |  | Dota 2 Data API        |  | Database (Optional |
| (for Auth, User Info)   |  | (OpenDota/Stratz for   |  | /Session Store)    |
|                         |  |  game data)            |  | (MongoDB/Postgres/ |
+-------------------------+  +------------------------+  +--------------------+
```

*   **Client-Side (Frontend):** A Single Page Application (SPA) built with React.js. Responsible for rendering the UI, handling user interactions, and making API calls to the backend server.
*   **Server-Side (Backend):** A Node.js/Express.js application. Responsible for:
    *   Handling Steam OpenID authentication flow.
    *   Serving as a proxy to external Dota 2 APIs (to protect API keys and potentially handle caching).
    *   Any business logic that shouldn't reside on the client.
    *   Managing user sessions.
*   **External APIs:** Steam Web API and a Dota 2 Data API (like OpenDota or Stratz) are crucial external dependencies.
*   **Database (Optional for POC / Session Store):** Minimal use for POC. Could store user session information or basic user data (Steam ID, display name) if not handled transiently.

### 3.2. Component Breakdown
*   **Frontend Components:**
    *   `AuthComponent`: Handles login/logout flows with Steam.
    *   `PlayerSearchComponent`: Input for searching players.
    *   `PlayerProfileView`: Displays player overview, stats, match history.
    *   `HeroListView`: Displays filterable list of heroes.
    *   `HeroDetailView`: Displays detailed hero information.
    *   `MatchDetailView`: Displays analysis of a specific match.
    *   `LayoutComponents`: Header, Footer, Navigation.
*   **Backend Modules/Routes:**
    *   `/auth/steam`: Initiates Steam OpenID login.
    *   `/auth/steam/callback`: Handles Steam callback.
    *   `/auth/logout`: Clears user session.
    *   `/api/player/{player_id}/stats`: Proxies request for player stats.
    *   `/api/heroes`: Proxies request for hero list.
    *   `/api/heroes/{hero_id}`: Proxies request for specific hero details.
    *   `/api/matches/{match_id}`: Proxies request for match details.
    *   Middleware for session management.

### 3.3. Data Flow
1.  **User Authentication:**
    *   User clicks "Login with Steam" on Frontend.
    *   Frontend redirects to Backend's `/auth/steam` route.
    *   Backend redirects to Steam OpenID page.
    *   User authenticates with Steam.
    *   Steam redirects back to Backend's `/auth/steam/callback` with user's Steam ID.
    *   Backend verifies Steam ID, creates a session, and redirects Frontend to a relevant page (e.g., dashboard or previous page).
    *   Frontend stores session cookie/token and updates UI to show logged-in state.
2.  **Data Fetching (e.g., Player Profile):**
    *   User searches for a player on Frontend.
    *   Frontend makes a request to Backend's `/api/player/{search_query}/stats`.
    *   Backend makes a request to the chosen Dota 2 Data API (e.g., OpenDota).
    *   Dota 2 Data API returns player data.
    *   Backend may perform minimal transformation/caching (basic for POC) and returns data to Frontend.
    *   Frontend displays the player profile information.
    *   Similar flows apply for hero information and match details.

## 4. API Integration Strategy
Effective integration with external APIs is critical for the Dota 2 Companion App. For the POC, the strategy will focus on basic, functional integration.

### 4.1. Steam Web API

#### 4.1.1. Authentication (OpenID)
*   **Process:** The backend will use a library like `passport-steam` (for Node.js/Express.js) to handle the Steam OpenID authentication flow.
*   **Steps:**
    1.  Frontend initiates login by redirecting to a backend route (e.g., `/auth/steam`).
    2.  Backend uses the OpenID library to redirect the user to the Steam login page.
    3.  Upon successful Steam login, Steam redirects back to a specified callback URL on the backend (e.g., `/auth/steam/callback`).
    4.  The OpenID library verifies the response from Steam and extracts the user's 64-bit Steam ID.
    5.  Backend establishes a session for the user (e.g., using `express-session`) and stores the Steam ID in the session.
    6.  Backend redirects the user back to the frontend (e.g., to their profile page or homepage).
*   **POC Simplification:** Minimal error handling for edge cases in the OpenID flow. Focus on successful authentication path.

#### 4.1.2. Data Fetching (Player Persona)
*   **Endpoint:** `ISteamUser/GetPlayerSummaries/v2/`
*   **Purpose:** After successful authentication, or when displaying any player's basic info, fetch the player's current persona name (nickname) and avatar URL using their Steam ID.
*   **Implementation:** Backend will make a GET request to this endpoint, including the Steam API key and the user's Steam ID.
*   **POC Scope:** Fetch and display persona name and avatar. No storage of this data beyond session/cache for the POC unless explicitly tied to a User model (see Section 5).

#### 4.1.3. API Key Management & Security
*   **Storage:** The Steam Web API key will be stored as an environment variable on the backend server (e.g., `STEAM_API_KEY`).
*   **Access:** The API key will only be used by the backend server and never exposed to the frontend client.
*   **POC Simplification:** Direct use of environment variables. No complex key rotation or vault solutions for POC.

#### 4.1.4. Error Handling & Rate Limiting (Basic Considerations for POC)
*   **Error Handling:**
    *   Basic `try-catch` blocks around API calls.
    *   Log errors to the console.
    *   Return a generic error message to the frontend (e.g., "Could not connect to Steam services").
*   **Rate Limiting:** Steam Web API has rate limits (typically per IP per day).
    *   **POC Mitigation:** For the POC, direct API calls will be made. Caching of persona data (e.g., for 1 hour) on the backend can be implemented if a user's own persona is fetched repeatedly. Given the limited number of users for a POC, hitting global rate limits is less likely but the backend proxy model helps control this.

### 4.2. Dota 2 Data API (OpenDota / Stratz)
For the POC, **OpenDota API** will be the primary choice due to its generally permissive free tier and comprehensive data, though Stratz is a strong alternative. The strategy below assumes OpenDota but is applicable to Stratz with endpoint changes.

#### 4.2.1. Data Fetching (Player Stats, Match History, Hero Info, Match Details)
*   **Endpoints (OpenDota Examples):**
    *   Player Basic Stats: `GET /players/{account_id}`
    *   Player Win/Loss: `GET /players/{account_id}/wl`
    *   Player Recent Matches: `GET /players/{account_id}/recentMatches`
    *   Player Heroes Played: `GET /players/{account_id}/heroes`
    *   Match Details: `GET /matches/{match_id}`
    *   Hero Stats/Info: `GET /heroStats` (provides list of all heroes with some stats)
    *   Specific Hero Data: Often derived from general game data files or community maintained sources, possibly linked via OpenDota hero endpoints.
*   **Implementation:** The backend server will make GET requests to these OpenDota API endpoints.
*   **Data Flow:** Frontend requests data from backend -> Backend requests data from OpenDota API -> Backend returns data to frontend.
*   **POC Scope:** Implement fetching for the core data points required by the functional specification's MVP features. No complex data aggregation or transformation on the backend unless absolutely necessary for display.

#### 4.2.2. API Key Management & Security
*   **OpenDota API Key:** OpenDota allows many anonymous requests but an API key is recommended for higher rate limits. If used, it will be stored as an environment variable on the backend (e.g., `OPENDOTA_API_KEY`).
*   **Access:** Only used by the backend, never exposed to the client.

#### 4.2.3. Caching Strategy (Basic for POC)
*   **Purpose:** Reduce redundant API calls, improve frontend response times, and stay within OpenDota rate limits.
*   **Implementation (POC):**
    *   **In-Memory Cache:** For simplicity in the POC, a basic in-memory cache (e.g., using a JavaScript object or a simple library like `node-cache`) can be implemented on the backend for frequently accessed data that doesn't change too often (e.g., hero list, specific match details once fetched).
    *   **Cache Duration:** Short cache durations (e.g., 5-15 minutes for match data, 1-24 hours for hero list).
    *   **Manual Refresh:** Player profiles might have a manual refresh button on the frontend which would bypass the cache for that specific request.
*   **Future Considerations:** For a full application, a dedicated caching solution like Redis would be more robust.

#### 4.2.4. Error Handling & Rate Limiting (Basic Considerations for POC)
*   **Error Handling:**
    *   `try-catch` blocks for API calls.
    *   Log errors to the console.
    *   Return appropriate HTTP status codes (e.g., 404 if player/match not found, 500 for server errors) and a JSON error message to the frontend.
    *   Frontend should be able to display user-friendly error messages (e.g., "Player data not found," "Could not load match details").
*   **Rate Limiting (OpenDota):**
    *   Anonymous: 60 requests per minute.
    *   With API Key: 1200 requests per minute (check OpenDota docs for current limits).
    *   **POC Mitigation:** The backend acting as a proxy, combined with basic in-memory caching, should help manage this for POC scale. Log API response headers related to rate limits if available to monitor usage.

## 5. Basic Data Models (POC Scope)
These models describe the basic structure of data entities for the POC. They are simplified and may not represent final database schemas but rather the shape of data used by the application.

### 5.1. User Model (Primarily for Authentication Context)
*   **Purpose:** Represents an authenticated user in the system. For the POC, this might not be persisted heavily in a database but rather reconstructed from session data.
*   **Fields:**
    *   `steamId`: String (64-bit Steam ID, primary identifier) - *Required*
    *   `personaName`: String (Current Steam nickname) - *Fetched from Steam API*
    *   `avatarUrl`: String (URL to Steam avatar image) - *Fetched from Steam API*
    *   `lastLogin`: Date (Timestamp of last login) - *Optional for POC*
*   **Storage (POC):** Steam ID stored in session. Persona name and avatar URL fetched on demand or cached lightly with the session. If a DB is used, this model would map to a `Users` table/collection.

### 5.2. PlayerSummary Model (For Player Profile Feature)
*   **Purpose:** Represents the aggregated statistics and information for a Dota 2 player, as displayed on their profile page.
*   **Fields (examples, based on OpenDota API structure):**
    *   `accountId`: Number (Dota 2 account ID)
    *   `profile`: Object (Contains persona name, avatar, Steam ID etc. from OpenDota's player endpoint)
        *   `personaname`: String
        *   `avatarfull`: String (URL)
        *   `steamid`: String
    *   `mmrEstimate`: Object or Number (Estimated MMR, structure varies by API)
    *   `winLoss`: Object
        *   `win`: Number
        *   `lose`: Number
    *   `recentMatches`: Array of `MatchInfo` objects (see 5.3, simplified for summary)
    *   `mostPlayedHeroes`: Array of Objects
        *   `heroId`: String
        *   `games`: Number
        *   `win`: Number
        *   `with_games`: Number (games played with this hero)
        *   `with_win`: Number (wins with this hero)
*   **Source:** Aggregated from various Dota 2 Data API endpoints.
*   **Storage (POC):** Fetched on demand. Potentially cached on backend (in-memory).

### 5.3. MatchInfo Model (For Match History & Basic Match Analysis)
*   **Purpose:** Represents key details of a single Dota 2 match.
*   **Fields (examples, based on OpenDota API structure for recent matches or full match details):**
    *   `matchId`: Number (Unique identifier for the match) - *Required*
    *   `heroId`: Number (Hero played by the queried player in this match)
    *   `playerSlot`: Number
    *   `radiantWin`: Boolean (True if Radiant won, False if Dire won)
    *   `duration`: Number (Match duration in seconds)
    *   `gameMode`: Number (Enum representing game mode)
    *   `startTime`: Number (Unix timestamp of match start)
    *   `kills`: Number (Kills by the queried player)
    *   `deaths`: Number (Deaths of the queried player)
    *   `assists`: Number (Assists by the queried player)
    *   `items`: Array of Numbers (Item IDs for final items, if displaying simple list)
    *   **For Full Match View (POC might simplify):**
        *   `players`: Array of Objects (detailed stats for each player in the match)
            *   `accountId`: Number
            *   `heroId`: Number
            *   `kills`: Number
            *   `deaths`: Number
            *   `assists`: Number
            *   `goldPerMin`: Number
            *   `xpPerMin`: Number
            *   `netWorth`: Number
            *   `finalItems`: Array of Numbers
        *   `radiantScore`: Number
        *   `direScore`: Number
        *   `graphData`: Object (Time-series data for gold/XP graphs - might be simplified or omitted for POC if too complex to implement quickly)
*   **Source:** Dota 2 Data API (e.g., OpenDota `/matches/{match_id}` or `/players/{account_id}/recentMatches`).
*   **Storage (POC):** Fetched on demand. Potentially cached on backend (in-memory).

### 5.4. HeroInfo Model (For Hero Information Hub)
*   **Purpose:** Represents static and dynamic information about a Dota 2 hero.
*   **Fields (examples, based on OpenDota `/heroStats` or similar):**
    *   `id`: Number (Hero ID) - *Required*
    *   `name`: String (Internal name, e.g., `npc_dota_hero_antimage`)
    *   `localizedName`: String (Display name, e.g., "Anti-Mage")
    *   `primaryAttr`: String (`agi`, `str`, `int`, `all` for universal)
    *   `attackType`: String (`Melee`, `Ranged`)
    *   `roles`: Array of Strings (e.g., `Carry`, `Escape`, `Nuker`)
    *   `img`: String (URL path to hero image, relative to API base)
    *   `icon`: String (URL path to hero icon)
    *   `baseHealth`: Number
    *   `baseMana`: Number
    *   `baseArmor`: Number
    *   `baseAttackMin`: Number
    *   `baseAttackMax`: Number
    *   `moveSpeed`: Number
    *   `abilities`: Array of Objects/Strings (Details about abilities - structure varies, could be complex. For POC, might just list names or link to external wikis).
    *   `talents`: Array of Objects (Details about talents - structure varies. POC might simplify).
*   **Source:** Dota 2 Data API (e.g., OpenDota `/heroStats`) or potentially from game data files via a community CDN.
*   **Storage (POC):** Fetched on demand, likely cached for longer durations (e.g., 24 hours) as this data changes less frequently than player/match data.

**Note on POC Data Handling:** For the Proof of Concept, the emphasis is on fetching data from APIs and displaying it. Persistent storage of this game-related data (PlayerSummary, MatchInfo, HeroInfo) in a dedicated database on our side will be minimal to non-existent, relying instead on backend caching. The User Model is primarily for the context of the logged-in user via Steam.

## 6. Deployment Strategy (POC)
The deployment strategy for the POC will prioritize simplicity, speed, and cost-effectiveness (ideally free tiers).

### 6.1. Proposed Platform
*   **Frontend (React SPA):**
    *   **Vercel:** Offers seamless deployment for Next.js (if used) and other frontend frameworks like React (Create React App/Vite). Provides free tier, HTTPS, global CDN.
    *   **Netlify:** Similar to Vercel, excellent for static sites and SPAs. Also has a generous free tier.
    *   **GitHub Pages:** Possible if the SPA is purely static or if backend interaction is carefully managed, but less flexible for integrated apps.
    *   **Choice for POC:** Vercel or Netlify due to ease of use with React applications.
*   **Backend (Node.js/Express.js Server):**
    *   **Heroku:** Classic PaaS with a free tier for Node.js applications. Easy to deploy via Git.
    *   **Fly.io:** Offers a free tier and allows deploying Docker containers, good for Node.js apps.
    *   **Render:** Another platform similar to Heroku with a free tier for web services.
    *   **Choice for POC:** Heroku due to its long-standing support for Node.js and extensive documentation for quick setup.
*   **Database (If used beyond session store, e.g., for minimal user data):**
    *   **MongoDB Atlas:** Free tier (M0).
    *   **Heroku Postgres:** Free tier.
    *   **Redis (for session/caching):** Heroku Redis (free tier) or other cloud Redis providers with free options.

### 6.2. Build Process (Simplified for POC)
*   **Frontend:**
    *   Use `npm run build` (or equivalent Vite/CRA command) to create optimized static assets.
    *   Vercel/Netlify will typically auto-detect the framework and run this command upon Git push.
*   **Backend:**
    *   Heroku deployment can be done via Git push. Heroku detects `package.json` and installs dependencies, then runs the `start` script (usually `node server.js` or similar).
    *   No complex CI/CD pipelines for POC; manual deployment or platform-integrated Git push is sufficient.

### 6.3. Environment Variables
*   **Frontend (if needed, e.g. Backend API URL):** Vercel/Netlify provide UI for setting environment variables (e.g., `REACT_APP_BACKEND_URL`).
*   **Backend:** Heroku (and others) provide a way to set config vars (environment variables) for:
    *   `STEAM_API_KEY`
    *   `OPENDOTA_API_KEY` (if used)
    *   `DATABASE_URL` (if a database is used)
    *   `SESSION_SECRET` (for `express-session`)
    *   `PORT` (usually provided by the platform)

## 7. Scope and Limitations for POC
This section clarifies what is included and excluded in the Proof of Concept.

### 7.1. Included Features (Mapping to Functional Spec MVP - POC Subset)
The POC will aim to implement a thin slice of the core MVP features from the Functional Specification:
*   **User Authentication (Subset of 3.4 from Func Spec):**
    *   Login with Steam (FR-UA-001, FR-UA-002).
    *   Display basic logged-in user info (persona name, avatar) (part of FR-UA-004).
    *   Logout (FR-UA-005).
    *   Session management (FR-UA-004).
*   **Player Profile & Statistics (Subset of 3.1 from Func Spec):**
    *   Search player by Dota 2 ID or name (FR-PPS-001 - basic implementation).
    *   Display profile overview: name, avatar, MMR (if easily available), overall win rate, total matches (subset of FR-PPS-002).
    *   Display recent matches list (hero, result, KDA, link to basic match view) (subset of FR-PPS-003, no filtering/pagination for POC).
*   **Hero Information Hub (Subset of 3.2 from Func Spec):**
    *   Display a list of all heroes (name, icon) (subset of FR-HIH-001, minimal filtering if any).
    *   Display basic details for a selected hero (name, image, primary attribute, abilities list - no deep details like videos or full talent trees for POC) (subset of FR-HIH-002).
*   **Basic Match Analysis (Subset of 3.3 from Func Spec):**
    *   Display basic match overview (winning team, score, duration) (subset of FR-BMA-001).
    *   Display a simplified scoreboard for both teams (hero, player name, KDA) (subset of FR-BMA-002, no extensive stats like net worth graphs for POC).

### 7.2. Excluded Features (From broader Functional Spec & even some MVP details)
*   **Advanced Filtering/Sorting:** Most filtering and sorting options in match history or hero lists.
*   **Detailed Hero Information:** In-depth ability descriptions, talent trees with stats, item build suggestions, counters/synergies. Links to external wikis might be used instead for POC.
*   **Detailed Match Analysis:** Performance graphs (Net Worth, XP), detailed event timelines, item timings, ability builds.
*   **Comprehensive Error Handling:** Only essential error handling will be implemented.
*   **Extensive UI Polish & Responsiveness:** Focus on functionality over perfect UI. Basic responsiveness for desktop.
*   **Accessibility (WCAG):** Not a primary focus for POC, but basic semantic HTML will be used.
*   **Non-Functional Requirements (Strict Adherence):** Performance targets, scalability, full security hardening will be secondary to functional demonstration.
*   **Caching:** Only very basic in-memory caching on the backend if essential. No Redis or dedicated cache for POC.
*   **Database Persistence for Game Data:** All game data (player stats, match details, hero info) will be fetched live from APIs or from a very short-lived cache. No saving of this data to our own persistent DB.
*   **User Data Persistence (beyond session):** No saving of user preferences, tracked players, etc. User model is primarily for auth context.
*   **Optional features from Func Spec:** Peer comparison (FR-PPS-005), most "Optional - Basic" items unless extremely easy.

### 7.3. Known Limitations and Simplifications for POC
*   **API Rate Limits:** The POC might be susceptible to API rate limits if used heavily, due to minimal caching.
*   **Data Freshness:** Data will be as fresh as the external APIs provide, with minimal local caching. Manual refresh options from Func Spec likely excluded for POC simplicity.
*   **UI/UX:** Will be basic and functional, not highly polished.
*   **Testing:** Minimal automated testing. Focus on manual testing of core paths.
*   **Security:** Basic security for API keys (environment variables). No in-depth security review or hardening for POC.

## 8. Document Control
   8.1. Version History
