// Hybrid file-based backend service
// Combines static file loading with client-side storage (IndexedDB + LocalStorage)

import { dbService } from './storage/indexedDB';
import { localStorageService } from './storage/localStorage';
import { recommendationEngine } from './engine/recommendations';
import type {
  UserProfile,
  UserFavoriteHero,
  UserFavoriteItem,
  CustomBuild,
  CachedMatch,
  HealthCheckResult
} from '../types';

interface StaticDataCache {
  [key: string]: any;
}

interface HeroRecommendations {
  meta_picks?: Array<{
    hero_id: number;
    tier: string;
    win_rate: number;
    pick_rate: number;
    ban_rate: number;
    trend: 'rising' | 'falling' | 'stable';
  }>;
  beginner_friendly?: Array<{
    hero_id: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  role_based?: Record<string, Array<{
    hero_id: number;
    [key: string]: any;
  }>>;
  counter_picks?: Record<number, {
    counters: any[];
    countered_by: any[];
  }>;
  synergies?: {
    strong_combos: Array<{
      heroes: Array<{ hero_id: number }>;
      [key: string]: any;
    }>;
  };
}

interface ItemBuilds {
  builds: {
    hero_builds: Record<number, any>;
    situation_builds: Record<string, any>;
    item_categories: Record<string, any[]>;
  };
}

interface MetaAnalysis {
  analysis: {
    hero_tiers: any;
    patch_changes: Record<string, any>;
    trends: any;
    meta_insights: any;
  };
}

interface UserSchema {
  schema: any;
}

class FileBackendService {
  private cache: Map<string, any> = new Map();
  private initialized = false;
  private readonly dataPath = '/data';
  public readonly recommendationEngine = recommendationEngine;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await dbService.initialize();
      this.initialized = true;
      // FileBackend service initialized
    } catch (error) {
      console.error('Failed to initialize FileBackend service:', error);
      throw error;
    }
  }

  // Static data loading methods
  async loadStaticData<T = any>(category: string, file: string): Promise<T> {
    const cacheKey = `${category}/${file}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as T;
    }

    try {
      const response = await fetch(`${this.dataPath}/${category}/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${cacheKey}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data as T;
    } catch (error) {
      console.error(`Error loading static data ${cacheKey}:`, error);
      throw error;
    }
  }

  // Hero-related methods
  async getHeroRecommendations(filters: Record<string, any> = {}, userProfile?: UserProfile | null): Promise<HeroRecommendations> {
    await this.initialize();
    
    try {
      const data = await this.loadStaticData<{ recommendations: HeroRecommendations }>('heroes', 'recommendations.json');
      const currentUserProfile = userProfile || await this.getCurrentUserProfile();
      
      return recommendationEngine.filterRecommendations(
        data.recommendations,
        filters,
        currentUserProfile
      );
    } catch (error) {
      console.error('Error getting hero recommendations:', error);
      throw error;
    }
  }

  async getHeroByRole(role: string): Promise<any[]> {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.role_based?.[role] || [];
  }

  async getBeginnerFriendlyHeroes(): Promise<any[]> {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.beginner_friendly || [];
  }

  async getMetaHeroes(): Promise<any[]> {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.meta_picks || [];
  }

  async getHeroCounters(heroId: number): Promise<{ counters: any[]; countered_by: any[] }> {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.counter_picks?.[heroId] || { counters: [], countered_by: [] };
  }

  async getHeroSynergies(heroId: number): Promise<any[]> {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.synergies?.strong_combos.filter(combo =>
      combo.heroes.some(hero => hero.hero_id === parseInt(heroId.toString()))
    ) || [];
  }

  // Item and build methods
  async getItemBuilds(heroId: number | null = null, situation: string | null = null): Promise<any> {
    await this.initialize();
    
    try {
      const data = await this.loadStaticData<ItemBuilds>('items', 'builds.json');
      
      if (heroId) {
        return data.builds.hero_builds[heroId] || null;
      }
      
      if (situation) {
        return data.builds.situation_builds[situation] || null;
      }
      
      return data.builds;
    } catch (error) {
      console.error('Error getting item builds:', error);
      throw error;
    }
  }

  async getItemsByCategory(category: string): Promise<any[]> {
    const data = await this.loadStaticData<ItemBuilds>('items', 'builds.json');
    return data.builds.item_categories[category] || [];
  }

  // Meta analysis methods
  async getMetaAnalysis(): Promise<MetaAnalysis['analysis']> {
    await this.initialize();
    
    try {
      const data = await this.loadStaticData<MetaAnalysis>('meta', 'analysis.json');
      return data.analysis;
    } catch (error) {
      console.error('Error getting meta analysis:', error);
      throw error;
    }
  }

  async getHeroTiers(): Promise<any> {
    const meta = await this.getMetaAnalysis();
    return meta.hero_tiers;
  }

  async getPatchChanges(patch: string | null = null): Promise<any> {
    const meta = await this.getMetaAnalysis();
    return patch ? meta.patch_changes[patch] : meta.patch_changes;
  }

  async getTrends(): Promise<any> {
    const meta = await this.getMetaAnalysis();
    return meta.trends;
  }

  async getMetaInsights(): Promise<any> {
    const meta = await this.getMetaAnalysis();
    return meta.meta_insights;
  }

  // User profile management
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    await this.initialize();
    
    try {
      // First check IndexedDB
      let profile = await dbService.getUserProfile();
      
      if (!profile) {
        // Fallback to localStorage
        profile = localStorageService.getUserProfile();
        
        if (profile) {
          // Migrate to IndexedDB
          await dbService.saveUserProfile(profile);
        }
      }
      
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<{ success: boolean }> {
    await this.initialize();
    
    try {
      // Save to both IndexedDB and localStorage for redundancy
      await dbService.saveUserProfile(profile);
      localStorageService.saveUserProfile(profile);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async createUserProfile(steamId: string, personaName: string, preferences: Record<string, any> = {}): Promise<UserProfile> {
    await this.initialize();
    
    const schema = await this.loadStaticData<UserSchema>('users', 'schema.json');
    
    const profile: UserProfile = {
      steamId,
      personaName,
      preferences: {
        ...schema.schema.default_preferences,
        ...preferences
      },
      favoriteHeroes: [],
      favoriteItems: [],
      customBuilds: [],
      statistics: schema.schema.default_statistics || {}
    };

    await this.saveUserProfile(profile);
    return profile;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean }> {
    const currentProfile = await this.getCurrentUserProfile();
    if (!currentProfile) {
      throw new Error('No user profile found');
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates
    };

    return this.saveUserProfile(updatedProfile);
  }

  // Favorites management
  async getFavoriteHeroes(): Promise<UserFavoriteHero[]> {
    const profile = await this.getCurrentUserProfile();
    return profile?.favoriteHeroes || [];
  }

  async addFavoriteHero(heroId: number, heroName: string, role: string, notes = ''): Promise<{ success: boolean }> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    const favoriteHero: UserFavoriteHero = {
      heroId,
      heroName,
      role,
      notes,
      dateAdded: new Date().toISOString()
    };

    // Remove existing favorite if it exists
    profile.favoriteHeroes = profile.favoriteHeroes.filter(h => h.heroId !== heroId);
    profile.favoriteHeroes.push(favoriteHero);

    return this.saveUserProfile(profile);
  }

  async removeFavoriteHero(heroId: number): Promise<{ success: boolean }> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    profile.favoriteHeroes = profile.favoriteHeroes.filter(h => h.heroId !== heroId);
    return this.saveUserProfile(profile);
  }

  async getFavoriteItems(): Promise<UserFavoriteItem[]> {
    const profile = await this.getCurrentUserProfile();
    return profile?.favoriteItems || [];
  }

  async addFavoriteItem(itemId: number, itemName: string, category: string, notes = ''): Promise<{ success: boolean }> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    const favoriteItem: UserFavoriteItem = {
      itemId,
      itemName,
      category,
      notes,
      dateAdded: new Date().toISOString()
    };

    // Remove existing favorite if it exists
    profile.favoriteItems = profile.favoriteItems.filter(i => i.itemId !== itemId);
    profile.favoriteItems.push(favoriteItem);

    return this.saveUserProfile(profile);
  }

  async removeFavoriteItem(itemId: number): Promise<{ success: boolean }> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    profile.favoriteItems = profile.favoriteItems.filter(i => i.itemId !== itemId);
    return this.saveUserProfile(profile);
  }

  // Custom builds management
  async getCustomBuilds(heroId: number | null = null): Promise<CustomBuild[]> {
    const profile = await this.getCurrentUserProfile();
    const builds = profile?.customBuilds || [];
    
    if (heroId) {
      return builds.filter(build => build.heroId === heroId);
    }
    
    return builds;
  }

  async saveCustomBuild(heroId: number, buildData: Partial<CustomBuild>): Promise<{ success: boolean; buildId: string }> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    const buildId = buildData.id || `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const customBuild: CustomBuild = {
      id: buildId,
      heroId,
      name: buildData.name || 'Untitled Build',
      items: buildData.items || [],
      description: buildData.description || '',
      isPublic: buildData.isPublic || false,
      dateCreated: buildData.dateCreated || now,
      dateModified: now
    };

    // Remove existing build if updating
    profile.customBuilds = profile.customBuilds.filter(b => b.id !== buildId);
    profile.customBuilds.push(customBuild);

    const result = await this.saveUserProfile(profile);
    return { ...result, buildId };
  }

  async deleteCustomBuild(buildId: string): Promise<{ success: boolean }> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    profile.customBuilds = profile.customBuilds.filter(b => b.id !== buildId);
    return this.saveUserProfile(profile);
  }

  // Match data caching
  async getCachedMatches(): Promise<CachedMatch[]> {
    await this.initialize();
    return dbService.getCachedMatches();
  }

  async cacheMatchData(matchData: CachedMatch): Promise<{ success: boolean }> {
    await this.initialize();
    await dbService.cacheMatchData(matchData);
    return { success: true };
  }

  async clearCachedMatches(): Promise<{ success: boolean }> {
    await this.initialize();
    await dbService.clearCachedMatches();
    return { success: true };
  }

  // Data synchronization
  async syncData(): Promise<{ success: boolean }> {
    await this.initialize();
    
    try {
      // Force reload of static data
      this.cache.clear();
      
      // Could implement more sophisticated sync logic here
      return { success: true };
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      await this.initialize();
      
      // Test static data loading
      await this.loadStaticData('heroes', 'recommendations.json');
      
      // Test IndexedDB
      await dbService.healthCheck();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Export/Import functionality
  async exportUserData(): Promise<any> {
    const profile = await this.getCurrentUserProfile();
    const cachedMatches = await this.getCachedMatches();
    
    return {
      userProfile: profile,
      cachedMatches,
      exportTimestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  async importUserData(userData: any): Promise<{ success: boolean }> {
    try {
      if (userData.userProfile) {
        await this.saveUserProfile(userData.userProfile);
      }
      
      if (userData.cachedMatches) {
        await this.clearCachedMatches();
        for (const match of userData.cachedMatches) {
          await this.cacheMatchData(match);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error importing user data:', error);
      throw error;
    }
  }

  // Utility methods
  async clearAllUserData(): Promise<{ success: boolean }> {
    await this.initialize();
    
    try {
      await dbService.clearUserData();
      localStorageService.clearUserData();
      return { success: true };
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  async getStorageInfo(): Promise<any> {
    await this.initialize();
    
    const indexedDBSize = await dbService.getStorageSize();
    const localStorageSize = localStorageService.getStorageSize();
    
    return {
      indexedDB: indexedDBSize,
      localStorage: localStorageSize,
      total: indexedDBSize + localStorageSize
    };
  }
}

// Export singleton instance
export const fileBackend = new FileBackendService();

// Default export
export default fileBackend;