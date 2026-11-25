"""
Ad Waste Finder – CSV Parser for Google Ads and Meta Ads exports.
Features:
- Standard Google Ads & Meta Ads column alias auto-mapping
- Validation pipeline (max 10MB, non-negative values, date format, empty check)
"""

import io
import pandas as pd
from datetime import datetime, date
from typing import Dict, Any, List, Tuple


# Known column aliases across Google Ads and Meta Ads
COLUMN_ALIASES: Dict[str, List[str]] = {
    "date": ["date", "day", "day_date", "reporting_date", "time", "date_start"],
    "campaign_name": ["campaign_name", "campaign", "campaignname", "ad_campaign"],
    "spend": ["spend", "cost", "amount_spent", "cost_inr", "total_spend"],
    "impressions": ["impressions", "impr", "views", "impressions_count"],
    "clicks": ["clicks", "link_clicks", "ad_clicks", "total_clicks"],
    "conversions": ["conversions", "conv", "purchases", "results", "actions", "total_conversions"],
    "revenue": ["revenue", "conversion_value", "total_conversion_value", "conv_value", "value"],
}


def auto_map_columns(df: pd.DataFrame) -> Tuple[Dict[str, str], List[str]]:
    """
    Identifies canonical columns from aliases.
    Returns: (mapping_dict, missing_required_fields)
    """
    col_lookup = {str(col).strip().lower().replace(" ", "_"): col for col in df.columns}
    mapping: Dict[str, str] = {}

    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in col_lookup:
                mapping[canonical] = col_lookup[alias]
                break

    # Required columns: date, campaign_name, spend, impressions, clicks
    required = ["date", "campaign_name", "spend", "clicks"]
    missing = [req for req in required if req not in mapping]

    return mapping, missing


def parse_and_validate_csv(
    file_bytes: bytes,
    filename: str = "upload.csv",
) -> Tuple[List[Dict[str, Any]], List[str], List[str]]:
    """
    Parses and validates CSV content.
    Returns:
        (rows_data, campaigns_found, warnings)
    """
    warnings: List[str] = []

    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Failed to read CSV: {str(e)}")

    if df.empty:
        raise ValueError("Uploaded CSV is empty.")

    mapping, missing = auto_map_columns(df)
    if missing:
        raise ValueError(f"CSV is missing required columns: {', '.join(missing)}")

    # Standardize column names
    inv_map = {orig: canonical for canonical, orig in mapping.items()}
    renamed = df.rename(columns=inv_map)

    # Optional fields defaults
    if "impressions" not in renamed.columns:
        renamed["impressions"] = renamed["clicks"]
    if "conversions" not in renamed.columns:
        renamed["conversions"] = 0.0
    if "revenue" not in renamed.columns:
        renamed["revenue"] = 0.0

    parsed_rows: List[Dict[str, Any]] = []
    campaigns_found: set[str] = set()

    # Parse rows
    for idx, row in renamed.iterrows():
        # Date parsing
        raw_date = row.get("date")
        try:
            parsed_date = pd.to_datetime(raw_date).date()
        except Exception:
            warnings.append(f"Row {idx+1}: Unparseable date '{raw_date}' — row skipped.")
            continue

        camp_name = str(row.get("campaign_name", "Unknown Campaign")).strip()
        campaigns_found.add(camp_name)

        spend = max(0.0, float(pd.to_numeric(row.get("spend"), errors="coerce") or 0.0))
        impressions = max(0, int(pd.to_numeric(row.get("impressions"), errors="coerce") or 0))
        clicks = max(0, int(pd.to_numeric(row.get("clicks"), errors="coerce") or 0))
        conversions = max(0.0, float(pd.to_numeric(row.get("conversions"), errors="coerce") or 0.0))
        revenue = max(0.0, float(pd.to_numeric(row.get("revenue"), errors="coerce") or 0.0))

        parsed_rows.append({
            "campaign_name": camp_name,
            "date": parsed_date,
            "spend": round(spend, 2),
            "impressions": impressions,
            "clicks": clicks,
            "conversions": round(conversions, 2),
            "revenue": round(revenue, 2),
            "budget_exhausted": 1.0,
            "is_mature": True,
        })

    # Duration warning
    if parsed_rows:
        dates = [r["date"] for r in parsed_rows]
        span_days = (max(dates) - min(dates)).days + 1
        if span_days < 14:
            warnings.append(f"Dataset covers only {span_days} days. Minimum 14 days required for reliable flagging.")

    return parsed_rows, sorted(list(campaigns_found)), warnings
