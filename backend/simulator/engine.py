"""
Ad Waste Finder – Simulator engine.
Simulates daily metrics generation for campaigns using deterministic seeded RNG,
realistic log-normal noise, weekend drops, multi-day conversion lag, and saturation curves.
"""

from __future__ import annotations

import math
import numpy as np
from datetime import date, timedelta
from typing import Optional, Dict, Any, List

from simulator.scenarios import ARCHETYPES, CampaignArchetype
from simulator.clock import simulator_clock


class SimulatorEngine:
    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        # Active scenario overrides
        self.sudden_failures: set[str] = set()
        self.lag_spikes: set[str] = set()
        # Custom daily budget overrides (e.g. after budget shifts)
        self.budget_overrides: dict[str, float] = {}
        # Lag queue for delayed conversion attribution: {campaign_id: {target_day: conversions}}
        self.lag_queue: dict[str, dict[int, float]] = {}

    def set_budget(self, campaign_id: str, budget: float) -> None:
        self.budget_overrides[campaign_id] = budget

    def inject_sudden_failure(self, campaign_id: str) -> None:
        self.sudden_failures.add(campaign_id)

    def inject_lag_spike(self, campaign_id: str) -> None:
        self.lag_spikes.add(campaign_id)

    def reset_seed(self, seed: Optional[int] = None) -> None:
        if seed is not None:
            self.seed = seed
        self.rng = np.random.default_rng(self.seed)
        self.sudden_failures.clear()
        self.lag_spikes.clear()
        self.budget_overrides.clear()
        self.lag_queue.clear()
        simulator_clock.reset()

    def generate_day(self, current_day: int, current_date: date) -> list[dict[str, Any]]:
        """
        Generates daily metric dictionaries for all 6 archetype campaigns.
        Handles:
        - Weekend dip (-25% conversions on Saturday & Sunday)
        - Log-normal noise on impressions/CTR/CPC
        - Diminishing returns / saturation if spend > capacity_k
        - Multi-day conversion lag (30% day T, 45% T+1, 15% T+2, 10% T+3)
        """
        results = []
        is_weekend = current_date.weekday() >= 5  # Sat = 5, Sun = 6

        for camp_id, arch in ARCHETYPES.items():
            daily_budget = self.budget_overrides.get(camp_id, arch.base_budget)

            # Spend calculation with slight variation (0.95 - 1.05 of budget)
            spend_ratio = float(self.rng.normal(1.0, 0.03))
            spend = max(100.0, daily_budget * spend_ratio)
            budget_exhausted = min(1.0, spend / daily_budget)

            # CPC with log-normal noise
            cpc_mult = float(self.rng.lognormal(mean=0.0, sigma=0.08))
            cpc = max(1.0, arch.base_cpc * cpc_mult)

            # Clicks
            clicks = max(1, int(round(spend / cpc)))

            # CTR with slight log-normal noise
            ctr_mult = float(self.rng.lognormal(mean=0.0, sigma=0.08))
            ctr = max(0.005, arch.base_ctr * ctr_mult)
            impressions = max(clicks, int(round(clicks / ctr)))

            # Baseline CVR calculation
            effective_cvr = arch.base_cvr

            # Scenario adjustments
            # 1. The Slow Burner decay
            if camp_id == "camp-slow-0002":
                if current_day > 7:
                    # Progressively decays from ~0.038 down to ~0.015 by day 15
                    decay_factor = max(0.35, 1.0 - 0.07 * (current_day - 7))
                    effective_cvr *= decay_factor

            # 2. The Lucky Streak mean-reversion
            if camp_id == "camp-luck-0004":
                if current_day > 5:
                    # Drops down from 0.070 to steady 0.033
                    effective_cvr = 0.033 + float(self.rng.normal(0.0, 0.003))

            # 3. Sudden failure injection
            if camp_id in self.sudden_failures:
                effective_cvr *= 0.15

            # 4. Saturation effect if spend > capacity_k
            if spend > arch.capacity_k:
                excess_ratio = (spend - arch.capacity_k) / arch.capacity_k
                saturation_penalty = 1.0 / (1.0 + 1.5 * excess_ratio)
                effective_cvr *= saturation_penalty

            # 5. Weekend dip (-25% conversion rate on Sat/Sun)
            if is_weekend:
                effective_cvr *= 0.75

            # Noise on CVR
            cvr_mult = float(self.rng.lognormal(mean=0.0, sigma=0.07))
            effective_cvr = max(0.0001, effective_cvr * cvr_mult)

            # Theoretical total conversions originating from this day's clicks
            raw_conversions = clicks * effective_cvr

            # Multi-day conversion lag distribution:
            # Normal: 30% day T, 45% T+1, 15% T+2, 10% T+3
            # Lag spike scenario: 10% day T, 20% T+1, 30% T+2, 40% T+3
            if camp_id in self.lag_spikes:
                dist = [0.10, 0.20, 0.30, 0.40]
            else:
                dist = [0.30, 0.45, 0.15, 0.10]

            if camp_id not in self.lag_queue:
                self.lag_queue[camp_id] = {}

            # Distribute into lag queue
            for offset, fraction in enumerate(dist):
                target_d = current_day + offset
                self.lag_queue[camp_id][target_d] = (
                    self.lag_queue[camp_id].get(target_d, 0.0) + raw_conversions * fraction
                )

            # Retrieve conversions landing on current_day
            matured_conversions = self.lag_queue[camp_id].pop(current_day, 0.0)

            # Revenue estimate
            avg_order_value = 1800.0  # e.g. INR 1800 per conversion
            revenue = round(matured_conversions * avg_order_value, 2)

            results.append({
                "campaign_id": camp_id,
                "date": current_date,
                "spend": round(spend, 2),
                "impressions": int(impressions),
                "clicks": int(clicks),
                "conversions": round(matured_conversions, 2),
                "revenue": revenue,
                "budget_exhausted": round(budget_exhausted, 3),
            })

        return results


simulator_engine = SimulatorEngine()
