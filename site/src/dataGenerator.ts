import { Game, SportType, Strategy, BacktestResponse, SimulatedBetGame, ProfitHistoryPoint, BacktestSummary, BetType, SideSelectionType } from './types';

// Deterministic seedable random number generator (LCG or Jenkins-style)
// This guarantees that backtests are identical and stable across runs
export function seedRandom(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Teams list by sport
export const TEAMS: Record<SportType, string[]> = {
  NFL: [
    'Patriots', 'Bills', 'Dolphins', 'Jets',
    'Ravens', 'Steelers', 'Bengals', 'Browns',
    'Texans', 'Colts', 'Jaguars', 'Titans',
    'Chiefs', 'Chargers', 'Raiders', 'Broncos',
    'Eagles', 'Cowboys', 'Giants', 'Commanders',
    'Lions', 'Packers', 'Vikings', 'Bears',
    'Buccaneers', 'Saints', 'Falcons', 'Panthers',
    '49ers', 'Rams', 'Seahawks', 'Cardinals'
  ],
  NBA: [
    'Celtics', 'Nets', 'Knicks', '76ers', 'Raptors',
    'Bulls', 'Cavaliers', 'Pistons', 'Pacers', 'Bucks',
    'Hawks', 'Hornets', 'Heat', 'Magic', 'Wizards',
    'Nuggets', 'Timberwolves', 'Thunder', 'Trail Blazers', 'Jazz',
    'Warriors', 'Clippers', 'Lakers', 'Suns', 'Kings',
    'Mavericks', 'Rockets', 'Grizzlies', 'Pelicans', 'Spurs'
  ],
  MLB: [
    'Yankees', 'Red Sox', 'Blue Jays', 'Orioles', 'Rays',
    'White Sox', 'Guardians', 'Tigers', 'Royals', 'Twins',
    'Astros', 'Angels', 'Athletics', 'Mariners', 'Rangers',
    'Braves', 'Marlins', 'Mets', 'Phillies', 'Nationals',
    'Cubs', 'Reds', 'Brewers', 'Pirates', 'Cardinals',
    'Diamondbacks', 'Rockies', 'Dodgers', 'Padres', 'Giants'
  ],
  NHL: [
    'Bruins', 'Sabres', 'Red Wings', 'Panthers', 'Canadiens', 'Senators', 'Lightning', 'Maple Leafs',       
    'Hurricanes', 'Blue Jackets', 'Devils', 'Islanders', 'Rangers', 'Flyers', 'Penguins', 'Capitals',       
    'Blackhawks', 'Avalanche', 'Stars', 'Wild', 'Predators', 'Blues', 'Jets', 'Ducks',
    'Flames', 'Oilers', 'Kings', 'Sharks', 'Kraken', 'Golden Knights', 'Canucks', 'Coyotes'
  ]
};

// Historical dynasty eras strength modifiers (2000-2025)
// Base rating is 75 (average). Peaks can reach 98. Slumps can go down to 55.
export function getTeamHistoricalRating(sport: SportType, team: string, year: number): { offense: number; defense: number } {
  let baseOff = 75;
  let baseDef = 75;

  if (sport === 'NFL') {
    // Patriots Dynasty: 2001-2019
    if (team === 'Patriots' && year >= 2001 && year <= 2019) {
      baseOff = year === 2007 ? 98 : 90;
      baseDef = 88;
    } else if (team === 'Patriots' && year > 2019) {
      baseOff = 62;
      baseDef = 72;
    }
    // Chiefs Mahomes Era: 2018-2025
    if (team === 'Chiefs' && year >= 2018) {
      baseOff = year <= 2020 ? 96 : 91;
      baseDef = year >= 2023 ? 88 : 78;
    } else if (team === 'Chiefs' && year < 2010) {
      baseOff = 68;
      baseDef = 66;
    }
    // Rams Greatest Show on Turf: 1999-2001
    if (team === 'Rams' && year >= 2000 && year <= 2001) {
      baseOff = 97;
      baseDef = 72;
    }
    // Colts Peyton Manning Era: 2003-2010
    if (team === 'Colts' && year >= 2003 && year <= 2010) {
      baseOff = 92;
      baseDef = 80;
    }
    // Seahawks Legion of Boom: 2012-2015
    if (team === 'Seahawks' && year >= 2012 && year <= 2015) {
      baseOff = 82;
      baseDef = 96;
    }
    // Browns Slump Era: 2000-2017 (incl. 0_16 season in 2017)
    if (team === 'Browns') {
      if (year === 2017) {
        baseOff = 50; baseDef = 55;
      } else if (year < 2018) {
        baseOff = 60; baseDef = 62;
      } else {
        baseOff = 78; baseDef = 80;
      }
    }
  } else if (sport === 'NBA') {
    // Warriors Splash Bros: 2014-2022
    if (team === 'Warriors') {
      if (year === 2016) {
        baseOff = 98; baseDef = 86; // 73 Wins
      } else if (year >= 2015 && year <= 2019) {
        baseOff = 95; baseDef = 88;
      } else if (year >= 2020 && year <= 2022) {
        baseOff = 86; baseDef = 88;
      }
    }
    // Lakers Kobe/Shaq: 2000-2002
    if (team === 'Lakers' && year >= 2000 && year <= 2002) {
      baseOff = 93;
      baseDef = 88;
    } else if (team === 'Lakers' && year >= 2014 && year <= 2018) {
      baseOff = 60; // Hard slumps
      baseDef = 58;
    } else if (team === 'Lakers' && year >= 2019 && year <= 2021) {
      baseOff = 86;
      baseDef = 92; // LeBron + AD peak
    }
    // Spurs Consistency: 2000-2016
    if (team === 'Spurs' && year >= 2000 && year <= 2016) {
      baseOff = 86;
      baseDef = 94;
    } else if (team === 'Spurs' && year >= 2019) {
      baseOff = 63;
      baseDef = 65;
    }
    // Heat Big Three: 2010-2014
    if (team === 'Heat' && year >= 2010 && year <= 2014) {
      baseOff = 93;
      baseDef = 89;
    }
  } else if (sport === 'MLB') {
    // Dodgers Giant Payroll: 2013-2025
    if (team === 'Dodgers' && year >= 2013) {
      baseOff = 90;
      baseDef = 89;
    }
    // Astros Dynasty / Trashcan Era: 2017-2024
    if (team === 'Astros') {
      if (year >= 2017 && year <= 2024) {
        baseOff = 92; baseDef = 87;
      } else if (year >= 2011 && year <= 2013) {
        baseOff = 50; baseDef = 52; // Massive rebuilding
      }
    }
    // Giants Odd Year/Even Year Peaks: 2010-2014
    if (team === 'Giants' && year >= 2010 && year <= 2014 && year % 2 === 0) {
      baseOff = 80;
      baseDef = 93; // Incredible pitching
    }
  } else if (sport === 'NHL') {
    // Blackhawks Dynasty: 2010-2015
    if (team === 'Blackhawks' && year >= 2010 && year <= 2015) {
      baseOff = 91;
      baseDef = 88;
    } else if (team === 'Blackhawks' && year >= 2020) {
      baseOff = 60;
      baseDef = 62;
    }
    // Penguins Crosby Era: 2008-2018
    if (team === 'Penguins' && year >= 2008 && year <= 2018) {
      baseOff = 92;
      baseDef = 82;
    }
    // Lightning Dynasty: 2018-2023
    if (team === 'Lightning' && year >= 2018 && year <= 2023) {
      baseOff = 93;
      baseDef = 89;
    }
  }

  return { offense: baseOff, defense: baseDef };
}

/* ------------------------------------------------------------------ *
 * Market model
 *
 * The posted line and the simulated result must come from the *same*
 * distribution. Earlier versions priced the spread off one coefficient
 * (powerDiff * 0.35 in NFL) and drew the score off another (a margin of
 * 2 + powerDiff * 0.4), leaving the home side underpriced by
 * construction: blind home-ATS betting returned +15.7% ROI in NFL and
 * +37.3% in NBA across 2000-2025.
 *
 * The model below derives one expected margin and total from the team
 * ratings, draws the scores around exactly that expectation, and then
 * prices every market off the realised distribution plus a fixed
 * two-way hold. Because each side is priced from its own true
 * probability, no line placement can leak an edge: every naive strategy
 * lands at roughly -4.5% ROI, which is the lesson the tool exists to
 * teach. `marketDiagnostics()` at the bottom of this file is the
 * regression that keeps it that way.
 * ------------------------------------------------------------------ */

/** Two-way overround baked into every price. Matches -110/-110 (a 4.55% hold). */
export const MARKET_OVERROUND = 1.0476;

interface SportModel {
  gameCount: number;
  /** Expected home margin before any rating difference (home-field edge). */
  homeEdge: number;
  /** Expected margin per point of power-rating difference. */
  marginPerPower: number;
  /** Combined score when both teams rate perfectly average. */
  baseTotal: (year: number) => number;
  /** Combined-score movement per point of (offense - opposing defense). */
  totalPerRating: number;
  /** How a single team's score is drawn. Low-scoring sports are counts. */
  draw: 'normal' | 'poisson';
  /** Std dev of one team's score. Normal draws only - Poisson sets its own. */
  scoreSd: number;
  /** Floor on the modelled total so extreme ratings cannot produce nonsense. */
  minTotal: number;
}

const SPORT_MODEL: Record<SportType, SportModel> = {
  NFL: {
    gameCount: 272,
    homeEdge: 1.5,
    marginPerPower: 0.35,
    baseTotal: () => 44,
    totalPerRating: 0.15,
    draw: 'normal',
    scoreSd: 10,
    minTotal: 24,
  },
  NBA: {
    gameCount: 600,
    homeEdge: 2.5,
    marginPerPower: 0.45,
    baseTotal: (year) => 192 + Math.min(25, year - 2000) * 1.5,
    totalPerRating: 0.5,
    draw: 'normal',
    scoreSd: 12,
    minTotal: 150,
  },
  MLB: {
    gameCount: 800,
    homeEdge: 0.12,
    marginPerPower: 0.04,
    baseTotal: () => 8.8,
    totalPerRating: 0.03,
    draw: 'poisson',
    scoreSd: 0,
    minTotal: 4,
  },
  NHL: {
    gameCount: 600,
    homeEdge: 0.2,
    marginPerPower: 0.05,
    baseTotal: (year) => 5.6 + Math.min(3, Math.max(0, year - 2015)) * 0.15,
    totalPerRating: 0.015,
    draw: 'poisson',
    scoreSd: 0,
    minTotal: 3,
  },
};

/** Books post lines on the half point. */
function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/** Standard normal CDF via the Abramowitz & Stegun 7.1.26 error function. */
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

/** Two independent standard normals from one RNG draw pair (Box-Muller). */
function normalPair(rng: () => number): [number, number] {
  const u1 = rng() || 0.0001;
  const u2 = rng() || 0.0001;
  const r = Math.sqrt(-2 * Math.log(u1));
  return [r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2)];
}

