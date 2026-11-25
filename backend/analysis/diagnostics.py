"""
Ad Waste Finder – On-demand funnel diagnostic matrix.
Implements the 5 signal patterns from product-design.md Section 4.2:
1. Low CTR, Normal CVR (Creative & Hook Fatigue)
2. High CTR, Low CVR (Landing Page / Offer Mismatch)
3. High CPC, High CPA (Auction & Bidding Inefficiency)
4. High Spend, Zero Conversions (Pixel / Tracking Breakdown or Critical Friction)
5. High Frequency, Rising CPA (Audience Exhaustion / Saturation)
"""

from typing import List, Dict, Any, Optional
from analysis.metrics import calculate_aggregate_metrics


def run_funnel_diagnostics(
    campaign: Any,
    mature_metrics: List[Any],
    peer_median_metrics: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Performs Funnel Root-Cause Triangulation comparing campaign metrics against benchmarks.
    Returns:
    - health_score (0-100)
    - primary_bottleneck
    - suggestions: list of {category, issue, suggestion, estimated_impact, difficulty}
    """
    if not mature_metrics:
        return {
            "health_score": 50.0,
            "primary_bottleneck": "Insufficient Data",
            "suggestions": [
                {
                    "category": "Data Collection",
                    "issue": "Not enough mature data points to establish funnel diagnostic baseline.",
                    "suggestion": "Allow campaign to run for at least 7 mature days before diagnosing.",
                    "estimated_impact": "Medium",
                    "difficulty": "Easy",
                }
            ],
        }

    agg = calculate_aggregate_metrics(mature_metrics)
    spend = agg["spend"]
    conversions = agg["conversions"]
    clicks = agg["clicks"]
    impressions = agg["impressions"]
    ctr = agg["ctr"]
    cvr = agg["cvr"]
    cpc = agg["cpc"]
    cpa = agg["cpa"] or 0.0

    # Fallback peer baselines if not provided
    peers = peer_median_metrics or {
        "ctr": 0.025,
        "cvr": 0.035,
        "cpc": 18.0,
        "cpa": 500.0,
    }

    peer_ctr = peers.get("ctr", 0.025)
    peer_cvr = peers.get("cvr", 0.035)
    peer_cpc = peers.get("cpc", 18.0)
    peer_cpa = peers.get("cpa", 500.0)

    suggestions: list[dict[str, Any]] = []
    bottlenecks: list[tuple[str, int]] = []  # (bottleneck_name, severity_weight)

    # ---------------------------------------------------------------------------
    # Pattern 4: High Spend, Zero Conversions (Spend > ₹5,000, 0 conversions)
    # ---------------------------------------------------------------------------
    if spend > 5000.0 and conversions == 0:
        bottlenecks.append(("Pixel / Tracking Breakdown or Critical Friction", 100))
        suggestions.append({
            "category": "Bidding & Technical Setup",
            "issue": f"High spend (₹{spend:,.2f}) with zero recorded conversions.",
            "suggestion": "Pixel Diagnostics: Verify conversion event firing using Google Tag Assistant or Meta Pixel Helper.",
            "estimated_impact": "High",
            "difficulty": "Easy",
        })
        suggestions.append({
            "category": "Landing Page & CVR",
            "issue": "Users are clicking through but none complete the conversion workflow.",
            "suggestion": "Checkout Audit: Test placing a live order in staging/production to verify payment gateway functionality.",
            "estimated_impact": "High",
            "difficulty": "Medium",
        })
        suggestions.append({
            "category": "Bidding & Technical Setup",
            "issue": "Unchecked capital drain without feedback signal.",
            "suggestion": "Emergency Budget Guard: Temporarily cap daily spend at 50% until tracking verification passes.",
            "estimated_impact": "High",
            "difficulty": "Easy",
        })

    # ---------------------------------------------------------------------------
    # Pattern 2: High CTR, Low CVR (CTR > 2.5%, CVR < 50% peer median)
    # ---------------------------------------------------------------------------
    elif ctr >= 0.025 and (cvr < 0.5 * peer_cvr):
        bottlenecks.append(("Landing Page / Offer Mismatch", 80))
        suggestions.append({
            "category": "Landing Page & CVR",
            "issue": f"Ad attracts strong attention (CTR {ctr*100:.1f}%), but landing page converts poorly (CVR {cvr*100:.2f}% vs peer {peer_cvr*100:.2f}%).",
            "suggestion": "Message Match: Ensure landing page headline exactly mirrors the ad promise and primary hook.",
            "estimated_impact": "High",
            "difficulty": "Easy",
        })
        suggestions.append({
            "category": "Landing Page & CVR",
            "issue": "Potential mobile friction or slow page load causing bounce before checkout.",
            "suggestion": "Speed & Mobile UX: Audit mobile page load speed (target <2.5s) and test simplified 1-page checkout.",
            "estimated_impact": "High",
            "difficulty": "Medium",
        })
        suggestions.append({
            "category": "Landing Page & CVR",
            "issue": "Weak perceived value proposition or hidden fees at checkout.",
            "suggestion": "Offer Clarity: Clarify pricing upfront and add risk-reversal guarantees (money-back / warranty) above the fold.",
            "estimated_impact": "Medium",
            "difficulty": "Easy",
        })

    # ---------------------------------------------------------------------------
    # Pattern 1: Low CTR, Normal CVR (CTR < 1.0%, CVR >= peer median * 0.8)
    # ---------------------------------------------------------------------------
    elif ctr < 0.010 and cvr >= (0.8 * peer_cvr):
        bottlenecks.append(("Creative & Hook Fatigue", 70))
        suggestions.append({
            "category": "Creative & Ad Copy",
            "issue": f"Low click-through rate ({ctr*100:.2f}%) indicates creative is being scrolled past, though those who click convert normally.",
            "suggestion": "Creative Refresh: Replace existing ad creatives with 3 high-contrast image or video hook variations.",
            "estimated_impact": "High",
            "difficulty": "Medium",
        })
        suggestions.append({
            "category": "Creative & Ad Copy",
            "issue": "Ad headline is not stopping the scroll in fast-moving feeds.",
            "suggestion": "Headline A/B Test: Test benefit-driven headlines against social-proof or urgency-driven copy.",
            "estimated_impact": "Medium",
            "difficulty": "Easy",
        })
        suggestions.append({
            "category": "Targeting & Audience",
            "issue": "The current audience segment has seen this ad too many times.",
            "suggestion": "Audience Rotation: Refresh targeting exclusions (past 30-day visitors) to avoid audience burnout.",
            "estimated_impact": "Medium",
            "difficulty": "Easy",
        })

    # ---------------------------------------------------------------------------
    # Pattern 3: High CPC, High CPA (CPC > 1.8x peer median, CVR normal)
    # ---------------------------------------------------------------------------
    elif cpc > (1.8 * peer_cpc) and cpa > (1.2 * peer_cpa):
        bottlenecks.append(("Auction & Bidding Inefficiency", 65))
        suggestions.append({
            "category": "Bidding & Technical Setup",
            "issue": f"Paying excessive cost per click (₹{cpc:,.2f} vs peer ₹{peer_cpc:,.2f}) inflating overall acquisition cost.",
            "suggestion": "Bidding Strategy: Switch from aggressive manual bidding to Target CPA bidding with a realistic max bid cap.",
            "estimated_impact": "High",
            "difficulty": "Easy",
        })
        suggestions.append({
            "category": "Targeting & Audience",
            "issue": "Audience pool is overly narrow, triggering expensive auction competition.",
            "suggestion": "Audience Expansion: Expand lookalike threshold from 1% to 2–3% or add broader keyword match types with negative keywords.",
            "estimated_impact": "High",
            "difficulty": "Medium",
        })
        suggestions.append({
            "category": "Bidding & Technical Setup",
            "issue": "Spend leaking during low-intent time slots.",
            "suggestion": "Dayparting: Review conversion hours; pause or reduce bidding by 30% during late-night non-converting windows.",
            "estimated_impact": "Medium",
            "difficulty": "Easy",
        })

    # ---------------------------------------------------------------------------
    # Pattern 5: Audience Saturation / High Frequency
    # ---------------------------------------------------------------------------
    elif impressions > 0 and (impressions / max(1, clicks) > 60) and cpa > (1.2 * peer_cpa):
        bottlenecks.append(("Audience Exhaustion / Saturation", 60))
        suggestions.append({
            "category": "Targeting & Audience",
            "issue": "Audience frequency is elevated while conversion efficiency is dropping.",
            "suggestion": "Frequency Cap: Enforce a strict frequency cap of 2 impressions per user per week.",
            "estimated_impact": "High",
            "difficulty": "Easy",
        })
        suggestions.append({
            "category": "Targeting & Audience",
            "issue": "Core target audience has been fully tapped out.",
            "suggestion": "Audience Broadening: Add adjacent interest clusters or expand geographic radius.",
            "estimated_impact": "High",
            "difficulty": "Medium",
        })

    # Default fallback: General health optimization
    if not suggestions:
        bottlenecks.append(("Healthy Funnel Alignment", 10))
        suggestions.append({
            "category": "Creative & Ad Copy",
            "issue": "Performance is broadly stable with no single glaring bottleneck.",
            "suggestion": "Iterative A/B Testing: Continuously test new creative angles to protect against future fatigue.",
            "estimated_impact": "Low",
            "difficulty": "Easy",
        })

    # Health score computation (0-100)
    primary_bottleneck, max_sev = bottlenecks[0] if bottlenecks else ("Healthy Funnel", 0)
    health_score = max(10.0, min(100.0, 100.0 - max_sev))

    return {
        "health_score": round(health_score, 1),
        "primary_bottleneck": primary_bottleneck,
        "suggestions": suggestions,
    }
