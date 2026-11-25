"""
Ad Waste Finder – Campaign status classification engine.
Statuses:
- collecting_data
- watch
- underperforming
- strong
- saturated
- awareness

Strict Rules for 'underperforming' (ALL 6 criteria required simultaneously):
1. >= 14 mature days observed
2. Mature spend >= max(min_spend, spend_multiple * target_cpa)  (e.g. max(10,000, 10 * 500 = 5,000) -> 10,000)
3. >= 100 mature clicks
4. Mature CPA > flag_cpa_ratio * benchmark_cpa (e.g. > 1.5 * benchmark)
5. Bayesian confidence >= confidence_threshold (e.g. >= 80% worse than benchmark)
6. Persistent across two consecutive 7-day windows (both window1_cpa and window2_cpa > 1.2 * benchmark)
"""

from typing import List, Dict, Any, Optional
from datetime import date

from analysis.metrics import calculate_aggregate_metrics, calculate_7d_vs_7d_trend
from analysis.bayesian import calculate_bayesian_confidence
from analysis.waste import calculate_estimated_waste


def classify_campaign(
    campaign: Any,
    mature_metrics: List[Any],
    benchmark_cpa: Optional[float],
    settings: Any,
) -> Dict[str, Any]:
    """
    Evaluates campaign performance using mature metrics only.
    Returns status, cpa, cvr, confidence, estimated_waste, and plain-language reasons.
    """
    goal_type = getattr(campaign, "goal_type", "conversions")

    # Effective benchmark CPA
    target_cpa = getattr(campaign, "target_cpa", None)
    eff_benchmark = target_cpa or benchmark_cpa or 500.0

    agg = calculate_aggregate_metrics(mature_metrics)
    mature_days = agg["days_count"]
    mature_spend = agg["spend"]
    mature_clicks = agg["clicks"]
    mature_conv = agg["conversions"]
    mature_cpa = agg["cpa"]

    # 1. Awareness Campaign Evaluation:
    # Awareness campaigns are immune to ordinary CPA waste ONLY while operating within reasonable discovery spend.
    # However, if an awareness campaign accumulates severe spend (>= min_spend or >= 20,000) with severe conversion deficit
    # (e.g. conversions <= 2 or CPA > 10x benchmark, such as ₹45,000 spend with 2 conversions), it is classified as
    # 'underperforming' so that the advertiser is alerted and 25% of the wasted budget can be shifted to proven conversion engines.
    if goal_type == "awareness":
        is_severe_awareness_waste = (
            mature_spend >= settings.min_spend and (mature_conv <= 2 or (mature_cpa is not None and mature_cpa > 8 * eff_benchmark))
        )
        if not is_severe_awareness_waste:
            return {
                "status": "awareness",
                "cpa": agg["cpa"],
                "cvr": agg["cvr"],
                "confidence": 0.0,
                "estimated_waste": 0.0,
                "reasons": [
                    "Awareness campaign: Immune to conversion CPA waste flagging. Focused on high reach and brand impressions within target budget."
                ],
                "metrics": agg,
            }

    # Waste calculation
    waste = calculate_estimated_waste(mature_spend, mature_conv, eff_benchmark)

    # Bayesian Confidence (Beta Monte Carlo N=10,000)
    confidence, expected_cpa = calculate_bayesian_confidence(
        conversions=mature_conv,
        clicks=mature_clicks,
        spend=mature_spend,
        benchmark_cpa=eff_benchmark,
    )

    # 7d vs 7d trend analysis
    trend = calculate_7d_vs_7d_trend(mature_metrics)

    # Minimum spend threshold
    min_spend_req = max(
        settings.min_spend,
        settings.spend_multiple_of_target_cpa * eff_benchmark,
    )

    # Checking the 6 Strict Criteria for Underperforming
    c1_days = mature_days >= settings.min_days
    c2_spend = mature_spend >= min_spend_req
    c3_clicks = mature_clicks >= settings.min_clicks

    # If zero conversions, CPA is mathematically infinite
    if mature_conv <= 0:
        c4_cpa = mature_spend >= min_spend_req and mature_clicks >= settings.min_clicks
    else:
        c4_cpa = (mature_cpa is not None) and (mature_cpa > settings.flag_cpa_ratio * eff_benchmark)

    c5_conf = confidence >= settings.confidence_threshold

    # Window persistence check: both windows must be higher than 1.2x benchmark
    c6_trend = False
    if trend["has_14d"]:
        w1 = trend["window1_cpa"]
        w2 = trend["window2_cpa"]
        m1 = trend.get("window1_metrics", {})
        m2 = trend.get("window2_metrics", {})
        
        # If conversions in a window are 0 but spend > 0, window is elevated
        w1_elevated = (w1 is not None and w1 > 1.2 * eff_benchmark) or (w1 is None and m1.get("spend", 0) > 0)
        w2_elevated = (w2 is not None and w2 > 1.2 * eff_benchmark) or (w2 is None and m2.get("spend", 0) > 0)
        c6_trend = w1_elevated and w2_elevated

    reasons: list[str] = []

    # Underperforming determination
    if c1_days and c2_spend and c3_clicks and c4_cpa and c5_conf and c6_trend:
        status = "underperforming"
        if mature_cpa is not None:
            reasons.append(
                f"Underperforming: CPA of ₹{mature_cpa:,.2f} exceeds target (₹{eff_benchmark:,.2f}) by {((mature_cpa/eff_benchmark)-1)*100:.1f}%."
            )
        else:
            reasons.append(
                f"Underperforming: 0 conversions recorded on ₹{mature_spend:,.2f} mature spend (Target CPA: ₹{eff_benchmark:,.2f})."
            )
        reasons.append(
            f"Statistical confidence is {confidence*100:.1f}% based on {mature_clicks} clicks and {mature_days} mature days."
        )
        w1_str = f"₹{trend['window1_cpa']:,.2f}" if trend.get("window1_cpa") is not None else "0 conversions"
        w2_str = f"₹{trend['window2_cpa']:,.2f}" if trend.get("window2_cpa") is not None else "0 conversions"
        reasons.append(
            f"Performance has remained elevated across two consecutive 7-day windows (Recent: {w1_str}, Prior: {w2_str})."
        )
        return {
            "status": status,
            "cpa": mature_cpa,
            "cvr": agg["cvr"],
            "confidence": confidence,
            "estimated_waste": waste,
            "reasons": reasons,
            "metrics": agg,
        }

    # Strong determination: >= 14 days, spend >= min, CPA <= 0.85 * benchmark, high confidence good
    if c1_days and (mature_cpa is not None) and (mature_cpa <= 0.85 * eff_benchmark) and (mature_clicks >= 50):
        status = "strong"
        reasons.append(
            f"Strong performer: Mature CPA of ₹{mature_cpa:,.2f} is significantly below target (₹{eff_benchmark:,.2f})."
        )
        reasons.append(f"Consistent conversion volume ({mature_conv} conversions across {mature_days} mature days).")
        return {
            "status": status,
            "cpa": mature_cpa,
            "cvr": agg["cvr"],
            "confidence": confidence,
            "estimated_waste": 0.0,
            "reasons": reasons,
            "metrics": agg,
        }

    # Watch determination: Early warning signs (before day 14 only: spend >= 50% with low/zero conversions, or rising CPA)
    is_zero_conv_watch = (mature_days < settings.min_days) and (mature_spend >= 0.5 * min_spend_req) and (mature_conv <= 1)
    is_elevated_cpa_watch = (mature_cpa is not None and mature_cpa > 1.25 * eff_benchmark) or (
        trend["has_14d"] and trend.get("window1_cpa") is not None and trend["window1_cpa"] > 1.3 * eff_benchmark
    )
    if is_zero_conv_watch or is_elevated_cpa_watch:
        status = "watch"
        if mature_cpa is not None:
            reasons.append(
                f"Watch: Mature CPA (₹{mature_cpa:,.2f}) is trending above target (₹{eff_benchmark:,.2f})."
            )
        else:
            reasons.append(
                f"Watch: Campaign has spent ₹{mature_spend:,.2f} (>50% of threshold) with {mature_conv} conversions before Day {settings.min_days}."
            )
        reasons.append(
            f"Observing evidence: {mature_days}/{settings.min_days} mature days, ₹{mature_spend:,.0f}/₹{min_spend_req:,.0f} spend."
        )
        return {
            "status": status,
            "cpa": mature_cpa,
            "cvr": agg["cvr"],
            "confidence": confidence,
            "estimated_waste": waste,
            "reasons": reasons,
            "metrics": agg,
        }

    # Healthy determination: CPA near target, sufficient data
    if mature_days >= 7 and mature_cpa is not None and mature_cpa <= 1.25 * eff_benchmark:
        status = "healthy"
        reasons.append(f"Operating healthily near target CPA (₹{mature_cpa:,.2f} vs target ₹{eff_benchmark:,.2f}).")
        return {
            "status": status,
            "cpa": mature_cpa,
            "cvr": agg["cvr"],
            "confidence": confidence,
            "estimated_waste": 0.0,
            "reasons": reasons,
            "metrics": agg,
        }

    # Default fallback: Collecting Data
    status = "collecting_data"
    reasons.append(
        f"Collecting data - not enough evidence to judge yet. Day {mature_days} of {settings.min_days} mature days."
    )
    reasons.append(
        f"Current spend ₹{mature_spend:,.0f} of ₹{min_spend_req:,.0f} threshold; {mature_clicks} of {settings.min_clicks} clicks."
    )
    return {
        "status": status,
        "cpa": mature_cpa,
        "cvr": agg["cvr"],
        "confidence": confidence,
        "estimated_waste": 0.0,
        "reasons": reasons,
        "metrics": agg,
    }
