export type SportType = 'NFL' | 'NBA' | 'MLB' | 'NHL';

export interface Game {
  id: string;
  sport: SportType;
  season: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeSpread: number; // e.g., -3.5 means home is favored by 3.5 points
  overUnder: number;  // Over/under threshold, e.g., 47.5
  homeMoneyline: number; // American odds format, e.g., -150 or +130
  awayMoneyline: number;
  homeSpreadOdds: number;  // Price on each side of the spread. Books move the
  awaySpreadOdds: number;  // juice when a line sits off the true 50/50 point.
  overOdds: number;        // Same for the total.
  underOdds: number;
  isPlayoff: boolean;
  starHomeInjured: boolean; // Simulates missing marquee players
  starAwayInjured: boolean;
  homeWinStreak: number;    // Number of consecutive prior wins of the home team
  awayWinStreak: number;    // Number of consecutive prior wins of the away team
  homeRestDays: number;     // Days since last game
  awayRestDays: number;     // Days since last game
}

export type BetType = 'moneyline' | 'spread' | 'totals';

export type SideSelectionType =
  | 'favorites'
  | 'underdogs'
  | 'home'
  | 'away'
  | 'home_favorites'
  | 'away_favorites'
  | 'home_underdogs'
  | 'away_underdogs'
  | 'after_win'
  | 'after_loss'
  | 'hot_streak'
  | 'cold_streak'
  | 'rest_advantage'
  | 'rest_disadvantage'
  | 'over'
  | 'under';

export interface Strategy {
  id?: string;
  sport: SportType;
  startYear: number;
  endYear: number;
  betType: BetType;
  sideSelection: SideSelectionType;
  oddsMin?: number;       // e.g., -150 or decimal odds parameters normalized
  oddsMax?: number;
  spreadMin?: number;
  spreadMax?: number;
  totalMin?: number;
  totalMax?: number;
  streakFilter: 'any' | 'after_win' | 'after_loss' | 'hot_streak_3plus' | 'cold_streak_3plus';
  streakTarget: 'bet_team' | 'opponent';
  starPlayerFilter: 'any' | 'healthy_only' | 'star_injured';
  unitSize: number;       // Amount per bet, in $
  startingBankroll: number; // Starting balance, in $
}

export interface SimulatedBetGame {
  id: string;
  date: string;
  matchup: string;
  sport: SportType;
  season: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeSpread: number;
  overUnder: number;
  homeMoneyline: number;
  awayMoneyline: number;
  betPlaced: string;    // Text descriptive, e.g. "Chiefs Moneyline (-140)"
  oddsDecimal: number;  // Decimals make math simple
  stake: number;
  returnVal: number;
  netResult: number;    // stakeholder net, e.g. -100 or +150
  status: 'win' | 'loss' | 'push';
}

export interface BacktestSummary {
  sport: SportType;
  startYear: number;
  endYear: number;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pushedBets: number;
  winRate: number;
  totalWagered: number;
  totalReturn: number;
  netProfit: number;
  roi: number;
  avgOdds: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  kellyPercentage: number; // Kelly criterion suggestion
  finalBankroll: number;
}

export interface ProfitHistoryPoint {
  index: number;
  date: string;
  matchup: string;
  netProfit: number;
  cumulativeProfit: number;
  currentBankroll: number;
}

export interface BacktestResponse {
  summary: BacktestSummary;
  profitHistory: ProfitHistoryPoint[];
  games: SimulatedBetGame[];
}

export interface StrategyTemplate {
  name: string;
  description: string;
  sport: SportType;
  betType: BetType;
  sideSelection: SideSelectionType;
  streakFilter: Strategy['streakFilter'];
  streakTarget: Strategy['streakTarget'];
  starPlayerFilter: Strategy['starPlayerFilter'];
  oddsMin?: number;
  oddsMax?: number;
  spreadMin?: number;
  spreadMax?: number;
  totalMin?: number;
  totalMax?: number;
}

export interface AdvisorResponse {
  analysis: string;
  suggestedTemplates?: StrategyTemplate[];
}

