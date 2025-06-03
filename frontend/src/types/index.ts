// Export all type definitions
export * from './dota';
export * from './api';

// Re-export commonly used types with better names
export type {
  Hero as DotaHero,
  Player as DotaPlayer,
  MatchDetails as DotaMatch,
  PlayerSummary as DotaPlayerSummary,
  RecentMatch as DotaRecentMatch,
} from './dota';

export type {
  ApiError,
  ApiResult,
  AsyncState,
  UseApiResult,
  UsePaginatedApiResult,
  DotaApiService,
  MockAuthService,
  AuthUser,
  AuthResponse,
} from './api';

export { ApiException } from './api';

// Additional types for enhanced services
export interface UserProfile {
  steamId: string;
  personaName: string;
  preferences: Record<string, any>;
  favoriteHeroes: UserFavoriteHero[];
  favoriteItems: UserFavoriteItem[];
  customBuilds: CustomBuild[];
  statistics: Record<string, any>;
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