"""
Ad Waste Finder – Data source & CSV ingestion endpoint:
POST /api/v1/sources/csv
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_session
from models import Campaign, DailyMetric, DataSource, AuditLog
from schemas import CSVUploadResponse
from csv_parser.parser import parse_and_validate_csv
from config import settings as app_settings

router = APIRouter(prefix="/api/v1/sources", tags=["sources"])

ORG_ID = "00000000-0000-0000-0000-000000000001"


@router.post("/csv", response_model=CSVUploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    if len(content) > app_settings.CSV_MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit.")

    try:
        parsed_rows, camps_found, warnings = parse_and_validate_csv(content, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Create CSV data source if not present
    ds_res = await session.execute(
        select(DataSource).where(DataSource.organization_id == ORG_ID, DataSource.type == "csv")
    )
    ds = ds_res.scalar_one_or_none()
    if not ds:
        ds = DataSource(organization_id=ORG_ID, type="csv", status="active", config={"filename": file.filename})
        session.add(ds)
        await session.flush()

    # Create missing campaigns
    camps_res = await session.execute(select(Campaign).where(Campaign.data_source_id == ds.id))
    existing_camps = {c.name: c for c in camps_res.scalars().all()}

    for cname in camps_found:
        if cname not in existing_camps:
            new_camp = Campaign(
                data_source_id=ds.id,
                name=cname,
                channel="csv_import",
                goal_type="conversions",
                target_cpa=500.0,
                daily_budget=3000.0,
            )
            session.add(new_camp)
            await session.flush()
            existing_camps[cname] = new_camp

    # Insert daily metrics
    for r in parsed_rows:
        camp = existing_camps[r["campaign_name"]]
        metric = DailyMetric(
            campaign_id=camp.id,
            date=r["date"],
            spend=r["spend"],
            impressions=r["impressions"],
            clicks=r["clicks"],
            conversions=r["conversions"],
            revenue=r["revenue"],
            budget_exhausted=r["budget_exhausted"],
            is_mature=r["is_mature"],
        )
        session.add(metric)

    # Audit log
    audit = AuditLog(
        action="upload_csv",
        object_type="data_source",
        object_id=ds.id,
        details={"filename": file.filename, "rows_count": len(parsed_rows), "campaigns": camps_found},
    )
    session.add(audit)
    await session.commit()

    return CSVUploadResponse(
        status="ok",
        rows_imported=len(parsed_rows),
        campaigns_found=camps_found,
        warnings=warnings,
    )
