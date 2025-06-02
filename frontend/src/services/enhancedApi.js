// Enhanced API service that integrates OpenDota API with file-based backend
// Provides unified interface for both real-time data and static recommendations

import { api as openDotaApi, mockAuth } from './api.js';
import { fileBackend } from './fileBackend.js';

class EnhancedApiService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await fileBackend.initialize();
      this.initialized = true;
      console.log('Enhanced API service initialized');
    } catch (error) {
      console.error('Failed to initialize Enhanced API service:', error);
      throw error;
    }
  }

  // Hero-related methods that combine real-time and static data
  async getEnhancedHeroes() {
    await this.initialize();
    
    try {
      // Get real-time hero data from OpenDota
      const liveHeroes = await openDotaApi.getHeroes();
      
      // Get static recommendations
      const recommendations = await fileBackend.getHeroRecommendations();
      
      // Enhance heroes with recommendation data
      const enhancedHeroes = liveHeroes.map(hero => {
        // Find matching recommendations
        const metaPick = recommendations.meta_picks?.find(m => m.hero_id === hero.id);
        const beginnerFriendly = recommendations.beginner_friendly?.find(b => b.hero_id === hero.id);
        
        // Get role-based data
        let roleData = null;
        Object.entries(recommendations.role_based || {}).forEach(([role, heroes]) => {
          const match = heroes.find(h => h.hero_id === hero.id);
          if (match) {
            roleData = { role, ...match };
          }
        });

        return {
          ...hero,
          meta_info: metaPick ? {
            tier: metaPick.tier,
            win_rate: metaPick.win_rate,
            pick_rate: metaPick.pick_rate,
            ban_rate: metaPick.ban_rate,
            trend: metaPick.trend
          } : null,
          beginner_friendly: !!beginnerFriendly,
          difficulty: beginnerFriendly?.difficulty || 'medium',
          role_data: roleData,
          enhanced: true
        };
      });

      return enhancedHeroes;
    } catch (error) {
      console.error('Error getting enhanced heroes:', error);
      // Fallback to basic heroes
      return openDotaApi.getHeroes();
    }
  }

  async getHeroRecommendations(filters = {}) {
    await this.initialize();
    
    const userProfile = await fileBackend.getCurrentUserProfile();
    return fileBackend.getHeroRecommendations(filters, userProfile);
  }

  async getPersonalizedHeroRecommendations(context = {}) {
    await this.initialize();
    
    try {
      const userProfile = await fileBackend.getCurrentUserProfile();
      const allRecommendations = await fileBackend.getHeroRecommendations();
      
      const personalizedRecs = fileBackend.recommendationEngine.getPersonalizedRecommendations(
        allRecommendations,
        userProfile,
        context
      );

      return personalizedRecs;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return { recommendations: [], reasoning: [] };
    }
  }

  // Player-related methods with enhanced data
  async getEnhancedPlayerSummary(accountId) {
    await this.initialize();
    
    try {
      // Get real-time player data
      const playerSummary = await openDotaApi.getPlayerSummary(accountId);
      
      // Cache the match data
      if (playerSummary.recentMatches) {
        for (const match of playerSummary.recentMatches) {
          await fileBackend.cacheMatchData({
            match_id: match.match_id,
            hero_id: match.hero_id,
            result: match.radiant_win === (match.player_slot < 128) ? 'win' : 'loss',
            duration: match.duration,
            kda: {
              kills: match.kills,
              deaths: match.deaths,
              assists: match.assists
            },
            items: [], // Would need to get from match details
          });
        }
      }

      // Get cached historical data
      const cachedMatches = await fileBackend.getCachedMatches();
      
      // Calculate enhanced stats
      const enhancedStats = this.calculateEnhancedPlayerStats(
        playerSummary,
        cachedMatches
      );

      return {
        ...playerSummary,
        enhanced_stats: enhancedStats,
        cached_matches_count: cachedMatches.length,
        enhanced: true
      };
    } catch (error) {
      console.error('Error getting enhanced player summary:', error);
      return openDotaApi.getPlayerSummary(accountId);
    }
  }

  calculateEnhancedPlayerStats(playerSummary, cachedMatches) {
    const stats = {
      total_cached_matches: cachedMatches.length,
      favorite_heroes: {},
      role_distribution: {},
      recent_performance: {
        last_10_games: { wins: 0, losses: 0 },
        win_streak: 0,
        loss_streak: 0
      }
    };

    // Analyze cached matches
    cachedMatches.forEach((match, index) => {
      // Count hero usage
      if (!stats.favorite_heroes[match.hero_id]) {
        stats.favorite_heroes[match.hero_id] = { count: 0, wins: 0 };
      }
      stats.favorite_heroes[match.hero_id].count++;
      if (match.result === 'win') {
        stats.favorite_heroes[match.hero_id].wins++;
      }

      // Recent performance (last 10 games)
      if (index < 10) {
        if (match.result === 'win') {
          stats.recent_performance.last_10_games.wins++;
        } else {
          stats.recent_performance.last_10_games.losses++;
        }
      }
    });

    // Calculate win rates for favorite heroes
    Object.keys(stats.favorite_heroes).forEach(heroId => {
      const hero = stats.favorite_heroes[heroId];
      hero.win_rate = hero.count > 0 ? hero.wins / hero.count : 0;
    });

    // Calculate streaks
    let currentStreak = 0;
    let streakType = null;
    
    for (const match of cachedMatches) {
      if (streakType === null) {
        streakType = match.result;
        currentStreak = 1;
      } else if (match.result === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    if (streakType === 'win') {
      stats.recent_performance.win_streak = currentStreak;
    } else if (streakType === 'loss') {
      stats.recent_performance.loss_streak = currentStreak;
    }

    return stats;
  }

  // Match-related methods
  async getEnhancedMatchDetails(matchId) {
    await this.initialize();
    
    try {
      const matchDetails = await openDotaApi.getMatchDetails(matchId);
      
      // Get hero recommendations for the heroes in this match
      const heroRecommendations = await fileBackend.getHeroRecommendations();
      
      // Enhance player data with hero info
      const enhancedPlayers = matchDetails.players?.map(player => {
        let heroMeta = null;
        
        // Find hero in recommendations
        Object.values(heroRecommendations.role_based || {}).forEach(roleHeroes => {
          const heroMatch = roleHeroes.find(h => h.hero_id === player.hero_id);
          if (heroMatch) {
            heroMeta = heroMatch;
          }
        });

        return {
          ...player,
          hero_meta: heroMeta,
          enhanced: true
        };
      });

      return {
        ...matchDetails,
        players: enhancedPlayers,
        enhanced: true
      };
    } catch (error) {
      console.error('Error getting enhanced match details:', error);
      return openDotaApi.getMatchDetails(matchId);
    }
  }

  // Item and build methods
  async getEnhancedItemBuilds(heroId, context = {}) {
    await this.initialize();
    
    try {
      // Get static build data
      const staticBuilds = await fileBackend.getItemBuilds(heroId);
      
      // Get user's custom builds
      const customBuilds = await fileBackend.getCustomBuilds(heroId);
      
      // Get user profile for preferences
      const userProfile = await fileBackend.getCurrentUserProfile();
      
      // Enhance builds with meta information
      const enhancedBuilds = {
        ...staticBuilds,
        custom_builds: customBuilds,
        user_preferences: userProfile?.preferences,
        context_recommendations: this.getContextualItemRecommendations(context),
        enhanced: true
      };

      return enhancedBuilds;
    } catch (error) {
      console.error('Error getting enhanced item builds:', error);
      return fileBackend.getItemBuilds(heroId);
    }
  }

  getContextualItemRecommendations(context) {
    const recommendations = [];
    
    if (context.enemyHasInvisible) {
      recommendations.push({
        category: 'detection',
        items: ['Sentry Ward', 'Dust of Appearance', 'Gem of True Sight'],
        reason: 'Enemy team has invisible heroes'
      });
    }
    
    if (context.enemyHasHighMagicDamage) {
      recommendations.push({
        category: 'magic_resistance',
        items: ['Black King Bar', 'Pipe of Insight', 'Glimmer Cape'],
        reason: 'High enemy magic damage'
      });
    }
    
    if (context.lateGameScenario) {
      recommendations.push({
        category: 'late_game',
        items: ['Divine Rapier', 'Butterfly', 'Satanic'],
        reason: 'Late game items for carrying'
      });
    }

    return recommendations;
  }

  // Meta analysis methods
  async getEnhancedMetaAnalysis() {
    await this.initialize();
    
    try {
      const metaAnalysis = await fileBackend.getMetaAnalysis();
      
      // Get live hero data to cross-reference
      const liveHeroes = await openDotaApi.getHeroes();
      
      // Enhance meta analysis with live data
      const enhancedMeta = {
        ...metaAnalysis,
        live_data_timestamp: new Date().toISOString(),
        hero_count: liveHeroes.length,
        enhanced: true
      };

      return enhancedMeta;
    } catch (error) {
      console.error('Error getting enhanced meta analysis:', error);
      return fileBackend.getMetaAnalysis();
    }
  }

  // User profile and favorites management
  async saveUserFavoriteHero(heroId, heroName, role, notes = '') {
    await this.initialize();
    return fileBackend.addFavoriteHero(heroId, heroName, role, notes);
  }

  async removeUserFavoriteHero(heroId) {
    await this.initialize();
    return fileBackend.removeFavoriteHero(heroId);
  }

  async getUserFavoriteHeroes() {
    await this.initialize();
    return fileBackend.getFavoriteHeroes();
  }

  async saveUserFavoriteItem(itemId, itemName, category, notes = '') {
    await this.initialize();
    return fileBackend.addFavoriteItem(itemId, itemName, category, notes);
  }

  async removeUserFavoriteItem(itemId) {
    await this.initialize();
    return fileBackend.removeFavoriteItem(itemId);
  }

  async getUserFavoriteItems() {
    await this.initialize();
    return fileBackend.getFavoriteItems();
  }

  async saveCustomBuild(heroId, buildData) {
    await this.initialize();
    return fileBackend.saveCustomBuild(heroId, buildData);
  }

  async getCustomBuilds(heroId = null) {
    await this.initialize();
    return fileBackend.getCustomBuilds(heroId);
  }

  async deleteCustomBuild(buildId) {
    await this.initialize();
    return fileBackend.deleteCustomBuild(buildId);
  }

  // User profile management
  async getCurrentUserProfile() {
    await this.initialize();
    return fileBackend.getCurrentUserProfile();
  }

  async createUserProfile(steamId, personaName, preferences = {}) {
    await this.initialize();
    return fileBackend.createUserProfile(steamId, personaName, preferences);
  }

  async updateUserProfile(updates) {
    await this.initialize();
    return fileBackend.updateUserProfile(updates);
  }

  // Search methods (from original API)
  async searchPlayers(query) {
    return openDotaApi.searchPlayers(query);
  }

  // Data synchronization
  async syncAllData() {
    await this.initialize();
    
    try {
      // Sync file backend data
      await fileBackend.syncData();
      
      // Could also update cached API data here
      console.log('All data synchronized successfully');
      return { success: true };
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }

  // Health check for all services
  async healthCheck() {
    const results = {
      enhanced_api: 'checking',
      file_backend: 'checking',
      opendota_api: 'checking'
    };

    try {
      // Check file backend
      const fileBackendHealth = await fileBackend.healthCheck();
      results.file_backend = fileBackendHealth.status;

      // Check OpenDota API
      try {
        await openDotaApi.getHeroes();
        results.opendota_api = 'healthy';
      } catch {
        results.opendota_api = 'error';
      }

      // Overall status
      const allHealthy = Object.values(results).every(status => status === 'healthy');
      results.enhanced_api = allHealthy ? 'healthy' : 'degraded';

      return {
        status: results.enhanced_api,
        services: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        services: results,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Export/Import functionality
  async exportUserData() {
    await this.initialize();
    return fileBackend.exportUserData();
  }

  async importUserData(userData) {
    await this.initialize();
    return fileBackend.importUserData(userData);
  }
}

// Export singleton instance
export const enhancedApi = new EnhancedApiService();

// Re-export mockAuth for convenience
export { mockAuth };

// Default export
export default enhancedApi;