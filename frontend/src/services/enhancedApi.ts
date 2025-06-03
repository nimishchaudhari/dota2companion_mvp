// Enhanced API service that integrates OpenDota API with file-based backend
// Provides unified interface for both real-time data and static recommendations

import { api as openDotaApi, mockAuth } from './api';
import { fileBackend } from './fileBackend';
import type {
  Hero,
  PlayerSummary,
  MatchDetails
} from '../types';

// Enhanced data types
export interface EnhancedHero extends Hero {
  meta_info?: {
    tier: string;
    win_rate: number;
    pick_rate: number;
    ban_rate: number;
    trend: 'rising' | 'falling' | 'stable';
  } | null;
  beginner_friendly: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  role_data?: {
    role: string;
    [key: string]: any;
  } | null;
  enhanced: true;
}

export interface EnhancedPlayerStats {
  total_cached_matches: number;
  favorite_heroes: Record<number, {
    count: number;
    wins: number;
    win_rate: number;
  }>;
  role_distribution: Record<string, number>;
  recent_performance: {
    last_10_games: { wins: number; losses: number };
    win_streak: number;
    loss_streak: number;
  };
}

export interface EnhancedPlayerSummary extends PlayerSummary {
  enhanced_stats?: EnhancedPlayerStats;
  cached_matches_count?: number;
  enhanced: true;
}

export interface EnhancedMatchPlayer {
  account_id?: number;
  player_slot: number;
  hero_id: number;
  personaname?: string;
  kills: number;
  deaths: number;
  assists: number;
  hero_meta?: any;
  enhanced: true;
}

export interface EnhancedMatchDetails extends Omit<MatchDetails, 'players'> {
  players: EnhancedMatchPlayer[];
  enhanced: true;
}

export interface ContextualRecommendation {
  category: string;
  items: string[];
  reason: string;
}

export interface GameContext {
  enemyHasInvisible?: boolean;
  enemyHasHighMagicDamage?: boolean;
  lateGameScenario?: boolean;
  [key: string]: any;
}

export interface EnhancedItemBuilds {
  custom_builds?: any[];
  user_preferences?: any;
  context_recommendations?: ContextualRecommendation[];
  enhanced: true;
  [key: string]: any;
}

export interface EnhancedMetaAnalysis {
  live_data_timestamp: string;
  hero_count: number;
  enhanced: true;
  [key: string]: any;
}

export interface UserFavoriteHero {
  heroId: number;
  heroName: string;
  role: string;
  notes?: string;
  dateAdded: string;
}

export interface UserFavoriteItem {
  itemId: number;
  itemName: string;
  category: string;
  notes?: string;
  dateAdded: string;
}

export interface CustomBuild {
  id: string;
  heroId: number;
  name: string;
  items: any[];
  description?: string;
  isPublic: boolean;
  dateCreated: string;
  dateModified: string;
}

export interface UserProfile {
  steamId: string;
  personaName: string;
  preferences: Record<string, any>;
  favoriteHeroes: UserFavoriteHero[];
  favoriteItems: UserFavoriteItem[];
  customBuilds: CustomBuild[];
  statistics: Record<string, any>;
}

export interface CachedMatch {
  match_id: number;
  hero_id: number;
  result: 'win' | 'loss';
  duration: number;
  kda: {
    kills: number;
    deaths: number;
    assists: number;
  };
  items: any[];
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'error' | 'checking';
  services?: Record<string, string>;
  timestamp: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  error?: string;
}

