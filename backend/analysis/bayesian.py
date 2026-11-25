"""
Ad Waste Finder – Bayesian Beta distribution Monte Carlo confidence engine.
Draws N=10,000 samples from Beta(1 + conversions, 1 + clicks - conversions).
Calculates P(Implied CPA > Benchmark CPA).
"""

import numpy as np
from typing import Tuple, Optional


def calculate_bayesian_confidence(
    conversions: float,
    clicks: int,
    spend: float,
    benchmark_cpa: float,
    n_samples: int = 10_000,
) -> Tuple[float, float]:
    """
    Beta distribution conjugate prior for Bernoulli trials (clicks -> conversion).
    Prior: Beta(1, 1) (uniform uninformative prior).
    Posterior: Beta(1 + conv, 1 + clicks - conv).

    We draw N samples of CVR ~ Beta(...).
    Implied CPA = CPC / CVR = (spend / clicks) / CVR.
    P(Implied CPA > benchmark_cpa) = fraction of draws where implied CPA > benchmark_cpa.

    Returns:
        (confidence_worse_than_benchmark, expected_cpa)
    """
    if clicks <= 0 or spend <= 0 or benchmark_cpa <= 0:
        return 0.0, 0.0

    # Ensure valid inputs for Beta distribution parameters
    alpha = 1.0 + max(0.0, conversions)
    beta_param = 1.0 + max(0.0, float(clicks) - conversions)

    # Draw Monte Carlo samples of posterior conversion rate
    rng = np.random.default_rng(42)
    cvr_samples = rng.beta(alpha, beta_param, size=n_samples)

    # Avoid zero division
    cvr_samples = np.maximum(cvr_samples, 1e-6)

    # Calculate implied CPA for each draw: spend / (clicks * cvr)
    cpc = spend / clicks
    implied_cpa_samples = cpc / cvr_samples

    # Confidence that true performance is worse than benchmark (i.e. implied CPA > benchmark)
    confidence = float(np.mean(implied_cpa_samples > benchmark_cpa))
    expected_cpa = float(np.mean(implied_cpa_samples))

    return round(confidence, 4), round(expected_cpa, 2)
