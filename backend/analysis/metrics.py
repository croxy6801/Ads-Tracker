"""
Ad Waste Finder – Core metrics and rolling trend calculations.
Computes spend, clicks, conversions, CPA, CVR, and 7d-vs-7d trend comparison.
"""

from typing import List, Dict, Any, Optional
from datetime import date, timedelta


def _get_val(obj: Any, key: str, default: Any = 0.0) -> Any:
    if hasattr(obj, key):
        return getattr(obj, key)
    if isinstance(obj, dict):
        return obj.get(key, default)
    return default


def calculate_aggregate_metrics(metrics: List[Any]) -> Dict[str, Any]:
    """Calculates sums and derived ratios for a list of daily metrics."""
    total_spend = sum(_get_val(m, "spend", 0.0) for m in metrics)
    total_impressions = sum(_get_val(m, "impressions", 0) for m in metrics)
    total_clicks = sum(_get_val(m, "clicks", 0) for m in metrics)
    total_conversions = sum(_get_val(m, "conversions", 0.0) for m in metrics)
    total_revenue = sum(_get_val(m, "revenue", 0.0) for m in metrics)

    cpa = (total_spend / total_conversions) if total_conversions > 0 else None
    cvr = (total_conversions / total_clicks) if total_clicks > 0 else 0.0
    ctr = (total_clicks / total_impressions) if total_impressions > 0 else 0.0
    cpc = (total_spend / total_clicks) if total_clicks > 0 else 0.0
    roas = (total_revenue / total_spend) if total_spend > 0 else 0.0

    return {
        "spend": round(total_spend, 2),
        "impressions": total_impressions,
        "clicks": total_clicks,
        "conversions": round(total_conversions, 2),
        "revenue": round(total_revenue, 2),
        "cpa": round(cpa, 2) if cpa is not None else None,
        "cvr": round(cvr, 4),
        "ctr": round(ctr, 4),
        "cpc": round(cpc, 2),
        "roas": round(roas, 2),
        "days_count": len(metrics),
    }


def calculate_7d_vs_7d_trend(mature_metrics: List[Any]) -> Dict[str, Any]:
    """
    Compares the last 7 mature days with the previous 7 mature days (days 8-14 backwards).
    Returns metrics for both windows and whether CPA was persistently elevated.
    """
    sorted_metrics = sorted(
        mature_metrics,
        key=lambda m: (
            m.date if hasattr(m, "date") else date.fromisoformat(m["date"]) if isinstance(m.get("date"), str) else m["date"]
        )
    )

    if len(sorted_metrics) < 14:
        return {
            "has_14d": False,
            "window1_cpa": None,
            "window2_cpa": None,
            "is_persistently_elevated": False,
        }

    recent_7d = sorted_metrics[-7:]
    previous_7d = sorted_metrics[-14:-7]

    m1 = calculate_aggregate_metrics(recent_7d)
    m2 = calculate_aggregate_metrics(previous_7d)

    return {
        "has_14d": True,
        "window1_cpa": m1["cpa"],  # most recent 7 mature days
        "window2_cpa": m2["cpa"],  # previous 7 mature days
        "window1_metrics": m1,
        "window2_metrics": m2,
    }
