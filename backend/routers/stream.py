"""
Ad Waste Finder – Server-Sent Events (SSE) router.
GET /api/v1/stream
"""

from fastapi import APIRouter
from starlette.responses import StreamingResponse
from event_bus import event_bus

router = APIRouter(prefix="/api/v1", tags=["stream"])


@router.get("/stream")
async def stream_events():
    """
    Subscribes client to SSE broadcast stream (ticks, alerts, simulator state changes).
    """
    return StreamingResponse(
        event_bus.subscribe(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
