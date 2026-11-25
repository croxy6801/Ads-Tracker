"""
Ad Waste Finder – Simulator planted campaign archetypes and scenario modifiers.
Archetypes:
1. The Star (High performer, low CPA, budget capped)
2. The Slow Burner (Decaying CVR after week 1, Watch ~Day 10, Underperforming ~Day 15)
3. The Saturator (Strong initially, degrades sharply when budget exceeds capacity)
4. The Lucky Streak (High initial variance, stabilizes)
5. The Awareness (High impressions, low conversions, immune to conversion waste)
6. The Steady Middle (Average control)
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CampaignArchetype:
    id: str
    name: str
    base_budget: float
    base_cpc: float
    base_cvr: float
    base_ctr: float
    capacity_k: float  # Budget capacity threshold before saturation sets in
    goal_type: str = "conversions"
    target_cpa: Optional[float] = 500.0


ARCHETYPES: dict[str, CampaignArchetype] = {
    "camp-star-0001": CampaignArchetype(
        id="camp-star-0001",
        name="The Star",
        base_budget=3000.0,
        base_cpc=15.0,
        base_cvr=0.045,  # Implied CPA ~ 333 (target 500)
        base_ctr=0.035,
        capacity_k=8000.0,
        goal_type="conversions",
        target_cpa=500.0,
    ),
    "camp-slow-0002": CampaignArchetype(
        id="camp-slow-0002",
        name="The Slow Burner",
        base_budget=3000.0,
        base_cpc=20.0,
        base_cvr=0.038,  # Starts good, decays after day 7
        base_ctr=0.020,
        capacity_k=5000.0,
        goal_type="conversions",
        target_cpa=500.0,
    ),
    "camp-satu-0003": CampaignArchetype(
        id="camp-satu-0003",
        name="The Saturator",
        base_budget=4000.0,
        base_cpc=25.0,
        base_cvr=0.042,
        base_ctr=0.028,
        capacity_k=4200.0,  # Near capacity immediately!
        goal_type="conversions",
        target_cpa=600.0,
    ),
    "camp-luck-0004": CampaignArchetype(
        id="camp-luck-0004",
        name="The Lucky Streak",
        base_budget=2500.0,
        base_cpc=18.0,
        base_cvr=0.070,  # Unusually high days 1-5, then mean-reverts to ~0.033
        base_ctr=0.025,
        capacity_k=4000.0,
        goal_type="conversions",
        target_cpa=500.0,
    ),
    "camp-awar-0005": CampaignArchetype(
        id="camp-awar-0005",
        name="The Awareness",
        base_budget=5000.0,
        base_cpc=8.0,
        base_cvr=0.002,  # Very low CVR, purely brand impressions
        base_ctr=0.045,
        capacity_k=15000.0,
        goal_type="awareness",
        target_cpa=None,
    ),
    "camp-midd-0006": CampaignArchetype(
        id="camp-midd-0006",
        name="The Steady Middle",
        base_budget=2000.0,
        base_cpc=18.0,
        base_cvr=0.036,  # Implied CPA ~ 500 (at target)
        base_ctr=0.022,
        capacity_k=5000.0,
        goal_type="conversions",
        target_cpa=500.0,
    ),
}
