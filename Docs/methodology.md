<h1 align="center">📐 Mathematical Methodology</h1>

<p align="center">
  <em>Analytical foundations of the DU/CED framework, metric semantics, and risk-of-ruin mechanics.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/domain-applied_statistics-0284c7?style=for-the-badge" alt="Domain: Applied Statistics">
  <a href="README.md"><img src="https://img.shields.io/badge/↩-Docs_Home-6B7280?style=for-the-badge" alt="Docs Home"></a>
</p>

---

## 🎯 1. The DU/CED Framework

The **Decision Units / Capital Exposure per Decision (DU/CED)** framework standardizes disparate financial and wagering activities into a common analytical structure by isolating three core components:

$$\text{Expected Value Drag / Gain} = \text{Frequency (DU)} \times \text{Exposure (CED)} \times \text{Edge}$$

### Parameters

1. **Decision Units ($\text{DU}$):** The number of discrete decisions or wagers executed per unit of time (typically decisions/day).
   - *Example:* A slot player spins 500 times per session ($\text{DU} = 500$); an NFL bettor places 2 bets per game day ($\text{DU} = 2$); a buy-and-hold index investor executes 1 allocation decision per month ($\text{DU} \approx 0.033$).
2. **Capital Exposure per Decision ($\text{CED}$):** The percentage of total starting bankroll or allocated capital risked on each individual decision.
   - *Example:* A sports bettor wagering $20 on a $1,000 bankroll has $\text{CED} = 2.0\%$; a slot bettor wagering $2.50 per spin on a $500 bankroll has $\text{CED} = 0.5\%$; a full index investment has $\text{CED} = 100\%$.
3. **Edge ($E$):** The expected value percentage per unit wagered or invested.
   - Positive for positive-sum investing (e.g. S&P 500 historical compound growth $\approx +10.0\%$).
   - Negative for negative-sum gambling and casino games (e.g. Single-zero roulette $E = -2.70\%$, Sports point spread at $-110$ has $E = -4.55\%$).

---

## ⚖️ 2. Metric Semantics & Dual-Metric Reality

A foundational insight from our codebase audit is that **investing returns** and **wagering turnover costs** represent mathematically distinct quantities that cannot be plotted on a single unconstrained axis:

### Metric A: Return on Capital ($R_{\text{cap}}$)
What happens to the single bankroll actually committed. For buy-and-hold assets this is compound growth on a fixed initial stake; for wagering it is the same flat-stake accrual as Metric B, **stopped at the point the bankroll is gone**:

$$R_{\text{cap}}(t) = \max\left(-100,\; \begin{cases} \left( \left(1 + \frac{r_{\text{ann}}}{100}\right)^t - 1 \right) \times 100 & \text{held asset} \\[4pt] C_{\text{turn}}(t) & \text{wagering activity} \end{cases}\right)$$

- **Lower Bound:** Strictly bounded below by $-100\%$. A complete wipeout of capital (e.g. penny stocks, or a bankroll drained by house edge) reaches $-100\%$ and ceases further decay because zero capital remains.
- **This is the primary comparison axis**, and the only one on which a held asset and a wagering activity are the same kind of quantity.

### Metric B: Cumulative Expected Turnover Cost ($C_{\text{turn}}$)
For repeated wagering, linear multiplication calculates total expected loss as a percentage of initial bankroll assuming continuous restaking:

$$C_{\text{turn}}(t) = \text{DU} \times \text{Days}(t) \times \left(\frac{\text{CED}}{100}\right) \times E$$

- **Unbounded Nature:** Without an explicit bankroll floor, high-frequency negative-edge activities reach theoretical losses of $-1,000\%$ to $-136,875\%$ over multi-year horizons. (The worst case in the 187-record dataset is *Slots Tight 85%* at ten years.)
- **The Physical Interpretation:** These values do not represent a rate of return; they measure **cumulative turnover friction**. A loss beyond $-100\%$ implies that the player replenished their bankroll multiple times after going broke.
- **Defined only where there is turnover.** A held asset has none, so it carries no value for this metric rather than a fabricated one.

### Metric C: Ruin Point ($N_{\text{ruin}}$)
The decision count at which an initial bankroll $B_0$ reaches $0$ under negative drift:

$$N_{\text{ruin}} \approx \frac{B_0}{\text{Bet Size} \times |E|} \;=\; \frac{100}{\left(\frac{\text{CED}}{100}\right) \times |E|}$$

The right-hand form is what the visualizer evaluates, expressing bankroll and stake as percentages so no notional dollar amount has to be assumed. A losing **held** asset never literally reaches zero under geometric decay, so its analogue is the time to lose 90%: $t_{90} = \ln(0.1) / \ln(1 + r_{\text{ann}}/100)$.

**These three are consistent by construction.** $C_{\text{turn}}$ passes $-100\%$ at exactly $N_{\text{ruin}}$ decisions, which is exactly where $R_{\text{cap}}$ reaches its floor — so the floored bar and the ruin marker are the same statement made twice. `npm run check:spectrum` asserts that agreement across all 187 records and 7 horizons.

In the platform's visualizers, $R_{\text{cap}}$ is the primary axis and is capped at $-100\%$, turnover drag $C_{\text{turn}}$ is presented on a **separate axis** behind a measure toggle, and the Ruin Point is rendered directly on the primary chart as a floor line and a per-activity marker. Shipped in Spectrum V20 (roadmap Action 2.1, 2026-08-31); before that all three were conflated on one unconstrained axis.

---

## 📐 3. Position Sizing Models

The backtester provides multiple position sizing frameworks:

### 1. Flat Betting
Every wager risks a fixed unit size $u$ (e.g. $100 or a static 2% of initial bankroll).

$$\text{Stake}_t = u$$

### 2. Kelly Criterion (Full & Fractional)
Calculates the mathematically optimal stake fraction $f^*$ to maximize the expected geometric growth rate of bankroll $B_t$:

$$f^* = \frac{b \cdot p - q}{b}$$

Where:
- $b$ = Decimal odds net payoff ($b = \text{Decimal Odds} - 1$)
- $p$ = Estimated true win probability
- $q = 1 - p$ (true loss probability)

To mitigate volatility and protect against parameter estimation error, the backtester defaults to **Quarter-Kelly ($0.25 \times f^*$)**:

$$\text{Stake}_t = B_t \times \max\left(0, \frac{1}{4} \cdot f^*\right)$$

---

## 🎲 4. Simulator Score Generation & Market Pricing

The backtester simulation engine creates synthetic seasons without structural home/away bias:

1. **Power Ratings:** Teams possess offensive and defensive efficiency ratings.
2. **Unified Expected Margin & Total:** A single expected point margin $\mu_{\Delta}$ and total points expectation $\mu_{\Sigma}$ are computed per game:
   - For football (NFL) and basketball (NBA), scores are drawn from calibrated Gaussian distributions floored at zero.
   - For baseball (MLB) and hockey (NHL), scores follow independent Poisson draws:
     $$P(k \text{ goals}) = \frac{\lambda^k e^{-\lambda}}{k!}$$
3. **Distribution-Derived Market Pricing:** Spread and total prices are set directly from the cumulative mass of the score distribution, enforcing an exact bookmaker hold (overround $\approx 4.76\%$ for standard $-110/-110$ lines).
4. **Tie Resolution:** Level scores are resolved with overtime simulation before pricing so no mass is stranded at a push.

---

<p align="center">
  <a href="README.md">← Documentation Home</a> ·
  <a href="roadmap.md">Roadmap</a> ·
  <a href="data-architecture.md">Data Architecture</a>
</p>
