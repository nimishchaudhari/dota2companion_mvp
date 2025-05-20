// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios'); 

const app = express();
const PORT = process.env.PORT || 3001; // Standard Railway port
const OPENDOTA_API_URL = 'https://api.opendota.com/api';

// Simple in-memory caches
const playerSummaryCache = new Map();
const heroListCache = { timestamp: 0, data: null }; 
const matchDetailsCache = new Map(); 

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL_RAILWAY // Specific for Railway deployed frontend
          : 'http://localhost:5173',     // Vite's default dev port
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// Session Configuration
// Trust first proxy for Railway / other proxies
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); 
}
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_poc_session_secret_dev', // Ensure SESSION_SECRET is set on Railway
    resave: false,
    saveUninitialized: true, 
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // True if HTTPS, which Railway provides
        maxAge: 86400000, // 24 hours
        httpOnly: true, 
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : undefined // CSRF protection
    }
}));

// Mock User Data
const MOCK_USERS = {
    "testuser": {
        steamId: "76561197960287930", 
        personaName: "POC Test User",
        avatarUrl: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg"
    }
};

// Routes
app.get('/', (req, res) => {
  res.send('Dota 2 Companion Backend is running!');
});

// --- Authentication Routes ---
app.post('/auth/test/login', (req, res) => {
    const { username } = req.body;
    if (MOCK_USERS[username]) {
        req.session.user = MOCK_USERS[username]; 
        console.log('Login successful, session user:', req.session.user);
        res.json({ success: true, user: req.session.user });
    } else {
        console.log('Invalid test user:', username);
        res.status(401).json({ success: false, message: 'Invalid test user' });
    }
});

app.get('/auth/me', (req, res) => {
    if (req.session.user) {
        console.log('User authenticated, session user:', req.session.user);
        res.json({ success: true, user: req.session.user });
    } else {
        console.log('Not authenticated');
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
});

app.post('/auth/test/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, message: 'Could not log out' });
        }
        res.clearCookie('connect.sid'); 
        console.log('Logout successful');
        res.json({ success: true, message: 'Logged out' });
    });
});

// --- Player Data Routes ---
app.get('/api/player/:accountId/summary', async (req, res) => {
    const { accountId } = req.params;
    const cacheKey = `playerSummary_${accountId}`;

    if (playerSummaryCache.has(cacheKey)) {
        const cachedData = playerSummaryCache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) { 
            console.log(`Cache hit for player summary: ${accountId}`);
            return res.json(cachedData.data);
        }
    }
    console.log(`Cache miss or expired for player summary: ${accountId}`);

    try {
        const [playerRes, wlRes, recentMatchesRes] = await Promise.all([
            axios.get(`${OPENDOTA_API_URL}/players/${accountId}`),
            axios.get(`${OPENDOTA_API_URL}/players/${accountId}/wl`),
            axios.get(`${OPENDOTA_API_URL}/players/${accountId}/recentMatches?limit=10`)
        ]);

        const summaryData = {
            profile: playerRes.data.profile, 
            mmr_estimate: playerRes.data.mmr_estimate, 
            winLoss: wlRes.data,
            recentMatches: recentMatchesRes.data.map(match => ({ 
                match_id: match.match_id, hero_id: match.hero_id, player_slot: match.player_slot,
                radiant_win: match.radiant_win, duration: match.duration, game_mode: match.game_mode,
                kills: match.kills, deaths: match.deaths, assists: match.assists, start_time: match.start_time,
            })),
        };
        
        playerSummaryCache.set(cacheKey, { timestamp: Date.now(), data: summaryData });
        res.json(summaryData);

    } catch (error) {
        console.error(`Error fetching player summary for ${accountId}:`, error.message);
        if (error.response) {
            res.status(error.response.status).json({ message: `Error from OpenDota: ${error.response.statusText} for account ${accountId}` });
        } else {
            res.status(500).json({ message: 'Failed to fetch player summary' });
        }
    }
});

app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Search query "q" is required.' });
    }
    try {
        const searchRes = await axios.get(`${OPENDOTA_API_URL}/search?q=${encodeURIComponent(q)}`);
        res.json(searchRes.data);
    } catch (error) {
        console.error(`Error searching players for "${q}":`, error.message);
        if (error.response) {
            res.status(error.response.status).json({ message: `Error from OpenDota during search: ${error.response.statusText}` });
        } else {
            res.status(500).json({ message: 'Failed to search players' });
        }
    }
});

// --- Hero Data Route ---
app.get('/api/heroes', async (req, res) => {
    const CACHE_DURATION_MS_HEROES = 6 * 60 * 60 * 1000; 

    if (heroListCache.data && (Date.now() - heroListCache.timestamp < CACHE_DURATION_MS_HEROES)) {
        console.log('Cache hit for hero list.');
        return res.json(heroListCache.data);
    }
    console.log('Cache miss or expired for hero list.');

    try {
        const response = await axios.get(`${OPENDOTA_API_URL}/heroStats`);
        const dotaCdnBase = 'https://cdn.cloudflare.steamstatic.com';
        heroListCache.data = response.data.map(hero => ({ 
            id: hero.id, name: hero.name, localized_name: hero.localized_name,
            primary_attr: hero.primary_attr, attack_type: hero.attack_type, roles: hero.roles,
            img: `${dotaCdnBase}${hero.img}`, icon: `${dotaCdnBase}${hero.icon}`,
        }));
        heroListCache.timestamp = Date.now();
        res.json(heroListCache.data);
    } catch (error) {
        console.error('Error fetching hero stats:', error.message);
        if (error.response) {
            res.status(error.response.status).json({ message: `Error from OpenDota fetching hero stats: ${error.response.statusText}` });
        } else {
            res.status(500).json({ message: 'Failed to fetch hero stats' });
        }
    }
});

// --- Match Details Route ---
app.get('/api/matches/:matchId', async (req, res) => {
    const { matchId } = req.params;
    const CACHE_DURATION_MS_MATCH = 15 * 60 * 1000; 

    if (matchDetailsCache.has(matchId)) {
        const cachedMatch = matchDetailsCache.get(matchId);
        if (Date.now() - cachedMatch.timestamp < CACHE_DURATION_MS_MATCH) {
            console.log(`Cache hit for match details: ${matchId}`);
            return res.json(cachedMatch.data);
        }
    }
    console.log(`Cache miss or expired for match details: ${matchId}`);

    try {
        const response = await axios.get(`${OPENDOTA_API_URL}/matches/${matchId}`);
        const matchData = response.data;

        const simplifiedData = {
            match_id: matchData.match_id, radiant_win: matchData.radiant_win, duration: matchData.duration,
            radiant_score: matchData.radiant_score, dire_score: matchData.dire_score, start_time: matchData.start_time,
            game_mode: matchData.game_mode, 
            players: matchData.players?.map(p => ({
                account_id: p.account_id, player_slot: p.player_slot, hero_id: p.hero_id,
                personaname: p.personaname || 'Anonymous', kills: p.kills, deaths: p.deaths, assists: p.assists,
            })) || []
        };
        
        matchDetailsCache.set(matchId, { timestamp: Date.now(), data: simplifiedData });
        res.json(simplifiedData);

    } catch (error) {
        console.error(`Error fetching match details for ${matchId}:`, error.message);
        if (error.response) {
            res.status(error.response.status).json({ message: `Error from OpenDota for match ${matchId}: ${error.response.statusText}` });
        } else {
            res.status(500).json({ message: 'Failed to fetch match details' });
        }
    }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}. NODE_ENV: ${process.env.NODE_ENV}`);
});