class EnhancedApiService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await fileBackend.initialize();
      this.initialized = true;
      // Enhanced API service initialized
    } catch (error) {
      console.error('Failed to initialize Enhanced API service:', error);
      throw error;
    }
  }

  // Hero-related methods that combine real-time and static data
  async getEnhancedHeroes(): Promise<EnhancedHero[]> {
    await this.initialize();
    
    try {
      // Get real-time hero data from OpenDota
      const liveHeroes = await openDotaApi.getHeroes();
      
      // Get static recommendations
      const recommendations = await fileBackend.getHeroRecommendations();
      
      // Enhance heroes with recommendation data
      const enhancedHeroes: EnhancedHero[] = liveHeroes.map((hero): EnhancedHero => {
        // Find matching recommendations
        const metaPick = recommendations.meta_picks?.find((m: any) => m.hero_id === hero.id);
        const beginnerFriendly = recommendations.beginner_friendly?.find((b: any) => b.hero_id === hero.id);
        
        // Get role-based data
        let roleData: { role: string; [key: string]: any } | null = null;
        Object.entries(recommendations.role_based || {}).forEach(([role, heroes]) => {
          const match = (heroes as any[]).find((h: any) => h.hero_id === hero.id);
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
      // Fallback to basic heroes with enhanced flag
      const basicHeroes = await openDotaApi.getHeroes();
      return basicHeroes.map((hero): EnhancedHero => ({
        ...hero,
        beginner_friendly: false,
        difficulty: 'medium' as const,
        enhanced: true
      }));
    }
  }

  async getHeroRecommendations(filters: Record<string, any> = {}): Promise<any> {
    await this.initialize();
    
    const userProfile = await fileBackend.getCurrentUserProfile();
    return fileBackend.getHeroRecommendations(filters, userProfile);
  }

  async getPersonalizedHeroRecommendations(context: Record<string, any> = {}): Promise<{ recommendations: any[]; reasoning: any[] }> {
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
  async getEnhancedPlayerSummary(accountId: number): Promise<EnhancedPlayerSummary> {
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
      const basicSummary = await openDotaApi.getPlayerSummary(accountId);
      return { ...basicSummary, enhanced: true };
    }
  }

  private calculateEnhancedPlayerStats(playerSummary: PlayerSummary, cachedMatches: CachedMatch[]): EnhancedPlayerStats {
    const stats: EnhancedPlayerStats = {
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
        stats.favorite_heroes[match.hero_id] = { count: 0, wins: 0, win_rate: 0 };
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
    Object.keys(stats.favorite_heroes).forEach(heroIdStr => {
      const heroId = parseInt(heroIdStr);
      const hero = stats.favorite_heroes[heroId];
      hero.win_rate = hero.count > 0 ? hero.wins / hero.count : 0;
    });

    // Calculate streaks
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | null = null;
    
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
  async getEnhancedMatchDetails(matchId: number): Promise<EnhancedMatchDetails> {
    await this.initialize();
    
    try {
      const matchDetails = await openDotaApi.getMatchDetails(matchId);
      
      // Get hero recommendations for the heroes in this match
      const heroRecommendations = await fileBackend.getHeroRecommendations();
      
      // Enhance player data with hero info
      const enhancedPlayers: EnhancedMatchPlayer[] = matchDetails.players?.map((player): EnhancedMatchPlayer => {
        let heroMeta: any = null;
        
        // Find hero in recommendations
        Object.values(heroRecommendations.role_based || {}).forEach((roleHeroes: any) => {
          const heroMatch = roleHeroes.find((h: any) => h.hero_id === player.hero_id);
          if (heroMatch) {
            heroMeta = heroMatch;
          }
        });

        return {
          account_id: player.account_id,
          player_slot: player.player_slot,
          hero_id: player.hero_id,
          personaname: player.personaname,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          hero_meta: heroMeta,
          enhanced: true
        };
      }) || [];

      return {
        ...matchDetails,
        players: enhancedPlayers,
        enhanced: true
      };
    } catch (error) {
      console.error('Error getting enhanced match details:', error);
      const basicMatch = await openDotaApi.getMatchDetails(matchId);
      const enhancedPlayers: EnhancedMatchPlayer[] = basicMatch.players?.map((player): EnhancedMatchPlayer => ({
        account_id: player.account_id,
        player_slot: player.player_slot,
        hero_id: player.hero_id,
        personaname: player.personaname,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        enhanced: true
      })) || [];
      
      return { ...basicMatch, players: enhancedPlayers, enhanced: true };
    }
  }

  // Item and build methods
  async getEnhancedItemBuilds(heroId: number, context: GameContext = {}): Promise<EnhancedItemBuilds> {
    await this.initialize();
    
    try {
      // Get static build data
      const staticBuilds = await fileBackend.getItemBuilds(heroId);
      
      // Get user's custom builds
      const customBuilds = await fileBackend.getCustomBuilds(heroId);
      
      // Get user profile for preferences
      const userProfile = await fileBackend.getCurrentUserProfile();
      
      // Enhance builds with meta information
      const enhancedBuilds: EnhancedItemBuilds = {
        ...staticBuilds,
        custom_builds: customBuilds,
        user_preferences: userProfile?.preferences,
        context_recommendations: this.getContextualItemRecommendations(context),
        enhanced: true
      };

      return enhancedBuilds;
    } catch (error) {
      console.error('Error getting enhanced item builds:', error);
      const basicBuilds = await fileBackend.getItemBuilds(heroId);
      return { ...basicBuilds, enhanced: true };
    }
  }

  private getContextualItemRecommendations(context: GameContext): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];
    
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
  async getEnhancedMetaAnalysis(): Promise<EnhancedMetaAnalysis> {
    await this.initialize();
    
    try {
      const metaAnalysis = await fileBackend.getMetaAnalysis();
      
      // Get live hero data to cross-reference
      const liveHeroes = await openDotaApi.getHeroes();
      
      // Enhance meta analysis with live data
      const enhancedMeta: EnhancedMetaAnalysis = {
        ...metaAnalysis,
        live_data_timestamp: new Date().toISOString(),
        hero_count: liveHeroes.length,
        enhanced: true
      };

      return enhancedMeta;
    } catch (error) {
      console.error('Error getting enhanced meta analysis:', error);
      const basicMeta = await fileBackend.getMetaAnalysis();
      return {
        ...basicMeta,
        live_data_timestamp: new Date().toISOString(),
        hero_count: 0,
        enhanced: true
      };
    }
  }

  // User profile and favorites management
  async saveUserFavoriteHero(heroId: number, heroName: string, role: string, notes = ''): Promise<any> {
    await this.initialize();
    return fileBackend.addFavoriteHero(heroId, heroName, role, notes);
  }

  async removeUserFavoriteHero(heroId: number): Promise<any> {
    await this.initialize();
    return fileBackend.removeFavoriteHero(heroId);
  }

  async getUserFavoriteHeroes(): Promise<UserFavoriteHero[]> {
    await this.initialize();
    return fileBackend.getFavoriteHeroes();
  }

  async saveUserFavoriteItem(itemId: number, itemName: string, category: string, notes = ''): Promise<any> {
    await this.initialize();
    return fileBackend.addFavoriteItem(itemId, itemName, category, notes);
  }

  async removeUserFavoriteItem(itemId: number): Promise<any> {
    await this.initialize();
    return fileBackend.removeFavoriteItem(itemId);
  }

  async getUserFavoriteItems(): Promise<UserFavoriteItem[]> {
    await this.initialize();
    return fileBackend.getFavoriteItems();
  }

  async saveCustomBuild(heroId: number, buildData: Partial<CustomBuild>): Promise<any> {
    await this.initialize();
    return fileBackend.saveCustomBuild(heroId, buildData);
  }

  async getCustomBuilds(heroId: number | null = null): Promise<CustomBuild[]> {
    await this.initialize();
    return fileBackend.getCustomBuilds(heroId);
  }

  async deleteCustomBuild(buildId: string): Promise<any> {
    await this.initialize();
    return fileBackend.deleteCustomBuild(buildId);
  }

  // User profile management
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    await this.initialize();
    return fileBackend.getCurrentUserProfile();
  }

  async createUserProfile(steamId: string, personaName: string, preferences: Record<string, any> = {}): Promise<any> {
    await this.initialize();
    return fileBackend.createUserProfile(steamId, personaName, preferences);
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<any> {
    await this.initialize();
    return fileBackend.updateUserProfile(updates);
  }

  // Search methods (from original API)
  async searchPlayers(query: string): Promise<any> {
    return openDotaApi.searchPlayers(query);
  }

  // Data synchronization
  async syncAllData(): Promise<SyncResult> {
    await this.initialize();
    
    try {
      // Sync file backend data
      await fileBackend.syncData();
      
      // Could also update cached API data here
      // All data synchronized successfully
      return { success: true };
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }

  // Health check for all services
  async healthCheck(): Promise<HealthCheckResult> {
    const results: Record<string, string> = {
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
        status: results.enhanced_api as 'healthy' | 'degraded' | 'error',
        services: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: (error as Error).message,
        services: results,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Export/Import functionality
  async exportUserData(): Promise<any> {
    await this.initialize();
    return fileBackend.exportUserData();
  }

  async importUserData(userData: any): Promise<any> {
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