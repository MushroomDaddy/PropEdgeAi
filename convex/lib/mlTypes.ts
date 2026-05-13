/**
 * PropEdge AI — ML Architecture Types
 *
 * Feature definitions, model input/output schemas,
 * training/prediction/calibration schemas.
 */

// ── Feature Definitions ──

export interface PropFeatures {
  // Player performance
  last5Avg: number;
  last10Avg: number;
  seasonAvg: number;
  last5Variance: number;
  last10Variance: number;
  last5HitRate: number;
  last10HitRate: number;
  seasonHitRate: number;
  minutesTrend: number; // positive = trending up
  usageTrend: number;

  // Matchup
  dvpRank: number;          // 1-30
  oppDefRating: number;     // opponent defensive efficiency
  homeAway: "home" | "away";
  restDays: number;
  backToBack: boolean;
  travelDistance: number;    // miles

  // Market
  line: number;
  projection: number;
  projectionDiff: number;   // pct
  consensusSpread: number;
  marketImpliedProb: number; // 0-100
  openingLine: number;
  lineDelta: number;
  publicSidePct: number;    // 0-100

  // Context
  sport: string;
  position: string;
  statType: string;
  platform: string;
  gameTotal: number;
  spread: number;
  isPlayoffs: boolean;
  injuryStatus: string;     // "healthy" | "questionable" | "probable" | "doubtful"
  teammateOut: boolean;
  oppStarOut: boolean;
}

// ── Model Input/Output ──

export interface ModelInput {
  features: PropFeatures;
  playerId: string;
  playerName: string;
  propId: string;
  gameId?: string;
  timestamp: number;
}

export interface ModelOutput {
  modelProbability: number;       // 0-100 raw
  calibratedProbability: number;  // 0-100 after Platt scaling
  confidenceBucket: string;       // e.g. "70-80"
  expectedStatMean: number;
  expectedStatMedian: number;
  expectedStatP10: number;
  expectedStatP90: number;
  featureImportance: FeatureWeight[];
  explanationFactors: string[];   // human-readable
  modelVersion: string;
}

export interface FeatureWeight {
  feature: string;
  weight: number;  // SHAP value
  direction: "positive" | "negative";
}

// ── Training ──

export interface TrainingRow {
  features: PropFeatures;
  label: number;          // 1 = hit, 0 = miss
  actualStat: number;
  pickLine: number;
  overUnder: string;
  weight?: number;         // sample weight
}

// ── Prediction Record ──

export interface PredictionRecord {
  predictionId: string;
  propId: string;
  playerId: string;
  gameId?: string;
  input: ModelInput;
  output: ModelOutput;
  createdAt: number;
  gradedAt?: number;
  result?: "hit" | "miss" | "push";
  actualStat?: number;
}

// ── Calibration ──

export interface CalibrationBucket {
  bucketLabel: string;      // e.g. "60-65"
  bucketMidpoint: number;   // e.g. 62.5
  totalPredictions: number;
  hits: number;
  actualHitRate: number;    // hits/total * 100
  calibrationError: number; // |actualHitRate - bucketMidpoint|
}

// ── Model Versioning ──

export interface ModelVersion {
  versionId: string;
  modelType: string;       // "heuristic" | "lightgbm" | "xgboost" | "ensemble"
  trainedAt: number;
  trainingRows: number;
  validationAccuracy: number;
  logLoss: number;
  brierScore: number;
  auc: number;
  isActive: boolean;
  isDemo: boolean;
}

// ── Learning Feedback ──

export interface LearningFeedback {
  feedbackId: string;
  period: string;           // "2025-W01" | "2025-05"
  totalPicks: number;
  totalHits: number;
  hitRate: number;
  bySport: Record<string, { total: number; hits: number; hitRate: number }>;
  byStatType: Record<string, { total: number; hits: number; hitRate: number }>;
  byPlatform: Record<string, { total: number; hits: number; hitRate: number }>;
  byConfidenceBucket: Record<string, { total: number; hits: number; hitRate: number }>;
  overVsUnder: {
    over: { total: number; hits: number; hitRate: number };
    under: { total: number; hits: number; hitRate: number };
  };
  calibrationBuckets: CalibrationBucket[];
}
