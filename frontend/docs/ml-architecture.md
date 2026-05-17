# PropEdge AI — ML Architecture

## Overview

PropEdge AI's model architecture is designed for progressive enhancement:
1. **Heuristic v1 (current)** — Rule-based edge detection using projection consensus, historical hit rates, and matchup data
2. **LightGBM/XGBoost (next)** — Gradient-boosted trees trained on graded picks with feature importance
3. **Ensemble (future)** — Multi-model ensemble with calibration layer

## Feature Pipeline

All features are defined in `convex/lib/mlTypes.ts` → `PropFeatures`.

### Player Performance Features
- `last5Avg`, `last10Avg`, `seasonAvg` — recent and season averages
- `last5Variance`, `last10Variance` — consistency measures
- `last5HitRate`, `last10HitRate`, `seasonHitRate` — hit rates vs current line
- `minutesTrend`, `usageTrend` — directional indicators

### Matchup Features
- `dvpRank` — defense vs position rank (1-30)
- `oppDefRating` — opponent defensive efficiency
- `homeAway`, `restDays`, `backToBack`, `travelDistance`

### Market Features
- `line`, `projection`, `projectionDiff`, `consensusSpread`
- `marketImpliedProb`, `openingLine`, `lineDelta`, `publicSidePct`

### Context Features
- `sport`, `position`, `statType`, `platform`
- `gameTotal`, `spread`, `isPlayoffs`
- `injuryStatus`, `teammateOut`, `oppStarOut`

## Model Input/Output

**Input:** `ModelInput` — features + player/prop metadata + timestamp

**Output:** `ModelOutput` — includes:
- `modelProbability` (raw)
- `calibratedProbability` (after Platt scaling)
- `confidenceBucket` (e.g. "70-80")
- `expectedStat` distribution (mean, median, P10, P90)
- `featureImportance[]` — SHAP-value-based explanations
- `explanationFactors[]` — human-readable reasons

## Edge Engine

Central edge calculations in `convex/lib/edgeEngine.ts`:

- **True edge** = `modelProbability - marketImpliedProbability`
- **NOT** projection difference (which is just `(projection - line) / line`)
- **EV** = `(modelProb × profit) - ((1-modelProb) × stake)` — must include odds/payout

## Kalshi Engine

Binary contract pricing in `convex/lib/kalshiEngine.ts`:

- YES/NO implied probabilities from contract prices
- Kalshi-specific EV: `(modelProb × (100 - yesPrice)) - ((1-modelProb) × yesPrice)`
- Liquidity score from volume + bid-ask spread
- Close price analysis for P&L tracking

## Model Learning Loop

1. Make predictions with feature snapshots (`PredictionRecord`)
2. Grade when results arrive (`fullGrade()`)
3. Aggregate into `LearningFeedback` records
4. Surface insights in Model Lab:
   - Strongest/weakest sport, stat type, platform
   - Over vs Under performance
   - Confidence bucket calibration
   - Best/worst players
   - Edge bucket ROI

## Grading Engine

Central grading in `convex/lib/gradingEngine.ts`:

- `gradePick()` — standard over/under grading
- `gradeKalshi()` — binary settlement grading
- `qualityFlags` — injury_affected, blowout, overtime, shortened, dnp, etc.
- `fullGrade()` — complete grading with margin, CLV, ROI, quality flags

## Calibration

`CalibrationBucket` tracks predicted vs actual hit rates:
- Buckets: 50-55, 55-60, 60-65, ..., 90+
- `calibrationError` = |actual - predicted midpoint|
- Target: calibration error < 5% per bucket

## Model Versioning

`ModelVersion` tracks:
- Version string, model type, training date
- Validation metrics: accuracy, log loss, Brier score, AUC
- Active/demo flags
- Each prediction records its model version for retroactive analysis

## What's Live vs Demo

| Component | Status |
|-----------|--------|
| Edge Engine calculations | ✅ Live |
| Kalshi Engine pricing | ✅ Live |
| Grading Engine | ✅ Live |
| ML Types & Schemas | ✅ Ready |
| Feature extraction | 🟡 Heuristic (demo data) |
| Model training | 🔴 Needs real data + API keys |
| Calibration | 🔴 Needs sufficient graded picks |
| Provider integrations | 🔴 Needs API keys |

## Next Steps (Requires Paid API Keys)

1. **Connect SportsData.io** → real player stats, game results, projections
2. **Connect The Odds API** → real-time odds from 50+ bookmakers
3. **Accumulate 500+ graded picks** → enough data for initial LightGBM training
4. **Train v1.0** → gradient boosted trees on PropFeatures → ModelOutput
5. **Calibrate** → Platt scaling on validation set
6. **A/B test** → compare heuristic vs ML model hit rates