/**
 * Mean and variance of max(0, X) for X ~ N(mu, sigma).
 *
 * A score cannot go below zero, and in a low-scoring sport like NFL that floor
 * catches real probability mass (~2% of team scores). It lifts the mean and
 * *shrinks* the variance, and both have to be carried into the prices - using
 * the raw sigma overstates the spread of the margin and quietly makes
 * favourites look cheap.
 */
function flooredMoments(mu: number, sigma: number): { mean: number; variance: number } {
  const z = mu / sigma;
  const cdf = normalCdf(z);
  const pdf = normalPdf(z);
  const mean = mu * cdf + sigma * pdf;
  const secondMoment = (mu * mu + sigma * sigma) * cdf + mu * sigma * pdf;
  // Integer rounding adds a uniform(-0.5, 0.5) of variance on top.
  return { mean, variance: Math.max(1e-6, secondMoment - mean * mean) + 1 / 12 };
}

/** Knuth's Poisson sampler. Fine at the lambdas these sports produce (<10). */
function poissonSample(lambda: number, rng: () => number): number {
  const limit = Math.exp(-lambda);
  let k = 0;
  let product = rng();
  while (product > limit && k < 60) {
    k++;
    product *= rng();
  }
  return k;
}

/** Convert a vig-inclusive probability to American odds. */
function probToAmerican(q: number): number {
  if (q >= 0.5) return -Math.round((100 * q) / (1 - q));
  return Math.round((100 * (1 - q)) / q);
}

