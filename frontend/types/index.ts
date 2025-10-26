export interface Player {
  id: string;
  username: string;
  walletAddress: string;
  avatarUrl?: string;
  level?: number;
  badges?: string[];
}

export interface League {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  creatorId: string;
  players: Player[];
  status: 'pending' | 'active' | 'completed';
  maxPlayers: number;
  entryFee?: number;
  prizePool: number;
  rules: LeagueRules;
}

export interface LeagueRules {
  trackingInterval: 'hourly' | 'daily' | 'weekly';
  allowedTokens?: string[];
  minPortfolioValue?: number;
  scoringMethod: 'percentage_growth' | 'absolute_value' | 'risk_adjusted';
}

export interface WalletSnapshot {
  playerId: string;
  timestamp: Date;
  totalValue: number;
  tokens: TokenBalance[];
  percentageChange: number;
  rank: number;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: number;
  valueUSD: number;
  priceChange24h: number;
  icon?: string;
}

export interface Bet {
  id: string;
  leagueId: string;
  bettorId: string;
  targetPlayerId: string;
  amount: number;
  type: 'win' | 'top3' | 'growth_percentage' | 'beat_opponent';
  opponent?: string;
  odds: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  placedAt: Date;
  settledAt?: Date;
}

export interface GameEvent {
  id: string;
  type: 'overtake' | 'milestone' | 'bet_won' | 'bet_lost' | 'rank_change' | 'league_start' | 'league_end';
  leagueId: string;
  playerId?: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'success' | 'warning' | 'critical';
  data?: any;
}

export interface ClaimProof {
  leagueId: string;
  playerId: string;
  rank: number;
  finalValue: number;
  snapshotHash: string;
  signature: string;
  verified: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  player: Player;
  currentValue: number;
  startingValue: number;
  percentageGrowth: number;
  totalBetsWon: number;
  isCurrentUser?: boolean;
  momentum: 'rising' | 'falling' | 'stable';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export type AnimationState = 'idle' | 'loading' | 'success' | 'error' | 'celebrating';
