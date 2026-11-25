"""
Ad Waste Finder – Simulator control endpoints:
POST /api/v1/simulator/control (play, pause, speed, jump, reset)
POST /api/v1/simulator/scenario (sudden_failure, lag_spike, reset_seed)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete

from database import get_session
from models import DailyMetric, AnalysisSnapshot, Recommendation, Alert
from schemas import SimulatorControlRequest, SimulatorScenarioRequest, SimulatorState
from simulator.clock import simulator_clock
from simulator.engine import simulator_engine
from simulator.runner import run_daily_tick
from event_bus import event_bus

router = APIRouter(prefix="/api/v1/simulator", tags=["simulator"])


@router.get("/state", response_model=SimulatorState)
async def get_simulator_state():
    return SimulatorState(
        is_playing=simulator_clock.is_playing,
        speed=simulator_clock.speed,
        current_day=simulator_clock.current_day,
        current_date=simulator_clock.current_date.isoformat(),
    )


@router.post("/control", response_model=SimulatorState)
async def control_simulator(payload: SimulatorControlRequest, session: AsyncSession = Depends(get_session)):
    cmd = payload.command

    if cmd == "play":
        simulator_clock.play()
    elif cmd == "pause":
        simulator_clock.pause()
    elif cmd == "speed":
        if payload.value and payload.value > 0:
            simulator_clock.set_speed(payload.value)
    elif cmd == "jump":
        target = int(payload.value or 0)
        # Advance day-by-day up to target
        while simulator_clock.current_day < target:
            d = simulator_clock.tick()
            await run_daily_tick(d, simulator_clock.current_date)
    elif cmd == "reset":
        simulator_clock.reset()
        simulator_engine.reset_seed(42)
        # Clear generated daily metrics, snapshots, recommendations, alerts
        await session.execute(delete(DailyMetric))
        await session.execute(delete(AnalysisSnapshot))
        await session.execute(delete(Recommendation))
        await session.execute(delete(Alert))
        await session.commit()

    # Broadcast state change
    state = {
        "is_playing": simulator_clock.is_playing,
        "speed": simulator_clock.speed,
        "current_day": simulator_clock.current_day,
        "current_date": simulator_clock.current_date.isoformat(),
    }
    await event_bus.broadcast("state_change", state)

    return SimulatorState(**state)


@router.post("/scenario")
async def inject_scenario(payload: SimulatorScenarioRequest):
    camp_id = payload.campaign_id or "camp-slow-0002"

    if payload.scenario == "sudden_failure":
        simulator_engine.inject_sudden_failure(camp_id)
    elif payload.scenario == "lag_spike":
        simulator_engine.inject_lag_spike(camp_id)
    elif payload.scenario == "reset_seed":
        simulator_engine.reset_seed(42)

    await event_bus.broadcast("alert", {"scenario_injected": payload.scenario, "campaign_id": camp_id})
    return {"status": "ok", "scenario": payload.scenario, "campaign_id": camp_id}
