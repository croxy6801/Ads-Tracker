"""
Ad Waste Finder – FastAPI main application entrypoint.
Configures CORS, lifespan (DB init + seed + simulator background runner),
registers all API routers, and exposes health check.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db, async_session_factory
from seed import seed_database
from simulator.runner import simulator_background_worker

from routers import (
    dashboard,
    campaigns,
    recommendations,
    simulator,
    sources,
    settings as settings_router,
    audit,
    stream,
    alerts,
    live_account,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed initial organization & campaigns
    await init_db()
    async with async_session_factory() as session:
        await seed_database(session)

    # Launch background simulator worker task
    worker_task = asyncio.create_task(simulator_background_worker())

    yield

    # Shutdown: cancel worker task
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    description="Live Ad Campaign Waste Tracker API with Bayesian Analysis & Diagnostic Playbooks",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(dashboard.router)
app.include_router(campaigns.router)
app.include_router(recommendations.router)
app.include_router(simulator.router)
app.include_router(sources.router)
app.include_router(settings_router.router)
app.include_router(audit.router)
app.include_router(stream.router)
app.include_router(alerts.router)
app.include_router(live_account.router)


@app.get("/health", tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": "sqlite_aiosqlite",
    }
