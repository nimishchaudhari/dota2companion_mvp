# File-Based Backend Architecture

## Overview

This document describes the complete file-based backend architecture for the Dota 2 Companion app. The system combines static JSON files with client-side storage to provide a full-featured backend without requiring a server.

## Architecture Components

### 1. Static Data Layer (`/frontend/public/data/`)

#### Heroes Data (`/heroes/recommendations.json`)
- Hero recommendations by role, difficulty, and meta tier
- Synergy and counter-pick data
- Beginner-friendly hero suggestions
- Meta analysis and trending heroes

#### Items Data (`/items/builds.json`)
- Hero-specific item builds (standard and situational)
- Item categories and recommendations
- Situational build guides
- Core, situational, and luxury item classifications

#### Meta Analysis (`/meta/analysis.json`)
- Current patch analysis and hero tiers
- Patch change tracking
- Meta trends and insights
- Role priorities and recommended strategies

#### User Schema (`/users/schema.json`)
- User profile data structure
- Validation rules and field types
- Default preferences and settings
- Example data format

### 2. Hybrid API Service (`/frontend/src/services/fileBackend.js`)

The main service that orchestrates static data loading and client-side storage:

```javascript
import { fileBackend } from './services/fileBackend.js';

// Initialize the service
await fileBackend.initialize();

// Get hero recommendations
const recommendations = await fileBackend.getHeroRecommendations({
  role: 'carry',
  difficulty: 'beginner'
});

// Manage user favorites
await fileBackend.addFavoriteHero(1, 'Anti-Mage', 'carry', 'Great farmer');
const favorites = await fileBackend.getFavoriteHeroes();
```

#### Key Features:
- **Static file loading** with caching
- **User profile management**
- **Favorites system** (heroes and items)
- **Custom builds** storage
- **Match history caching**
- **Data synchronization**

### 3. Client Storage Layer

#### IndexedDB Service (`/frontend/src/services/storage/indexedDB.js`)
- Primary storage for structured data
- Supports complex queries and relationships
- Automatic schema management
- Data export/import functionality

```javascript
import { dbService } from './services/storage/indexedDB.js';

// Save user profile
await dbService.saveUserProfile(profileData);

// Get hero favorites
const favorites = await dbService.getHeroFavorites(userId);
```

#### LocalStorage Service (`/frontend/src/services/storage/localStorage.js`)
- Fallback storage when IndexedDB unavailable
- Simple key-value storage
- Automatic cleanup and quota management
- Data migration support

```javascript
import { localStorageService } from './services/storage/localStorage.js';

// Check availability
if (localStorageService.isAvailable) {
  // Save settings
  localStorageService.saveSetting('theme', 'dark');
}
```

### 4. Recommendation Engine (`/frontend/src/services/engine/recommendations.js`)

Intelligent recommendation system that processes static data with user preferences:

```javascript
import { recommendationEngine } from './services/engine/recommendations.js';

// Get personalized recommendations
const recommendations = recommendationEngine.getPersonalizedRecommendations(
  allRecommendations,
  userProfile,
  {
    role: 'carry',
    teamComposition: [23, 5], // Crystal Maiden, Vengeful Spirit
    enemyTeam: [74, 8] // Invoker, Juggernaut
  }
);
```

#### Features:
- **Context-aware filtering** (team composition, enemy picks)
- **User preference integration**
- **Synergy and counter analysis**
- **Meta-aware scoring**
- **Reasoning generation**

### 5. Enhanced API Service (`/frontend/src/services/enhancedApi.js`)

Unified interface that combines OpenDota API with file backend:

```javascript
import { enhancedApi } from './services/enhancedApi.js';

// Get enhanced hero data (live + recommendations)
const heroes = await enhancedApi.getEnhancedHeroes();

// Get personalized recommendations
const personalizedRecs = await enhancedApi.getPersonalizedHeroRecommendations({
  role: 'support',
  gameMode: 'ranked_matchmaking'
});
```

## Data Flow

```
User Request
     ↓
Enhanced API Service
     ↓
┌─────────────────┐    ┌──────────────────┐
│   OpenDota API  │    │   File Backend   │
│   (Live Data)   │    │  (Static Data)   │
└─────────────────┘    └──────────────────┘
     ↓                           ↓
┌─────────────────────────────────────────────┐
│          Recommendation Engine              │
│     (Process & Score Recommendations)       │
└─────────────────────────────────────────────┘
     ↓
┌─────────────────┐    ┌──────────────────┐
│   IndexedDB     │    │  LocalStorage    │
│   (Primary)     │    │   (Fallback)     │
└─────────────────┘    └──────────────────┘
     ↓
Enhanced Response to User
```

