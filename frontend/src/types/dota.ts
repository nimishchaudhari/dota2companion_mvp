// Core Dota 2 Data Types

export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: 'agi' | 'str' | 'int' | 'all';
  attack_type: 'Melee' | 'Ranged';
  roles: string[];
  img: string;
  icon: string;
}

export interface HeroStats extends Hero {
  base_health?: number;
  base_health_regen?: number;
  base_mana?: number;
  base_mana_regen?: number;
  base_armor?: number;
  base_mr?: number;
  base_attack_min?: number;
  base_attack_max?: number;
  base_str?: number;
  base_agi?: number;
  base_int?: number;
  str_gain?: number;
  agi_gain?: number;
  int_gain?: number;
  attack_range?: number;
  projectile_speed?: number;
  attack_rate?: number;
  move_speed?: number;
  cm_enabled?: boolean;
  legs?: number;
}

export interface Player {
  account_id: number;
  steamid?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  profileurl?: string;
  personaname?: string;
  last_login?: string;
  full_history_time?: string;
  cheese?: number;
  fh_unavailable?: boolean;
  loccountrycode?: string;
  name?: string;
  country_code?: string;
  fantasy_role?: number;
  team_id?: number;
  team_name?: string;
  team_tag?: string;
  is_locked?: boolean;
  is_pro?: boolean;
  locked_until?: number;
}

export interface PlayerProfile {
  account_id: number;
  personaname: string;
  name?: string;
  plus?: boolean;
  cheese?: number;
  steamid?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  profileurl?: string;
  last_login?: string;
  loccountrycode?: string;
  status?: string;
}

export interface PlayerSummary {
  profile: PlayerProfile;
  mmr_estimate?: {
    estimate: number;
  };
  winLoss: {
    win: number;
    lose: number;
  };
  recentMatches: RecentMatch[];
}

export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  lobby_type?: number;
  hero_id: number;
  start_time: number;
  version?: number;
  kills: number;
  deaths: number;
  assists: number;
  skill?: number;
  average_rank?: number;
  xp_per_min?: number;
  gold_per_min?: number;
  hero_damage?: number;
  tower_damage?: number;
  hero_healing?: number;
  last_hits?: number;
  lane?: number;
  lane_role?: number;
  is_roaming?: boolean;
  cluster?: number;
  leaver_status?: number;
  party_size?: number;
}

export interface MatchDetails {
  match_id: number;
  barracks_status_dire: number;
  barracks_status_radiant: number;
  cluster: number;
  dire_score: number;
  duration: number;
  engine: number;
  first_blood_time: number;
  game_mode: number;
  human_players: number;
  leagueid: number;
  lobby_type: number;
  match_seq_num: number;
  negative_votes: number;
  objectives?: MatchObjective[];
  patch: number;
  positive_votes: number;
  radiant_gold_adv?: number[];
  radiant_score: number;
  radiant_win: boolean;
  radiant_xp_adv?: number[];
  start_time: number;
  teamfights?: TeamFight[];
  tower_status_dire: number;
  tower_status_radiant: number;
  version: number;
  replay_salt: number;
  series_id: number;
  series_type: number;
  players: MatchPlayer[];
  patch_version?: string;
  region?: number;
  replay_url?: string;
  skill?: number;
}