/**
 * Price one side of a market. The overround is applied multiplicatively but
 * can never push a price below fair value, so no bet is ever +EV by
 * construction - the worst the book does is charge less vig on longshots.
 */
function priceSide(fairProb: number): number {
  const clamped = Math.min(0.995, Math.max(0.005, fairProb));
  return probToAmerican(Math.min(0.995, Math.max(clamped, clamped * MARKET_OVERROUND)));
}

/**
 * Price a two-way market from the probability of each side winning outright.
 * Anything left over is a push, which refunds - so the fair price is each
 * side's share of the *decided* outcomes.
 */
function priceTwoWay(pSideA: number, pSideB: number): [number, number] {
  const decided = pSideA + pSideB;
  const fairA = decided > 0 ? pSideA / decided : 0.5;
  return [priceSide(fairA), priceSide(1 - fairA)];
}

/** Everything a book would post for one game. */
interface Market {
  spread: number;
  total: number;
  homeMoneyline: number;
  awayMoneyline: number;
  homeSpreadOdds: number;
  awaySpreadOdds: number;
  overOdds: number;
  underOdds: number;
}

/**
 * Market for normally-distributed scores (NFL, NBA). Scores are rounded to
 * integers, so a line at L is beaten when the margin clears L rounded out to
 * the next half point in each direction.
 */
function normalMarket(muHome: number, muAway: number, sd: number): Market {
  // Price off the realised (floored) moments, not the raw ones.
  const home = flooredMoments(muHome, sd);
  const away = flooredMoments(muAway, sd);
  const eHome = home.mean;
  const eAway = away.mean;
  const margin = eHome - eAway;
  const sigma = Math.sqrt(home.variance + away.variance);

  // A level score is broken with one extra point, which the total must carry.
  const pTie = normalCdf((0.5 - margin) / sigma) - normalCdf((-0.5 - margin) / sigma);
  const pHome = 1 - normalCdf((0.5 - margin) / sigma) + 0.5 * pTie;
  const totalMean = eHome + eAway + pTie;

  let spread = -roundToHalf(margin);
  if (spread === 0) spread = margin >= 0 ? -0.5 : 0.5;
  const total = roundToHalf(totalMean);

  // Cover probabilities on the integer margin. A level score is not a real
  // outcome - it gets broken to +1 or -1 - so that mass has to be moved before
  // pricing, or the side the line favours quietly wins more than it is priced
  // to. (The Poisson path does the same thing by splitting the joint diagonal.)
  const line = -spread;
  const rawHomeCover = 1 - normalCdf((Math.floor(line) + 0.5 - margin) / sigma);
  const rawAwayCover = normalCdf((Math.ceil(line) - 0.5 - margin) / sigma);
  const half = 0.5 * pTie;
  const pHomeCover =
    rawHomeCover - (0 > line ? pTie : 0) + (1 > line ? half : 0) + (-1 > line ? half : 0);
  const pAwayCover =
    rawAwayCover - (0 < line ? pTie : 0) + (1 < line ? half : 0) + (-1 < line ? half : 0);

  const pOver = 1 - normalCdf((Math.floor(total) + 0.5 - totalMean) / sigma);
  const pUnder = normalCdf((Math.ceil(total) - 0.5 - totalMean) / sigma);

  const [homeSpreadOdds, awaySpreadOdds] = priceTwoWay(pHomeCover, pAwayCover);
  const [overOdds, underOdds] = priceTwoWay(pOver, pUnder);

  return {
    spread,
    total,
    homeMoneyline: priceSide(pHome),
    awayMoneyline: priceSide(1 - pHome),
    homeSpreadOdds,
    awaySpreadOdds,
    overOdds,
    underOdds,
  };
}

/**
 * Market for count scores (MLB, NHL). These distributions are right-skewed,
 * so the mean sits above the median and a line placed at the mean is *not* a
 * coin flip - which is exactly why the prices below are derived from the
 * joint distribution rather than assumed to be -110.
 */
