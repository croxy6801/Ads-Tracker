"""
Ad Waste Finder – Maturity filter.
Excludes the most recent N days (default: 3 days) from judgment / analytical evaluation.
"""

from datetime import date, timedelta
from typing import List, Tuple, Any


def split_mature_metrics(
    daily_metrics: List[Any],
    current_date: date,
    maturity_days: int = 3,
) -> Tuple[List[Any], List[Any]]:
    """
    Splits metrics into (mature_metrics, immature_metrics).
    Immature: date > (current_date - timedelta(days=maturity_days))
    Mature: date <= (current_date - timedelta(days=maturity_days))
    """
    cutoff_date = current_date - timedelta(days=maturity_days)
    mature = []
    immature = []

    for m in daily_metrics:
        # Support both ORM objects and dicts
        m_date = m.date if hasattr(m, "date") else m["date"]
        if isinstance(m_date, str):
            m_date = date.fromisoformat(m_date)

        if m_date <= cutoff_date:
            mature.append(m)
        else:
            immature.append(m)

    return mature, immature
