# Product Design & Implementation Plan: Ad Waste Finder

> **Project Name:** Ad Waste Finder (Live Ad Campaign Waste Tracker)  
> **Status:** Specification & Implementation Architecture (Updated with On-Demand Campaign Improvements)  
> **Target Audience:** Marketing Managers, Founders, and SMB Growth Teams  
> **Primary Philosophy:** Evidence before advice; Read-only by design; Human-in-the-loop decisions.

---

## 1. Executive Summary & Product Vision

### 1.1 The Problem
Companies spend heavily on paid customer acquisition across Google Ads, Meta, and other platforms. A substantial portion of this capital flows into underperforming campaigns that never break even. Marketers and business owners face persistent operational traps:
1. **Noticing Too Late:** Wasted spend accumulates silently over weeks or months.
2. **Judging Too Early:** Pausing or slashing budgets based on 2–3 volatile or unlucky days.
3. **Deciding on Gut Feeling:** Making emotional budget reallocations without statistical significance.
4. **Binary Actions Without Rehabilitation:** Traditional tools only tell owners to pause campaigns without diagnosing *why* they are failing or how to fix them so they can become profitable.

### 1.2 The Solution
**Ad Waste Finder** is a read-only web application that:
- Continuously monitors ad campaigns day by day,
- Waits until statistical and temporal thresholds are satisfied before judging,
- Estimates wasted capital on weak campaigns,
- Recommends conservative, human-approved budget reallocations (25% increments) to proven campaigns or offline operations, and
- **Suggests Actionable Campaign Improvements on Command:** At the user's request, the engine analyzes the campaign's conversion funnel (impressions $\to$ clicks $\to$ landing page $\to$ conversions) and provides structured, actionable remediation steps (Creative, Audience, Landing Page, Bidding) to rehabilitate underperforming campaigns.

### 1.3 Core Principles (Non-Negotiables)
- **Evidence Before Advice:** The system continuously computes metrics, but strictly withholds flagging and recommendations until minimum observation windows and statistical confidence thresholds are met.
- **Read-Only by Design:** The application has zero write-back access to ad accounts. Every decision requires explicit human authorization (`Approve`, `Dismiss`, or `Snooze`).
- **Constructive Diagnostics (Rehabilitate Before Pausing):** When a campaign underperforms, owners have the option to demand diagnostic guidance to fix the campaign before moving its budget.
- **Transparency in Reasoning:** Every recommendation and diagnostic suggestion is backed by plain-language sentences showing exact metrics, numbers, and historical comparisons.
- **Honest Uncertainty:** When data is insufficient, the system explicitly displays `"Collecting data - not enough evidence"` rather than premature scores.
- **Small Moves & Feedback Loops:** Budgets move in 25% increments followed by a mandatory 7-day re-check to detect saturation.

---