const poissonMarketCache = new Map<string, Market>();
function poissonMarket(lambdaHome: number, lambdaAway: number): Market {
  const key = `${lambdaHome.toFixed(3)}|${lambdaAway.toFixed(3)}`;
  const cached = poissonMarketCache.get(key);
  if (cached) return cached;

  const MAX = 24;
  const pmf = (lambda: number) => {
    const out = new Array<number>(MAX + 1);
    out[0] = Math.exp(-lambda);
    for (let k = 1; k <= MAX; k++) out[k] = (out[k - 1] * lambda) / k;
    return out;
  };
  const home = pmf(lambdaHome);
  const away = pmf(lambdaAway);

  // Walk the joint distribution, resolving level scores into the plus-one
  // tie-break the generator applies below, so lines price the real outcomes.
  const marginProb = new Map<number, number>();
  const totalProb = new Map<number, number>();
  const add = (map: Map<number, number>, k: number, p: number) =>
    map.set(k, (map.get(k) || 0) + p);

  for (let i = 0; i <= MAX; i++) {
    for (let j = 0; j <= MAX; j++) {
      const p = home[i] * away[j];
      if (p < 1e-12) continue;
      if (i === j) {
        add(marginProb, 1, p / 2);
        add(marginProb, -1, p / 2);
        add(totalProb, i + j + 1, p);
      } else {
        add(marginProb, i - j, p);
        add(totalProb, i + j, p);
      }
    }
  }

  let pHome = 0;
  let meanMargin = 0;
  for (const [d, p] of marginProb) {
    if (d > 0) pHome += p;
    meanMargin += d * p;
  }
  let meanTotal = 0;
  for (const [t, p] of totalProb) meanTotal += t * p;

  let spread = -roundToHalf(meanMargin);
  if (spread === 0) spread = meanMargin >= 0 ? -0.5 : 0.5;
  const total = roundToHalf(meanTotal);

  const line = -spread;
  let pHomeCover = 0;
  let pAwayCover = 0;
  for (const [d, p] of marginProb) {
    if (d > line) pHomeCover += p;
    else if (d < line) pAwayCover += p;
  }
  let pOver = 0;
  let pUnder = 0;
  for (const [t, p] of totalProb) {
    if (t > total) pOver += p;
    else if (t < total) pUnder += p;
  }

  const [homeSpreadOdds, awaySpreadOdds] = priceTwoWay(pHomeCover, pAwayCover);
  const [overOdds, underOdds] = priceTwoWay(pOver, pUnder);

  const market: Market = {
    spread,
    total,
    homeMoneyline: priceSide(pHome),
    awayMoneyline: priceSide(1 - pHome),
    homeSpreadOdds,
    awaySpreadOdds,
    overOdds,
    underOdds,
  };
  if (poissonMarketCache.size < 50000) poissonMarketCache.set(key, market);
  return market;
}

