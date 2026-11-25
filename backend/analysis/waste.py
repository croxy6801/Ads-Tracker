"""
Ad Waste Finder – Waste estimation module.
Formula from spec:
max(0, mature_spend - mature_conversions * benchmark_cpa)
"""

from typing import Optional


def calculate_estimated_waste(
    mature_spend: float,
    mature_conversions: float,
    benchmark_cpa: Optional[float],
) -> float:
    """
    Computes estimated wasted spend.
    If benchmark_cpa is None or <= 0, waste is 0.0.
    """
    if benchmark_cpa is None or benchmark_cpa <= 0:
        return 0.0

    expected_cost = mature_conversions * benchmark_cpa
    waste = max(0.0, mature_spend - expected_cost)
    return round(waste, 2)