export interface MatchPlayer {
  account_id?: number;
  player_slot: number;
  team_number: 0 | 1;
  team_slot: 0 | 1 | 2 | 3 | 4;
  hero_id: number;
  item_0?: number;
  item_1?: number;
  item_2?: number;
  item_3?: number;
  item_4?: number;
  item_5?: number;
  backpack_0?: number;
  backpack_1?: number;
  backpack_2?: number;
  item_neutral?: number;
  kills: number;
  deaths: number;
  assists: number;
  leaver_status?: number;
  last_hits?: number;
  denies?: number;
  gold_per_min?: number;
  xp_per_min?: number;
  level?: number;
  net_worth?: number;
  aghanims_scepter?: number;
  aghanims_shard?: number;
  moonshard?: number;
  hero_damage?: number;
  tower_damage?: number;
  hero_healing?: number;
  gold?: number;
  gold_spent?: number;
  scaled_hero_damage?: number;
  scaled_tower_damage?: number;
  scaled_hero_healing?: number;
  personaname?: string;
  name?: string;
  radiant_win?: boolean;
  start_time?: number;
  duration?: number;
  cluster?: number;
  lobby_type?: number;
  game_mode?: number;
  patch?: number;
  region?: number;
  isRadiant?: boolean;
  win?: number;
  lose?: number;
  total_gold?: number;
  total_xp?: number;
  kills_per_min?: number;
  kda?: number;
  abandons?: number;
  neutral_kills?: number;
  tower_kills?: number;
  courier_kills?: number;
  lane_kills?: number;
  hero_kills?: number;
  observer_kills?: number;
  sentry_kills?: number;
  roshan_kills?: number;
  necronomicon_kills?: number;
  ancient_kills?: number;
  buyback_count?: number;
  observer_uses?: number;
  sentry_uses?: number;
  lane_efficiency?: number;
  lane_efficiency_pct?: number;
  lane?: number;
  lane_role?: number;
  is_roaming?: boolean;
  purchase_time?: { [key: string]: number };
  first_purchase_time?: { [key: string]: number };
  item_uses?: { [key: string]: number };
  purchase_log?: Array<{
    time: number;
    key: string;
    charges?: number;
  }>;
  kills_log?: Array<{
    time: number;
    key: string;
  }>;
  buyback_log?: Array<{
    time: number;
    slot: number;
    type: string;
  }>;
  runes_log?: Array<{
    time: number;
    key: number;
  }>;
  connection_log?: Array<{
    time: number;
    event: string;
  }>;
  lane_pos?: { [key: string]: { [key: string]: number } };
  obs_log?: Array<{
    time: number;
    type: string;
    key: string;
    slot?: number;
    x?: number;
    y?: number;
    z?: number;
    entityleft?: boolean;
    ehandle?: number;
    player?: number;
  }>;
  sen_log?: Array<{
    time: number;
    type: string;
    key: string;
    slot?: number;
    x?: number;
    y?: number;
    z?: number;
    entityleft?: boolean;
    ehandle?: number;
    player?: number;
  }>;
  obs_left_log?: Array<{
    time: number;
    type: string;
    key: string;
    slot?: number;
    attackername?: string;
    x?: number;
    y?: number;
    z?: number;
    entityleft?: boolean;
    ehandle?: number;
    player?: number;
  }>;
  sen_left_log?: Array<{
    time: number;
    type: string;
    key: string;
    slot?: number;
    attackername?: string;
    x?: number;
    y?: number;
    z?: number;
    entityleft?: boolean;
    ehandle?: number;
    player?: number;
  }>;
  purchase?: { [key: string]: number };
  gold_reasons?: { [key: string]: number };
  xp_reasons?: { [key: string]: number };
  killed?: { [key: string]: number };
  item_usage?: { [key: string]: number };
  hero_hits?: { [key: string]: number };
  damage?: { [key: string]: number };
  damage_taken?: { [key: string]: number };
  damage_inflictor?: { [key: string]: number };
  runes?: { [key: string]: number };
  killed_by?: { [key: string]: number };
  kill_streaks?: { [key: string]: number };
  multi_kills?: { [key: string]: number };
  life_state?: { [key: string]: number };
  healing?: { [key: string]: number };
  damage_inflictor_received?: { [key: string]: number };
  randomed?: boolean;
  pred_vict?: boolean;
  repicked?: string;
  randomed_hero?: string;
}

export interface MatchObjective {
  time: number;
  type: string;
  team?: number;
  key?: string;
  slot?: number;
  player_slot?: number;
  unit?: string;
  value?: number;
}

export interface TeamFight {
  start: number;
  end: number;
  last_death: number;
  deaths: number;
  players: Array<{
    deaths_pos?: { [key: string]: [number, number] };
    ability_uses?: { [key: string]: number };
    ability_targets?: { [key: string]: { [key: string]: number } };
    item_uses?: { [key: string]: number };
    killed?: { [key: string]: number };
    deaths?: number;
    buybacks?: number;
    damage?: number;
    healing?: number;
    gold_delta?: number;
    xp_delta?: number;
    xp_start?: number;
    xp_end?: number;
  }>;
}

export interface GameMode {
  id: number;
  name: string;
  balanced: boolean;
}

export interface LobbyType {
  id: number;
  name: string;
  balanced: boolean;
}

export interface Item {
  id: number;
  name: string;
  cost?: number;
  secret_shop?: boolean;
  side_shop?: boolean;
  recipe?: boolean;
  localized_name?: string;
}

export interface SearchResult {
  players: Array<{
    steamId: number;
    personaName: string;
    avatar: string;
    similarity?: number;
    account_id?: number;
    avatarfull?: string;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface WinLossResponse {
  win: number;
  lose: number;
}

// Utility Types
export type PlayerSlot = 0 | 1 | 2 | 3 | 4 | 128 | 129 | 130 | 131 | 132;
export type Team = 'radiant' | 'dire';
export type PrimaryAttribute = 'agi' | 'str' | 'int' | 'all';
export type AttackType = 'Melee' | 'Ranged';

// Helper function types
export interface HeroFilters {
  attribute?: PrimaryAttribute;
  attackType?: AttackType;
  role?: string;
  search?: string;
}

export interface MatchFilters {
  gameMode?: number;
  skill?: number;
  dateAfter?: number;
  dateBefore?: number;
  limit?: number;
  offset?: number;
}