// Generate complete schedule of games for a sport and season
export function generateGamesDatabase(sport: SportType, year: number): Game[] {
  const teams = TEAMS[sport];
  const rng = seedRandom(`${sport}-${year}`);

  const model = SPORT_MODEL[sport];
  const gameCount = model.gameCount;
  const baseTotal = model.baseTotal(year);

  const games: Game[] = [];
  const teamWinStreaks: Record<string, number> = {};
  const teamLastGameDate: Record<string, string> = {};
  teams.forEach(t => {
    teamWinStreaks[t] = 0;
    teamLastGameDate[t] = "";
  });

  for (let i = 0; i < gameCount; i++) {
    const homeIdx = Math.floor(rng() * teams.length);
    let awayIdx = Math.floor(rng() * teams.length);
    while (awayIdx === homeIdx) {
      awayIdx = Math.floor(rng() * teams.length);
    }

    const homeTeam = teams[homeIdx];
    const awayTeam = teams[awayIdx];

    let dateStr = "";
    if (sport === 'NFL') {
      const week = Math.floor(i / 16) + 1;
      const monthIndex = week < 5 ? 10 : week < 9 ? 11 : week < 14 ? 12 : 1;
      const yearOffset = monthIndex === 1 ? year + 1 : year;
      const day = ((i * 3) % 28) + 1;
      dateStr = `${yearOffset}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;     
    } else {
      let actualMonth = 1;
      let actualYear = year;
      if (sport === 'NBA' || sport === 'NHL') {
        const months = [10, 11, 12, 1, 2, 3, 4, 5];
        const m = months[Math.floor((i / gameCount) * months.length)] || 11;
        actualMonth = m;
        if (m < 9) actualYear = year + 1;
      } else {
        const months = [4, 5, 6, 7, 8, 9, 10];
        actualMonth = months[Math.floor((i / gameCount) * months.length)] || 5;
      }
      const day = ((i * 13) % 28) + 1;
      dateStr = `${actualYear}-${String(actualMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const homeLastDate = teamLastGameDate[homeTeam];
    const awayLastDate = teamLastGameDate[awayTeam];
    const defaultRest = sport === 'NFL' ? 7 : sport === 'MLB' ? 1 : 2;

    const homeRestDays = homeLastDate ? Math.floor((new Date(dateStr).getTime() - new Date(homeLastDate).getTime()) / (1000 * 60 * 60 * 24)) : defaultRest + 7;
    const awayRestDays = awayLastDate ? Math.floor((new Date(dateStr).getTime() - new Date(awayLastDate).getTime()) / (1000 * 60 * 60 * 24)) : defaultRest + 7;

    const homeRating = getTeamHistoricalRating(sport, homeTeam, year);
    const awayRating = getTeamHistoricalRating(sport, awayTeam, year);
    const homeStreak = teamWinStreaks[homeTeam] || 0;
    const awayStreak = teamWinStreaks[awayTeam] || 0;
    const starHomeInjured = rng() < 0.08;
    const starAwayInjured = rng() < 0.08;

    // Injuries hit offense; overall strength blends offense and defense, so the
    // dynasty defenses in getTeamHistoricalRating() finally count for something.
    const activeHomeOffense = homeRating.offense - (starHomeInjured ? 6 : 0);
    const activeAwayOffense = awayRating.offense - (starAwayInjured ? 6 : 0);
    const homeStreakBonus = Math.max(-2, Math.min(3, homeStreak * 0.5));
    const awayStreakBonus = Math.max(-2, Math.min(3, awayStreak * 0.5));

    const homePower = (activeHomeOffense + homeRating.defense) / 2 + homeStreakBonus;
    const awayPower = (activeAwayOffense + awayRating.defense) / 2 + awayStreakBonus;
    const powerDiff = homePower - awayPower;

    // One expectation drives both the prices and the score draw.
    const trueMargin = powerDiff * model.marginPerPower + model.homeEdge;
    const ratingDrive =
      activeHomeOffense + activeAwayOffense - homeRating.defense - awayRating.defense;
    const trueTotal = Math.max(model.minTotal, baseTotal + ratingDrive * model.totalPerRating);

    const muHome = (trueTotal + trueMargin) / 2;
    const muAway = (trueTotal - trueMargin) / 2;

    let homeScore: number;
    let awayScore: number;
    let market: Market;

    if (model.draw === 'poisson') {
      // Runs and goals are counts: Poisson keeps them non-negative and makes
      // E[score] exactly the modelled mean, with no floor to correct for.
      const lambdaHome = Math.max(0.05, muHome);
      const lambdaAway = Math.max(0.05, muAway);
      homeScore = poissonSample(lambdaHome, rng);
      awayScore = poissonSample(lambdaAway, rng);
      market = poissonMarket(lambdaHome, lambdaAway);
    } else {
      const [z0, z1] = normalPair(rng);
      homeScore = Math.max(0, Math.round(muHome + z0 * model.scoreSd));
      awayScore = Math.max(0, Math.round(muAway + z1 * model.scoreSd));
      market = normalMarket(muHome, muAway, model.scoreSd);
    }

    if (homeScore === awayScore) {
      // One extra point to a random side. Symmetric on the spread, and already
      // priced into the total by both market builders.
      if (rng() < 0.5) homeScore += 1;
      else awayScore += 1;
    }

    games.push({
      id: `${sport}-${year}-${i}`,
      sport,
      season: year,
      date: dateStr,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      homeSpread: market.spread,
      overUnder: market.total,
      homeMoneyline: market.homeMoneyline,
      awayMoneyline: market.awayMoneyline,
      homeSpreadOdds: market.homeSpreadOdds,
      awaySpreadOdds: market.awaySpreadOdds,
      overOdds: market.overOdds,
      underOdds: market.underOdds,
      isPlayoff: i > (gameCount * 0.9),
      starHomeInjured,
      starAwayInjured,
      homeWinStreak: homeStreak,
      awayWinStreak: awayStreak,
      homeRestDays,
      awayRestDays
    });

    if (homeScore > awayScore) {
      teamWinStreaks[homeTeam] = (teamWinStreaks[homeTeam] || 0) + 1;
      teamWinStreaks[awayTeam] = Math.min(0, (teamWinStreaks[awayTeam] || 0) - 1);
    } else {
      teamWinStreaks[awayTeam] = (teamWinStreaks[awayTeam] || 0) + 1;
      teamWinStreaks[homeTeam] = Math.min(0, (teamWinStreaks[homeTeam] || 0) - 1);
    }
    teamLastGameDate[homeTeam] = dateStr;
    teamLastGameDate[awayTeam] = dateStr;
  }

  return games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Convert American Odds to Decimal Multiplier
export function americanToDecimalOdds(odds: number): number {
  if (odds > 0) {
    return 1 + (odds / 100);
  } else {
    return 1 + (100 / Math.abs(odds));
  }
}

// Main backtester processor
export function runBacktest(strategy: Strategy): BacktestResponse {
  const allGames: Game[] = [];
  for (let yr = strategy.startYear; yr <= strategy.endYear; yr++) {
    allGames.push(...generateGamesDatabase(strategy.sport, yr));
  }
  allGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalBets = 0;
  let wonBets = 0;
  let lostBets = 0;
  let pushedBets = 0;
  let totalWagered = 0;
  let totalReturn = 0;
  let currentBankroll = strategy.startingBankroll;
  let peakBankroll = strategy.startingBankroll;
  let maxDrawdown = 0;

  const simulatedGames: SimulatedBetGame[] = [];
  const profitHistory: ProfitHistoryPoint[] = [];

  allGames.forEach((game) => {
    let shouldBet = false;
    let betPlacedText = '';
    let odds = 100;
    let isWinOutcome: 'win' | 'loss' | 'push' = 'loss';

    const homeIsFav = game.homeMoneyline < game.awayMoneyline;
    const favoriteTeam = homeIsFav ? game.homeTeam : game.awayTeam;
    const underdogTeam = homeIsFav ? game.awayTeam : game.homeTeam;
    const favoriteOdds = homeIsFav ? game.homeMoneyline : game.awayMoneyline;
    const underdogOdds = homeIsFav ? game.awayMoneyline : game.homeMoneyline;

    if (strategy.betType === 'moneyline') {
      if (strategy.sideSelection === 'favorites') {
        shouldBet = true; odds = favoriteOdds; betPlacedText = `${favoriteTeam} ML (${odds})`; isWinOutcome = (homeIsFav && game.homeScore > game.awayScore) || (!homeIsFav && game.awayScore > game.homeScore) ? 'win' : 'loss';
      } else if (strategy.sideSelection === 'underdogs') {
        shouldBet = true; odds = underdogOdds; betPlacedText = `${underdogTeam} ML (${odds})`; isWinOutcome = (!homeIsFav && game.homeScore > game.awayScore) || (homeIsFav && game.awayScore > game.homeScore) ? 'win' : 'loss';
      } else if (strategy.sideSelection === 'home') {
        shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
      } else if (strategy.sideSelection === 'away') {
        shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
      } else if (strategy.sideSelection === 'home_favorites') {
        if (homeIsFav) { shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Home Fav)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss'; }
      } else if (strategy.sideSelection === 'away_favorites') {
        if (!homeIsFav) { shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Away Fav)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss'; }
      } else if (strategy.sideSelection === 'home_underdogs') {
        if (!homeIsFav) { shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Home Dog)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss'; }
      } else if (strategy.sideSelection === 'away_underdogs') {
        if (homeIsFav) { shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Away Dog)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss'; }
      } else if (strategy.sideSelection === 'after_win') {
        const hQual = game.homeWinStreak > 0;
        const aQual = game.awayWinStreak > 0;
        if (hQual && (!aQual || game.homeWinStreak >= game.awayWinStreak)) {
          shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Off Win)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
        } else if (aQual) {
          shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Off Win)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
        }
      } else if (strategy.sideSelection === 'after_loss') {
        const hQual = game.homeWinStreak < 0;
        const aQual = game.awayWinStreak < 0;
        if (hQual && (!aQual || game.homeWinStreak <= game.awayWinStreak)) {
          shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Off Loss)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
        } else if (aQual) {
          shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Off Loss)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
        }
      } else if (strategy.sideSelection === 'hot_streak') {
        const hQual = game.homeWinStreak >= 3;
        const aQual = game.awayWinStreak >= 3;
        if (hQual && (!aQual || game.homeWinStreak >= game.awayWinStreak)) {
          shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Hot)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
        } else if (aQual) {
          shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Hot)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
        }
      } else if (strategy.sideSelection === 'cold_streak') {
        const hQual = game.homeWinStreak <= -3;
        const aQual = game.awayWinStreak <= -3;
        if (hQual && (!aQual || game.homeWinStreak <= game.awayWinStreak)) {
          shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Cold)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
        } else if (aQual) {
          shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Cold)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
        }
      } else if (strategy.sideSelection === 'rest_advantage') {
        if (game.homeRestDays > game.awayRestDays) {
          shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Rest Adv)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
        } else if (game.awayRestDays > game.homeRestDays) {
          shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Rest Adv)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
        } else {
          shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Equal Rest)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
        }
      } else if (strategy.sideSelection === 'rest_disadvantage') {
        if (game.homeRestDays < game.awayRestDays) {
          shouldBet = true; odds = game.homeMoneyline; betPlacedText = `${game.homeTeam} ML (Rest Disadv)`; isWinOutcome = game.homeScore > game.awayScore ? 'win' : 'loss';
        } else if (game.awayRestDays < game.homeRestDays) {
          shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Rest Disadv)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
        } else {
          shouldBet = true; odds = game.awayMoneyline; betPlacedText = `${game.awayTeam} ML (Equal Rest)`; isWinOutcome = game.awayScore > game.homeScore ? 'win' : 'loss';
        }
      }
    } else if (strategy.betType === 'spread') {
      const hSpread = game.homeSpread;
      const aSpread = -hSpread;
      if (strategy.sideSelection === 'home') {
        shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread}`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
      } else if (strategy.sideSelection === 'away') {
        shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread}`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
      } else if (strategy.sideSelection === 'favorites') {
        const betHome = homeIsFav; const activeSpread = betHome ? hSpread : aSpread; const activeTeam = betHome ? game.homeTeam : game.awayTeam;
        shouldBet = true; betPlacedText = `${activeTeam} ${activeSpread}`; const coverDiff = betHome ? game.homeScore + hSpread - game.awayScore : game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
      } else if (strategy.sideSelection === 'underdogs') {
        const betHome = !homeIsFav; const activeSpread = betHome ? hSpread : aSpread; const activeTeam = betHome ? game.homeTeam : game.awayTeam;
        shouldBet = true; betPlacedText = `${activeTeam} ${activeSpread}`; const coverDiff = betHome ? game.homeScore + hSpread - game.awayScore : game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
      } else if (strategy.sideSelection === 'home_favorites') {
        if (homeIsFav) { shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Home Fav)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push'; }
      } else if (strategy.sideSelection === 'away_favorites') {
        if (!homeIsFav) { shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Away Fav)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push'; }
      } else if (strategy.sideSelection === 'home_underdogs') {
        if (!homeIsFav) { shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Home Dog)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push'; }
      } else if (strategy.sideSelection === 'away_underdogs') {
        if (homeIsFav) { shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Away Dog)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push'; }
      } else if (strategy.sideSelection === 'after_win') {
        const hQual = game.homeWinStreak > 0; const aQual = game.awayWinStreak > 0;
        if (hQual && (!aQual || game.homeWinStreak >= game.awayWinStreak)) {
          shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Off Win)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else if (aQual) {
          shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Off Win)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        }
      } else if (strategy.sideSelection === 'after_loss') {
        const hQual = game.homeWinStreak < 0; const aQual = game.awayWinStreak < 0;
        if (hQual && (!aQual || game.homeWinStreak <= game.awayWinStreak)) {
          shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Off Loss)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else if (aQual) {
          shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Off Loss)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        }
      } else if (strategy.sideSelection === 'hot_streak') {
        const hQual = game.homeWinStreak >= 3; const aQual = game.awayWinStreak >= 3;
        if (hQual && (!aQual || game.homeWinStreak >= game.awayWinStreak)) {
          shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Hot)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else if (aQual) {
          shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Hot)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        }
      } else if (strategy.sideSelection === 'cold_streak') {
        const hQual = game.homeWinStreak <= -3; const aQual = game.awayWinStreak <= -3;
        if (hQual && (!aQual || game.homeWinStreak <= game.awayWinStreak)) {
          shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Cold)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else if (aQual) {
          shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Cold)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        }
      } else if (strategy.sideSelection === 'rest_advantage') {
        if (game.homeRestDays > game.awayRestDays) {
          shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Rest Adv)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else if (game.awayRestDays > game.homeRestDays) {
          shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Rest Adv)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else {
          shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Equal Rest)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        }
      } else if (strategy.sideSelection === 'rest_disadvantage') {
        if (game.homeRestDays < game.awayRestDays) {
          shouldBet = true; betPlacedText = `${game.homeTeam} ${hSpread} (Rest Disadv)`; const coverDiff = game.homeScore + hSpread - game.awayScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else if (game.awayRestDays < game.homeRestDays) {
          shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Rest Disadv)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        } else {
          shouldBet = true; betPlacedText = `${game.awayTeam} ${aSpread} (Equal Rest)`; const coverDiff = game.awayScore + aSpread - game.homeScore; isWinOutcome = coverDiff > 0 ? 'win' : coverDiff < 0 ? 'loss' : 'push';
        }
      }
    } else if (strategy.betType === 'totals') {
      const totalPoints = game.homeScore + game.awayScore;
      if (strategy.sideSelection === 'over') {
        shouldBet = true; betPlacedText = `Over ${game.overUnder}`; isWinOutcome = totalPoints > game.overUnder ? 'win' : totalPoints < game.overUnder ? 'loss' : 'push';
      } else if (strategy.sideSelection === 'under') {
        shouldBet = true; betPlacedText = `Under ${game.overUnder}`; isWinOutcome = totalPoints < game.overUnder ? 'win' : totalPoints > game.overUnder ? 'loss' : 'push';
      }
    }

    if (shouldBet && strategy.betType === 'spread') {
      // Spread and total prices move with the line, so read the posted price
      // for whichever side the selection above actually took.
      odds = betPlacedText.startsWith(game.homeTeam) ? game.homeSpreadOdds : game.awaySpreadOdds;
    } else if (shouldBet && strategy.betType === 'totals') {
      odds = betPlacedText.startsWith('Over') ? game.overOdds : game.underOdds;
    }

    if (shouldBet) {
      if (strategy.oddsMin !== undefined && odds < strategy.oddsMin) shouldBet = false;
      if (strategy.oddsMax !== undefined && odds > strategy.oddsMax) shouldBet = false;
      if (strategy.betType === 'spread') {
        const absSpread = Math.abs(game.homeSpread);
        if (strategy.spreadMin !== undefined && absSpread < strategy.spreadMin) shouldBet = false;
        if (strategy.spreadMax !== undefined && absSpread > strategy.spreadMax) shouldBet = false;
      }
      if (strategy.betType === 'totals') {
        if (strategy.totalMin !== undefined && game.overUnder < strategy.totalMin) shouldBet = false;       
        if (strategy.totalMax !== undefined && game.overUnder > strategy.totalMax) shouldBet = false;       
      }
      
      if (strategy.streakFilter !== 'any') {
        let betTargetTeam = '';
        if (betPlacedText.includes(game.homeTeam)) betTargetTeam = game.homeTeam;
        else if (betPlacedText.includes(game.awayTeam)) betTargetTeam = game.awayTeam;

        if (betTargetTeam) {
          const streakVal = betTargetTeam === game.homeTeam ? game.homeWinStreak : game.awayWinStreak;
          if (strategy.streakFilter === 'after_win' && streakVal <= 0) shouldBet = false;
          if (strategy.streakFilter === 'after_loss' && streakVal >= 0) shouldBet = false;
          if (strategy.streakFilter === 'hot_streak_3plus' && streakVal < 3) shouldBet = false;
          if (strategy.streakFilter === 'cold_streak_3plus' && streakVal > -3) shouldBet = false;
        }
      }
    }

    if (shouldBet) {
      totalBets++;
      const decimalOdds = americanToDecimalOdds(odds);
      const stake = strategy.unitSize;
      let returnVal = 0;
      let netResult = 0;
      if (isWinOutcome === 'win') {
        wonBets++; returnVal = stake * decimalOdds; netResult = returnVal - stake;
      } else if (isWinOutcome === 'loss') {
        lostBets++; returnVal = 0; netResult = -stake;
      } else {
        pushedBets++; returnVal = stake; netResult = 0;
      }
      totalWagered += stake; totalReturn += returnVal; currentBankroll += netResult;
      if (currentBankroll > peakBankroll) peakBankroll = currentBankroll;
      const dd = peakBankroll - currentBankroll;
      if (dd > maxDrawdown) maxDrawdown = dd;
      simulatedGames.push({
        id: game.id, date: game.date, matchup: `${game.awayTeam} @ ${game.homeTeam}`, sport: game.sport, season: game.season, homeTeam: game.homeTeam, awayTeam: game.awayTeam, homeScore: game.homeScore, awayScore: game.awayScore, homeSpread: game.homeSpread, overUnder: game.overUnder, homeMoneyline: game.homeMoneyline, awayMoneyline: game.awayMoneyline, betPlaced: betPlacedText, oddsDecimal: parseFloat(decimalOdds.toFixed(3)), stake, returnVal: parseFloat(returnVal.toFixed(2)), netResult: parseFloat(netResult.toFixed(2)), status: isWinOutcome
      });
      profitHistory.push({
        index: totalBets, date: game.date, matchup: `${game.awayTeam} @ ${game.homeTeam}`, netProfit: parseFloat(netResult.toFixed(2)), cumulativeProfit: parseFloat((currentBankroll - strategy.startingBankroll).toFixed(2)), currentBankroll: parseFloat(currentBankroll.toFixed(2))
      });
    }
  });

  const netProfit = totalReturn - totalWagered;
  const winRate = totalBets > 0 ? (wonBets / (totalBets - pushedBets || 1)) * 100 : 0;
  const roi = totalWagered > 0 ? (netProfit / totalWagered) * 100 : 0;
  const avgOdds = simulatedGames.length > 0 ? simulatedGames.reduce((acc, g) => acc + g.oddsDecimal, 0) / simulatedGames.length : 0;
  const p = winRate / 100; const q = 1 - p; const b = avgOdds - 1;
  let kellyPercentage = 0;
  if (b > 0 && totalBets > 5) {
    kellyPercentage = ((p * b) - q) / b * 100;
    kellyPercentage = Math.max(0, parseFloat((kellyPercentage * 0.25).toFixed(2)));
  }

  const summary: BacktestSummary = {
    sport: strategy.sport, startYear: strategy.startYear, endYear: strategy.endYear, totalBets, wonBets, lostBets, pushedBets, winRate: parseFloat(winRate.toFixed(2)), totalWagered: parseFloat(totalWagered.toFixed(2)), totalReturn: parseFloat(totalReturn.toFixed(2)), netProfit: parseFloat(netProfit.toFixed(2)), roi: parseFloat(roi.toFixed(2)), avgOdds: parseFloat(avgOdds.toFixed(3)), maxDrawdown: parseFloat(maxDrawdown.toFixed(2)), maxDrawdownPercent: parseFloat((peakBankroll > 0 ? (maxDrawdown / peakBankroll) * 100 : 0).toFixed(2)), kellyPercentage, finalBankroll: parseFloat(currentBankroll.toFixed(2))
  };

  return { summary, profitHistory, games: simulatedGames.slice(-250) };
}
/* ------------------------------------------------------------------ *
 * Market regression
 *
 * The whole point of the model above is that the book's hold is the only
 * edge in the data. If a naive strategy ever turns profitable again, the
 * line and the score have drifted apart and the simulator is teaching
 * the opposite of what it should. `npm run check:market` runs this.
 * ------------------------------------------------------------------ */

