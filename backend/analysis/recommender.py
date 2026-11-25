"""
Ad Waste Finder – Recommender module.
Selects receiving campaign:
- Status: Strong or Healthy
- Same goal_type
- Budget exhausted fraction >= 30% (has room/hunger for more budget)
Calculates:
- 25% shift sizing from underperforming daily budget
- Expected gain range with 20% diminishing returns penalty
"""

from typing import List, Dict, Any, Optional


def select_receiving_campaign(
    source_campaign: Any,
    all_campaigns: List[Any],
    campaign_snapshots: Dict[str, Any],
    recent_metrics_by_camp: Dict[str, List[Any]],
) -> Optional[Any]:
    """
    Finds best recipient campaign for budget reallocation.
    Criteria:
    - Not the source campaign
    - Same goal_type
    - Status is 'strong' (preferred) or 'healthy'
    - Average budget_exhausted over recent 7 mature days >= 0.30
    """
    candidates = []

    for c in all_campaigns:
        if c.id == source_campaign.id:
            continue
        # If source is awareness but underperforming, allow shifting into strong conversion engines
        if source_campaign.goal_type != "awareness" and c.goal_type != source_campaign.goal_type:
            continue

        snap = campaign_snapshots.get(c.id)
        if not snap or snap.get("status") not in ("strong", "healthy"):
            continue

        # Check recent budget exhaustion
        recent = recent_metrics_by_camp.get(c.id, [])
        if recent:
            avg_exhausted = sum(
                (m.budget_exhausted if hasattr(m, "budget_exhausted") else m.get("budget_exhausted", 0.0))
                for m in recent[-7:]
            ) / min(7, len(recent))
        else:
            avg_exhausted = 1.0

        if avg_exhausted >= 0.30:
            # Score candidates: 'strong' prioritized over 'healthy', lower CPA favored
            cpa = snap.get("cpa") or 9999.0
            priority = 0 if snap.get("status") == "strong" else 1
            candidates.append((priority, cpa, c))

    if not candidates:
        return None

    candidates.sort(key=lambda x: (x[0], x[1]))
    return candidates[0][2]


def generate_budget_shift_recommendation(
    source_campaign: Any,
    source_snapshot: Dict[str, Any],
    target_campaign: Optional[Any],
    target_snapshot: Optional[Dict[str, Any]],
    shift_percent: float = 25.0,
    diminishing_returns_penalty: float = 0.20,
) -> Dict[str, Any]:
    """
    Constructs a 25% budget shift recommendation.
    Calculates expected gain range applying 20% diminishing returns penalty on recipient.
    """
    daily_budget = getattr(source_campaign, "daily_budget", 3000.0) or 3000.0
    shift_amount = round(daily_budget * (shift_percent / 100.0), 2)

    source_cpa = source_snapshot.get("cpa") or 800.0
    source_conf = source_snapshot.get("confidence") or 0.85

    if target_campaign and target_snapshot:
        target_cpa = target_snapshot.get("cpa") or 350.0
        # Expected new CPA on recipient with diminishing returns penalty
        adjusted_target_cpa = target_cpa * (1.0 + diminishing_returns_penalty)

        # Lost conversions on source: shift_amount / source_cpa
        lost_conv = shift_amount / max(1.0, source_cpa)
        # Gained conversions on target: shift_amount / adjusted_target_cpa
        gained_conv = shift_amount / max(1.0, adjusted_target_cpa)

        net_daily_gain = max(0.0, gained_conv - lost_conv)
        gain_low = round(net_daily_gain * 0.8 * 7, 2)   # weekly gain low bound
        gain_high = round(net_daily_gain * 1.2 * 7, 2)  # weekly gain high bound

        reasons = [
            f"Move ₹{shift_amount:,.0f}/day ({shift_percent:.0f}% of budget) from '{source_campaign.name}' to '{target_campaign.name}'.",
            f"Source campaign mature CPA is ₹{source_cpa:,.2f} vs recipient CPA of ₹{target_cpa:,.2f}.",
            f"Estimated net gain: {gain_low} to {gain_high} extra conversions per week after factoring in 20% diminishing returns.",
            f"Requires 7-day post-shift follow-up to ensure recipient CPA does not rise > 20%."
        ]

        return {
            "type": "budget_shift",
            "from_campaign_id": source_campaign.id,
            "to_campaign_id": target_campaign.id,
            "shift_percent": shift_percent,
            "amount_per_day": shift_amount,
            "expected_gain_low": gain_low,
            "expected_gain_high": gain_high,
            "confidence": source_conf,
            "reasons": reasons,
        }
    else:
        # No suitable receiving campaign: recommend pausing or reducing to offline reserve
        reasons = [
            f"Reduce daily budget on '{source_campaign.name}' by ₹{shift_amount:,.0f}/day ({shift_percent:.0f}%).",
            f"No suitable high-performing conversion campaign is currently unsaturated.",
            f"Recommend holding this capital in reserve or reallocating to organic/offline acquisition channels."
        ]
        return {
            "type": "pause",
            "from_campaign_id": source_campaign.id,
            "to_campaign_id": None,
            "shift_percent": shift_percent,
            "amount_per_day": shift_amount,
            "expected_gain_low": 0.0,
            "expected_gain_high": round(shift_amount * 7, 2),  # spend saved
            "confidence": source_conf,
            "reasons": reasons,
        }