## Usage Examples

### Basic Setup

```javascript
import { enhancedApi } from './services';

// Initialize the enhanced API
await enhancedApi.initialize();

// Check system health
const health = await enhancedApi.healthCheck();
console.log('System status:', health.status);
```

### User Profile Management

```javascript
// Create a new user profile
const profile = await enhancedApi.createUserProfile(
  '76561197960287930', // Steam ID
  'TestPlayer',
  {
    role_preference: 'carry',
    hero_complexity: 'intermediate',
    theme: 'dark'
  }
);

// Update preferences
await enhancedApi.updateUserProfile({
  preferences: {
    ...profile.preferences,
    role_preference: 'support'
  }
});
```

### Hero Recommendations

```javascript
// Get role-based recommendations
const recommendations = await enhancedApi.getHeroRecommendations({
  role: 'support',
  difficulty: 'beginner'
});

// Get personalized recommendations with context
const personalized = await enhancedApi.getPersonalizedHeroRecommendations({
  role: 'carry',
  teamComposition: [23, 5, 31], // Team hero IDs
  enemyTeam: [74, 8, 38], // Enemy hero IDs
  gameMode: 'ranked_matchmaking'
});
```

### Favorites Management

```javascript
// Add hero to favorites
await enhancedApi.saveUserFavoriteHero(
  1, // Anti-Mage ID
  'Anti-Mage',
  'carry',
  'Best farming carry'
);

// Get all favorite heroes
const favoriteHeroes = await enhancedApi.getUserFavoriteHeroes();

// Remove from favorites
await enhancedApi.removeUserFavoriteHero(1);
```

### Custom Builds

```javascript
// Save a custom build
const customBuild = {
  build_name: 'Early Fighting AM',
  description: 'Anti-Mage build for early participation',
  hero_id: 1,
  hero_name: 'Anti-Mage',
  role: 'carry',
  starting_items: [
    { item_id: 29, name: 'Tango', cost: 90 }
  ],
  early_game: [
    { item_id: 63, name: 'Power Treads', cost: 1400 }
  ],
  public: false
};

await enhancedApi.saveCustomBuild(1, customBuild);
```

### Data Export/Import

```javascript
// Export user data
const userData = await enhancedApi.exportUserData();

// Import user data
await enhancedApi.importUserData(userData);
```

## Performance Optimizations

### Caching Strategy
- **Static data caching** in memory with configurable TTL
- **IndexedDB caching** for user data with automatic cleanup
- **LocalStorage fallback** with quota management

### Data Loading
- **Lazy loading** of static files only when needed
- **Parallel loading** of multiple data sources
- **Error handling** with graceful fallbacks

### Storage Management
- **Automatic cleanup** of old cached data
- **Quota monitoring** and management
- **Data migration** between storage methods

## Error Handling

The system implements comprehensive error handling:

1. **Service availability checks** before operations
2. **Graceful fallbacks** when services are unavailable
3. **Error logging** and user-friendly error messages
4. **Health monitoring** and status reporting

## Integration with Existing Codebase

The file backend integrates seamlessly with the existing application:

1. **Maintains compatibility** with existing API calls
2. **Enhances existing data** with recommendations
3. **Provides new features** without breaking changes
4. **Supports gradual migration** to enhanced features

## Future Enhancements

1. **Offline support** with service workers
2. **Data synchronization** across devices
3. **Machine learning** for recommendation improvement
4. **Community features** for sharing builds
5. **Real-time updates** for meta changes

## File Structure

```
frontend/
├── public/
│   └── data/
│       ├── heroes/
│       │   └── recommendations.json
│       ├── items/
│       │   └── builds.json
│       ├── meta/
│       │   └── analysis.json
│       └── users/
│           └── schema.json
└── src/
    └── services/
        ├── api.js (existing)
        ├── fileBackend.js
        ├── enhancedApi.js
        ├── index.js
        ├── storage/
        │   ├── indexedDB.js
        │   └── localStorage.js
        └── engine/
            └── recommendations.js
```

This architecture provides a robust, scalable, and maintainable solution for the Dota 2 Companion app's backend needs while remaining entirely client-side.