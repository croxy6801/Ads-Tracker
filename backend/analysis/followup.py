"""
Ad Waste Finder – 7-Day post-shift saturation follow-up engine.
Evaluates receiving campaign performance after budget shift:
- delta_cpa = (receiving_cpa_after - receiving_cpa_before) / receiving_cpa_before
- delta_cpa <= saturation_tolerance (default 20%): Result = "held"
- delta_cpa > saturation_tolerance: Result = "saturated"
"""

from typing import List, Dict, Any, Optional
from datetime import date
from analysis.metrics import calculate_aggregate_metrics


def evaluate_shift_followup(
    receiving_metrics_before: List[Any],
    receiving_metrics_after: List[Any],
    saturation_tolerance: float = 0.20,
) -> Dict[str, Any]:
    """
    Compares 7 days before shift against 7 days after shift for the recipient campaign.
    """
    m_before = calculate_aggregate_metrics(receiving_metrics_before)
    m_after = calculate_aggregate_metrics(receiving_metrics_after)

    cpa_before = m_before["cpa"] or 500.0
    cpa_after = m_after["cpa"] or 500.0

    delta = (cpa_after - cpa_before) / max(1.0, cpa_before)

    if delta <= saturation_tolerance:
        result = "held"
        next_step = "Budget shift successfully absorbed without saturation. Recipient campaign remains profitable. Consider another incremental shift if needed."
    else:
        result = "saturated"
        next_step = f"Recipient campaign saturated (CPA jumped by {delta*100:.1f}%, exceeding {saturation_tolerance*100:.0f}% tolerance). Recommend rolling back 50% of the recent shift."

    return {
        "receiving_cpa_before": round(cpa_before, 2),
        "receiving_cpa_after": round(cpa_after, 2),
        "delta_percent": round(delta * 100, 1),
        "result": result,
        "next_step_suggested": next_step,
    }