## 2. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                  WEB FRONTEND                                     |
|  Next.js (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Recharts       |
|  - Live Dashboard (SSE)          - Campaign Details (Maturity Shading & Gauges)   |
|  - Recommendation Cards (Slider) - Campaign Improvement & Diagnostic Drawer       |
|  - Simulator Control Bar         - Settings & Audit Log Viewer                    |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTP / SSE
                                          v
+-----------------------------------------------------------------------------------+
|                                  BACKEND API                                      |
|  FastAPI (Python 3.11+) + Pydantic v2 + NumPy + SciPy + Pandas                    |
|  - REST Endpoints (/campaigns, /recommendations, /simulator, /sources, /settings) |
|  - Diagnostic & Improvement Engine (/campaigns/{id}/diagnose)                     |
|  - Server-Sent Events (SSE) Engine (/stream)                                      |
|  - Ingestion & Validation Pipeline                                                |
|  - Background Scheduler (APScheduler)                                             |
+-----------------------------------------------------------------------------------+
        |                                       |
        v                                       v
+-----------------------------+     +-----------------------------------------------+
|       ANALYSIS ENGINE       |     |               SOURCE ADAPTERS                 |
| - Maturity Filter (3-day)   |     | - SimulatorAdapter (Virtual Clock & Scenarios)|
| - Bayesian Beta Confidence  |     | - CsvAdapter (Google Ads / Meta Parser)       |
| - Status Classification     |     | - ReadOnlyAdPlatformAdapter (Future Stretch)  |
| - Waste Estimator           |     +-----------------------------------------------+
| - Improvement Diagnostics   |
| - Saturation & Follow-up    |
+-----------------------------+
        |
        v
+-----------------------------------------------------------------------------------+
|                                 DATABASE LAYER                                    |
|  PostgreSQL (Supabase) / SQLite (Prototype Development)                           |
|  - organizations, users, data_sources, campaigns, daily_metrics                   |
|  - analysis_snapshots, recommendations, campaign_diagnostics, audit_log, settings |
+-----------------------------------------------------------------------------------+
```

### 2.1 Technology Stack Decisions
- **Frontend:** Next.js (React 19 / TypeScript), Tailwind CSS for clean UI, Recharts for daily spend/CPA/conversion charts, Lucide-React for iconography.
- **Backend:** FastAPI (Python) for asynchronous endpoints, Pydantic for strict schema validation, SciPy/NumPy for statistical modeling (Beta distribution Monte Carlo sampling), and rule-based diagnostic heuristic engines.
- **Database:** PostgreSQL (via Supabase or local Postgres) with SQLAlchemy ORM; SQLite fallback supported for zero-setup local demonstration.
- **Real-Time Synchronization:** Server-Sent Events (SSE) delivering daily simulation ticks and status updates to the active web dashboard without polling.
- **Job Scheduling:** APScheduler embedded in FastAPI to drive simulation intervals and periodic analysis runs.

---

## 3. Data Model & Database Schema

The database model is normalized and stores all raw observations, analytical snapshots, diagnostic recommendations, and governance logs.

### 3.1 Tables Specification
1. **`organizations`**: Multi-tenant isolation (`id`, `name`, `currency`, `created_at`).
2. **`users`**: Team members (`id`, `organization_id`, `name`, `email`, `role`).
3. **`data_sources`**: Ingestion configurations (`id`, `organization_id`, `type`, `status`, `last_synced_at`, `config`).
4. **`campaigns`**: Individual marketing campaigns (`id`, `data_source_id`, `name`, `channel`, `goal_type`, `target_cpa`, `target_roas`, `daily_budget`, `start_date`, `status`, `created_at`).
5. **`daily_metrics`**: Daily operational data per campaign (`id`, `campaign_id`, `date`, `spend`, `impressions`, `clicks`, `conversions`, `revenue`, `budget_exhausted`, `is_mature`).
6. **`analysis_snapshots`**: Daily output of statistical analysis (`id`, `campaign_id`, `as_of_date`, `cpa`, `roas`, `cvr`, `confidence_worse_than_benchmark`, `status`, `estimated_waste`, `reasons`).
7. **`recommendations`**: Recommended budget reallocations (`id`, `organization_id`, `type`, `from_campaign_id`, `to_campaign_id`, `shift_percent`, `amount_per_day`, `expected_gain_low`, `expected_gain_high`, `confidence`, `reasons`, `status`, `created_at`, `decided_at`, `decided_by`).
8. **`campaign_diagnostics`**: **(NEW)** Diagnostic improvement suggestions generated on command (`id`, `campaign_id`, `requested_at`, `requested_by`, `health_score`, `primary_bottleneck`, `suggestions_json` [list of {category, issue, suggestion, estimated_impact, difficulty}]).
9. **`shift_followups`**: 7-day post-shift outcome evaluations (`id`, `recommendation_id`, `check_date`, `receiving_cpa_before`, `receiving_cpa_after`, `result`, `next_step_suggested`).
10. **`alerts`**: Real-time notifications feed (`id`, `campaign_id`, `level`, `message`, `created_at`, `read`).
11. **`settings`**: Editable operational rules (`organization_id`, `min_days`, `min_spend`, `spend_multiple_of_target_cpa`, `min_clicks`, `maturity_days`, `flag_cpa_ratio`, `confidence_threshold`, `shift_percent`, `recheck_days`, `saturation_tolerance`).
12. **`audit_log`**: Tamper-evident ledger of human actions (`id`, `user_id`, `action`, `object_type`, `object_id`, `details`, `created_at`).

---

## 4. Analysis Engine & Diagnostic Framework

The Analysis Engine runs continuously for classification and offers on-demand root-cause diagnostics:

```
[Day Data Ingested]
        |
        v
[Step 1: Maturity Filter] ---> (Exclude last 3 days from judgment)
        |
        v
[Step 2: Metrics Calculation] -> (Spend, Clicks, Conversions, CPA, CVR, 7d vs 7d Trend)
        |
        v
[Step 3: Benchmark Determination] -> (Campaign Target CPA or Median CPA of Healthy Peers)
        |
        v
[Step 4: Bayesian Confidence] -> (Beta Distribution Monte Carlo: P(Implied CPA > Benchmark))
        |
        v
[Step 5: Status Classification] -> (Collecting Data | Watch | Underperforming | Strong | Saturated | Awareness)
        |
        v
[Step 6: Waste Estimation] -> (Spend - Conversions * Benchmark CPA)
        |
        v
[Step 7: Candidate Selection] -> (Find Strong + Unsaturated + Budget-Exhausted Campaign)
        |
        v
[Step 8: Recommendation Generation] -> (25% Budget Shift + Range Estimate + Assistance Warning)
        |
        +-----> [ON USER COMMAND: Step 10: Campaign Diagnostic & Improvement Engine]
        |
        v
[Step 9: 7-Day Follow-Up & Saturation] -> (Post-shift check: Held if delta <= 20%, Saturated if delta > 20%)
```

### 4.1 Steps 1–6: Mathematical Rigor
- **Maturity Filter:** Most recent 3 days are excluded from CPA and status evaluation to account for delayed reporting.
- **Dynamic Benchmark:** Campaign's explicit `target_cpa` or median CPA of healthy campaigns with identical `goal_type`.
- **Bayesian Beta Confidence:** Draws $N=10,000$ samples from $\text{Beta}(1+\text{conv}, 1+\text{clicks}-\text{conv})$. Flagging requires $\ge 80\%$ confidence of being worse than benchmark.
- **Classification Criteria for Underperforming:** $\ge 14$ mature days, spend $\ge \max(₹10,000, 10 \times \text{target CPA})$, $\ge 100$ clicks, mature $CPA > 1.5 \times \text{benchmark}$, confidence $\ge 80\%$, persistent across two consecutive 7-day windows.
- **Severe Awareness Waste Evaluation:** While awareness campaigns normally receive immunity from conversion CPA flags, any awareness campaign accumulating massive mature spend ($\ge ₹10,000$) with extreme conversion deficit ($\le 2$ conversions or mature CPA $> 8\times$ benchmark, e.g. ₹45,000 spend with 2 conversions) is strictly re-classified as `Underperforming`. Direct waste is calculated ($\text{Spend} - (\text{Conversions} \times \text{Benchmark CPA})$), and 25% budget reallocations to top conversion engines are generated.
- **Waste Estimation:** $\max(0, \text{Mature Spend} - (\text{Mature Conversions} \times CPA_{\text{bench}}))$.

### 4.1.1 Live Developer API Integration Architecture
In addition to the deterministic Day-by-Day Simulator, Ad Waste Finder provides direct live telemetry ingest via Developer API keys:
1. **Multi-Network Connectors:** Google Ads REST API v17, Meta Graph API v19.0, Amazon Ads, and LinkedIn Ads.
2. **Credential Security:** Client-side masking with AES/TLS transmission, read-only permission scoping, zero write-back mutations.
3. **Live Rolling Analysis:** Polls daily spend, clicks, impressions, and conversions; filters mature windows; detects real-time spend drift and budget bleed; and surfaces conservative 25% reallocation recommendations with human confirmation.

### 4.2 Step 10: On-Demand Campaign Diagnostic & Improvement Framework
When a campaign is flagged as `Underperforming` or `Watch`, or whenever the user clicks **"Suggest Improvements"**, the engine performs a **Funnel Root-Cause Triangulation** comparing the campaign's sub-metrics against historical benchmarks:

#### Funnel Diagnostic Matrix
| Diagnostic Signal | Root Cause Identification | Prescribed Actionable Suggestions |
| :--- | :--- | :--- |
| **Low CTR, Normal CVR**<br>*(e.g., CTR $< 1.0\%$, CVR $\approx$ peer median)* | **Creative & Hook Fatigue**<br>The audience is scrolling past the ad, but those who click find the product acceptable. | 1. **Creative Refresh:** Replace existing ad creatives with 3 high-contrast image/video hooks.<br>2. **Headline A/B Test:** Test benefit-driven vs social-proof headline copy.<br>3. **Audience Rotation:** Refresh targeting exclusions to avoid audience ad burnout. |
| **High CTR, Low CVR**<br>*(e.g., CTR $> 2.5\%$, CVR $< 50\%$ peer median)* | **Landing Page / Offer Mismatch**<br>The ad sets expectations that the landing page fails to deliver, or checkout friction is high. | 1. **Message Match:** Ensure landing page headline exactly mirrors the ad promise.<br>2. **Speed & Mobile UX:** Audit mobile page load speed (target $<2.5$s) and test simplified 1-page checkout.<br>3. **Offer Clarity:** Clarify pricing and add risk-reversal guarantees above the fold. |
| **High CPC, High CPA**<br>*(e.g., CPC $> 1.8\times$ peer median, normal CVR)* | **Auction & Bidding Inefficiency**<br>Bidding too aggressively in a saturated audience pool or bidding manually without constraints. | 1. **Bidding Strategy:** Switch from aggressive manual bidding to Target CPA bidding with a realistic cap.<br>2. **Audience Expansion:** Expand lookalike threshold from 1% to 2–3% or add broad targeting with negative keywords.<br>3. **Dayparting:** Review conversion hours; pause bidding during non-converting late-night hours. |
| **High Spend, Zero Conversions**<br>*(Spend $> ₹5,000$, 0 conversions)* | **Pixel / Tracking Breakdown or Critical Friction**<br>Likely broken checkout flow, failed payment gateway, or disconnected conversion tag. | 1. **Pixel Diagnostics:** Verify conversion event firing using Tag Assistant / Meta Pixel Helper.<br>2. **Checkout Audit:** Test placing a live order to verify payment gateway functionality.<br>3. **Emergency Budget Guard:** Set daily spend cap until tracking verification passes. |
| **High Frequency, Rising CPA**<br>*(Frequency $> 4.0$ in 7 days)* | **Audience Exhaustion / Saturation**<br>The same users are seeing the ad repeatedly without converting. | 1. **Frequency Cap:** Enforce a frequency cap of 2 impressions per user per week.<br>2. **Audience Broadening:** Add new interest clusters or expand geographic radius. |

---

## 5. Live Simulator Engine

The simulator provides a fully deterministic, repeatable environment for demonstrations and tests.
- **Simulated Clock:** Virtual date advances automatically (Default: 1s = 1 day; Fast: 1s = 0.5 day). Controls: Play, Pause, Speed, Jump to Day $N$, and Reset to Seed.
- **Realism Dynamics:** Log-normal noise on clicks/spend, weekend dips (-25%), 1–3 day conversion lag, and budget saturation curves.
- **6 Planted Scenarios:**
  1. *The Star:* High performer, low CPA, budget capped (ideal recipient).
  2. *The Slow Burner:* Decaying CVR after week 1. Turns to `Watch` ~Day 10, flags `Underperforming` ~Day 15. *(Primary target for "Suggest Improvements").*
  3. *The Saturator:* Strong initially, but performance degrades sharply if budget exceeds capacity.
  4. *The Lucky Streak:* High initial variance; proves why 14-day rule prevents early judgment.
  5. *The Awareness:* High impressions, low conversions; proves goal-type immunity.
  6. *The Steady Middle:* Average control campaign.
- **Interactive Scenarios:** Scenario buttons for `Sudden Failure`, `Inject Lag Spike`, and `Reset to Seed`.

---

## 6. CSV Ingestion Engine

- **Supported Platforms:** Standard Google Ads and Meta export formats.
- **Automatic Column Mapping:** Resolves Date, Campaign Name, Spend, Impressions, Clicks, Conversions, and Revenue.
- **Validation Pipeline:** File size limit $\le 10$ MB, checks for negative values, date discontinuities, currency mismatches, and $<14$ day warnings.
- **Sample Files:** Bundled sample CSV download for immediate testing.

---

## 7. Frontend User Experience & Screen Design

### 7.1 Screen Inventory
1. **Screen 1: Setup & Connect:** Data source selector, currency config, target CPA settings, and read-only declaration.
2. **Screen 2: Live Operations Dashboard:**
   - Executive KPI Cards (Today's Spend, Total Period Spend, Conversions, Blended CPA, Estimated Waste So Far).
   - Sticky Simulator Control Bar with real-time controls.
   - Interactive Trend Chart (Daily Spend & CPA with 3-day maturity shading).
   - Campaign Table with status badges, spend, conversions, CPA vs target, and mini trendlines.
   - Real-time Alert Feed.
3. **Screen 3: Campaign Detail & Diagnostic Center:**
   - Detailed metric charts (Clicks, Impressions, Spend, CPA, CVR).
   - **Evidence Progress Bar:** *"Day 9 of 14 | Spend ₹6,800 of ₹10,000 | Clicks 74 of 100"* explaining why the app is waiting.
   - **`Suggest Improvements` Button:** Triggers on-demand diagnostic evaluation.
   - **Campaign Improvement Drawer / Playbook:**
     - Overall Health Score (0–100).
     - Primary Bottleneck Identification (e.g., *"Creative Hook Fatigue"* or *"Landing Page Drop-off"*).
     - Categorized Actionable Fixes (Creative, Audience, Landing Page, Bidding) with estimated impact (High/Medium/Low) and difficulty level.
4. **Screen 4: Recommendation Center:**
   - Recommendation Cards: *"Move ₹750 a day from [Slow Burner] to [The Star]"*.
   - Explanatory breakdown with numbers, expected gain range, and cross-channel assistance warning.
   - What-If Slider (10% to 50%) adjusting projected gains dynamically.
   - Action buttons: `Approve Shift`, `Dismiss` (with mandatory reason), `Snooze (7 Days)`, and **`View Improvement Ideas First`**.
5. **Screen 5: Impact & Saturation Tracker:** Audit of approved shifts, receiving campaign before/after CPA, Saturation verdict (`Held` vs `Saturated`), and cumulative waste avoided counter.
6. **Screen 6: Rules & Thresholds Settings:** Customization of all threshold variables with bounds and reset options.
7. **Screen 7: Data Source Management:** CSV uploader, mapping inspector, and sync history.
8. **Screen 8: Audit Ledger:** Immutable log of approvals, dismissals, setting modifications, and diagnostic requests.

---

## 8. REST & Real-Time API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/summary` | Retrieves aggregate metrics, total waste, and high-level campaign counts. |
| `GET` | `/api/v1/campaigns` | Lists all campaigns with current status, spend, and performance stats. |
| `GET` | `/api/v1/campaigns/{id}/metrics` | Returns chronological daily metrics with `is_mature` flags. |
| `POST` | `/api/v1/campaigns/{id}/diagnose` | **(NEW)** Runs funnel diagnostic matrix and generates tailored improvement suggestions. |
| `GET` | `/api/v1/recommendations` | Lists open, snoozed, and historical budget recommendations. |
| `POST` | `/api/v1/recommendations/{id}/decision` | Submits human decision (`approve`, `dismiss`, `snooze`) with audit log entry. |
| `POST` | `/api/v1/simulator/control` | Dispatches simulator command (`play`, `pause`, `speed`, `jump`, `reset`). |
| `POST` | `/api/v1/simulator/scenario` | Injects scenario modification (`sudden_failure`, `lag_spike`). |
| `POST` | `/api/v1/sources/csv` | Multipart CSV upload, column mapping validation, and parsing. |
| `GET` | `/api/v1/settings` | Retrieves current analytical rules and threshold parameters. |
| `PUT` | `/api/v1/settings` | Updates analytical rules and logs changes to audit ledger. |
| `GET` | `/api/v1/audit` | Retrieves paginated historical audit records. |
| `GET` | `/api/v1/stream` | Server-Sent Events (SSE) broadcasting real-time clock ticks, alerts, and state refreshes. |

---

## 9. Step-by-Step Implementation Roadmap

```
[M0: Setup & Scaffolding] -> [M1: Data Models & Settings] -> [M2: Simulator Engine]
                                                                     |
[M5: Recommendations & Diagnostics] <-- [M4: Dashboard & Charts] <-- [M3: Analysis Engine]
         |
         v
[M6: Follow-up & Saturation] -> [M7: CSV Ingestion] -> [M8: Audit & Polish] -> [M9: Evaluation & Demo]
```

- **Milestone 0: Setup (Week 1):** Repository layout, Next.js frontend, FastAPI backend, health-check endpoint.
- **Milestone 1: Data Model & Settings (Week 2):** Database tables, Pydantic schemas, default settings initialization.
- **Milestone 2: Simulator (Weeks 3–4):** Seeded data generator, clock controls, realism parameters, and 6 planted scenarios.
- **Milestone 3: Analysis Engine (Weeks 5–6):** Maturity filter, Bayesian Beta confidence, status rules, waste formulas.
- **Milestone 4: Dashboard (Week 7):** KPI cards, Recharts time-series with maturity shading, live SSE streaming.
- **Milestone 5: Recommendations & Campaign Diagnostics (Week 8):**
  - Receiving campaign selection and 25% shift sizing.
  - Interactive What-If slider and shift approval workflow.
  - **On-demand Campaign Improvement Diagnostic Engine (`/campaigns/{id}/diagnose`) and UI Drawer showing prioritized fixes.**
- **Milestone 6: Follow-Up & Saturation (Week 9):** 7-day post-shift tracker, Held/Saturated verdicts, waste avoided totalizer.
- **Milestone 7: CSV Upload (Week 10):** File upload, automatic header mapping, validation report, sample CSVs.
- **Milestone 8: Polish & Audit Log (Week 11):** Settings screen, audit log viewer, responsive layout, dark mode, empty states.
- **Milestone 9: Testing & Report (Week 12):** Automated 20-seed Monte Carlo evaluation, demo rehearsals.

---

## 10. Verification & Quality Assurance Strategy

### 10.1 Automated Rule Verification (Unit Tests)
- `test_immature_data_excluded`: Verify conversions within last 3 days never alter status.
- `test_insufficient_duration_blocked`: Verify campaign with $<14$ days is never flagged as underperforming.
- `test_minimum_spend_gate`: Verify campaign with high CPA but low spend remains in `Collecting Data`.
- `test_awareness_immunity`: Verify awareness campaigns are never flagged for conversion waste.
- `test_diagnostic_suggestions_accuracy`:
  - When CTR is depressed and CVR is healthy $\implies$ verify diagnosis outputs *Creative Refresh* and *Headline A/B Test*.
  - When CTR is high and CVR is depressed $\implies$ verify diagnosis outputs *Landing Page & Message Match*.
  - When spend $> ₹5,000$ with 0 conversions $\implies$ verify diagnosis outputs *Pixel / Tracking Audit*.

---

## 11. 6-Minute Live Demonstration Walkthrough

1. **Problem (30s):** Silent ad waste, early gut decisions, and lack of constructive remediation tools.
2. **Start Simulator (1m):** Campaigns advance in real time; highlight *"Collecting data - refusing to judge early"*.
3. **The Lucky Streak (1m):** Show how early volatility is guarded by the 14-day rule.
4. **The Slow Burner & Diagnostics (1m 30s):**
   - Campaign transitions to `Watch`, then `Underperforming` at Day 15.
   - Open Campaign Detail and click **`Suggest Improvements`**.
   - Show the diagnostic playbook (identifying decaying creative hook and recommending specific A/B tests).
5. **Recommendation & Shift (1m):**
   - Review 25% shift card to *The Star*.
   - Adjust What-If slider and click `Approve`.
6. **Fast-Forward & Saturation (45s):** Show 7-day follow-up with *Held* status and waste avoided counter.
7. **CSV Upload & Wrap-up (15s):** Showcase real export handling. Conclude: *"The app recommends and diagnoses. A human decides."*

---

## 13. Legal, Privacy & Compliance Architecture

To guarantee the product remains completely shielded from regulatory penalties, ad network policy disputes, and user litigation, the application enforces the following legal and operational guardrails:

### 13.1 Privacy Policy Architecture (`PRIVACY_POLICY.md`)
1. **Architectural Shield: Zero Consumer End-User PII:** Ad Waste Finder exclusively processes aggregated campaign performance metadata (spend, impressions, clicks, conversions). The application contains zero mechanisms or pipelines to capture, inspect, or sell consumer personal data (no visitor names, IP addresses, cookie IDs, or browsing histories).
2. **Third-Party API Disclosures:** Full compliance with the Google API Services User Data Policy (including Limited Use requirements) and Meta Platform Terms.
3. **Zero Commercialization / No-Sale Policy:** Explicit commitment that marketing spend volumes, campaign names, and performance metrics are never monetized, sold, or shared with third parties or competitors.
4. **Immediate Disconnection & Right to Erasure:** Disconnecting an ad account purges API tokens immediately; users retain full GDPR, CCPA/CPRA, and India DPDP Act 2023 rights to permanent data erasure within 30 days.

### 13.2 Terms of Service Architecture (`TERMS_AND_CONDITIONS.md`)
1. **Strict Non-Fiduciary & "No Marketing Guarantees" Disclaimer:** All Bayesian projections and budget shift recommendations are for analytical planning only. The Company explicitly disclaims any guarantee of ROAS, conversion lifts, profitability, or loss prevention.
2. **Read-Only Operational Guarantee:** The software never executes autonomous write, pause, or budget alterations on live ad accounts. All adjustments require manual human authorization.
3. **100% User Billing Responsibility:** Advertisers are solely liable for all charges, invoices, and taxes billed by third-party ad networks (Google LLC, Meta Platforms, Inc.).
4. **Third-Party Non-Affiliation:** Explicit declaration of independence from Google, Meta, LinkedIn, and Amazon.
5. **Comprehensive Limitation of Liability:** Exclusion of consequential and indirect damages, with aggregate liability capped at the greater of total 12-month fees paid or $100.00 USD (₹8,000 INR).
6. **Comprehensive User Indemnification:** Advertiser defends and indemnifies the Company against any claims arising from ad creatives, landing pages, or platform policy breaches.
7. **Mandatory Individual Arbitration & Class Action Waiver:** Formal disputes are resolved via binding individual arbitration with a waiver of all class or collective proceedings.
