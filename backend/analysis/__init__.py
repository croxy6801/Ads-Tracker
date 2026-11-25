"""
Ad Waste Finder – Analysis module init.
"""

from analysis.maturity import split_mature_metrics
from analysis.metrics import calculate_aggregate_metrics, calculate_7d_vs_7d_trend
from analysis.bayesian import calculate_bayesian_confidence
from analysis.classifier import classify_campaign
from analysis.waste import calculate_estimated_waste
from analysis.recommender import select_receiving_campaign, generate_budget_shift_recommendation
from analysis.diagnostics import run_funnel_diagnostics
from analysis.followup import evaluate_shift_followup

__all__ = [
    "split_mature_metrics",
    "calculate_aggregate_metrics",
    "calculate_7d_vs_7d_trend",
    "calculate_bayesian_confidence",
    "classify_campaign",
    "calculate_estimated_waste",
    "select_receiving_campaign",
    "generate_budget_shift_recommendation",
    "run_funnel_diagnostics",
    "evaluate_shift_followup",
]