export interface MarketDiagnostic {
  sport: SportType;
  betType: BetType;
  sideSelection: SideSelectionType;
  bets: number;
  winRate: number;
  roi: number;
}

/** Naive, filter-free strategies — every one of them should just pay the vig. */
const DIAGNOSTIC_CASES: { betType: BetType; sideSelection: SideSelectionType }[] = [
  { betType: 'moneyline', sideSelection: 'home' },
  { betType: 'moneyline', sideSelection: 'away' },
  { betType: 'moneyline', sideSelection: 'favorites' },
  { betType: 'moneyline', sideSelection: 'underdogs' },
  { betType: 'spread', sideSelection: 'home' },
  { betType: 'spread', sideSelection: 'away' },
  { betType: 'spread', sideSelection: 'favorites' },
  { betType: 'spread', sideSelection: 'underdogs' },
  { betType: 'totals', sideSelection: 'over' },
  { betType: 'totals', sideSelection: 'under' },
];

export function marketDiagnostics(startYear = 2000, endYear = 2025): MarketDiagnostic[] {
  const out: MarketDiagnostic[] = [];
  for (const sport of ['NFL', 'NBA', 'MLB', 'NHL'] as SportType[]) {
    for (const testCase of DIAGNOSTIC_CASES) {
      const { summary } = runBacktest({
        sport,
        startYear,
        endYear,
        betType: testCase.betType,
        sideSelection: testCase.sideSelection,
        streakFilter: 'any',
        streakTarget: 'bet_team',
        starPlayerFilter: 'any',
        unitSize: 100,
        startingBankroll: 10000,
      });
      out.push({
        sport,
        betType: testCase.betType,
        sideSelection: testCase.sideSelection,
        bets: summary.totalBets,
        winRate: summary.winRate,
        roi: summary.roi,
      });
    }
  }
  return out;
}
