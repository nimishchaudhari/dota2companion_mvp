// API-specific types and interfaces

import type { 
  Hero, 
  PlayerSummary, 
  MatchDetails, 
  SearchResult,
  RecentMatch,
  WinLossResponse 
} from './dota';

// Cache-related types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface ApiCache {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, data: T): void;
  clear(): void;
  delete(key: string): void;
}

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class ApiException extends Error {
  public readonly status: number | undefined;
  public readonly code: string | undefined;
  public readonly details: unknown | undefined;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Request/Response types
export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Service interface definitions
export interface DotaApiService {
  getHeroes(): Promise<Hero[]>;
  getPlayerSummary(accountId: number): Promise<PlayerSummary>;
  searchPlayers(query: string): Promise<SearchResult>;
  getMatchDetails(matchId: number): Promise<MatchDetails>;
}

export interface MatchQueryOptions {
  limit?: number;
  offset?: number;
  win?: 0 | 1;
  patch?: number;
  game_mode?: number;
  lobby_type?: number;
  region?: number;
  date?: number;
  lane_role?: number;
  hero_id?: number;
  is_radiant?: 0 | 1;
  included_account_id?: number[];
  excluded_account_id?: number[];
  with_hero_id?: number[];
  against_hero_id?: number[];
  significant?: 0 | 1;
  having?: number[];
  sort?: string;
}

export interface WinLossQueryOptions {
  limit?: number;
  offset?: number;
  win?: 0 | 1;
  patch?: number;
  game_mode?: number;
  lobby_type?: number;
  region?: number;
  date?: number;
  lane_role?: number;
  hero_id?: number;
  is_radiant?: 0 | 1;
  included_account_id?: number[];
  excluded_account_id?: number[];
  with_hero_id?: number[];
  against_hero_id?: number[];
  significant?: 0 | 1;
}

// Authentication types
export interface AuthUser {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  accountId?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface MockAuthService {
  user: AuthUser | null;
  login(username: string): Promise<AuthResponse>;
  logout(): Promise<{ success: boolean }>;
  checkAuth(): Promise<AuthResponse>;
}

// Data transformation types
export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput;
  transformMany(inputs: TInput[]): TOutput[];
}

export interface HeroTransformer extends DataTransformer<any, Hero> {
  addImageUrls(hero: Partial<Hero>): Hero;
}

export interface PlayerTransformer extends DataTransformer<any, PlayerSummary> {
  normalizeProfile(profile: any): PlayerSummary['profile'];
}

// API endpoint configuration
export interface ApiEndpoints {
  readonly baseUrl: string;
  readonly heroes: string;
  readonly players: string;
  readonly matches: string;
  readonly search: string;
  readonly heroStats: string;
}

export interface ApiConfiguration {
  endpoints: ApiEndpoints;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
  cacheDuration: number;
  rateLimit?: {
    requests: number;
    period: number;
  };
}

// HTTP client types
export interface HttpClient {
  get<T>(url: string, config?: ApiRequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<T>;
  delete<T>(url: string, config?: ApiRequestConfig): Promise<T>;
}

// Response wrapper types
export type ApiResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

// Hook return types
export interface UseApiResult<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
}

export interface UsePaginatedApiResult<T> extends UseApiResult<T[]> {
  hasMore: boolean;
  loadMore: () => Promise<void>;
  page: number;
  total: number;
}

// Storage types
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface SerializationConfig {
  serialize<T>(data: T): string;
  deserialize<T>(data: string): T;
}

// Validation types
export interface Validator<T> {
  validate(data: unknown): data is T;
  validatePartial(data: unknown): Partial<T> | null;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Request builder types
export interface RequestBuilder {
  baseUrl(url: string): RequestBuilder;
  path(path: string): RequestBuilder;
  query(params: Record<string, any>): RequestBuilder;
  header(key: string, value: string): RequestBuilder;
  timeout(ms: number): RequestBuilder;
  cache(duration?: number): RequestBuilder;
  build(): string;
  execute<T>(): Promise<T>;
}