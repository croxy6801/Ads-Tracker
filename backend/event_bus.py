"""
Ad Waste Finder – In-memory SSE event bus for real-time broadcasts.
"""

import asyncio
import json
from typing import AsyncGenerator, Set


class SSEEventBus:
    def __init__(self):
        self._subscribers: Set[asyncio.Queue] = set()

    async def subscribe(self) -> AsyncGenerator[str, None]:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(queue)
        try:
            while True:
                msg = await queue.get()
                yield msg
        finally:
            self._subscribers.remove(queue)

    async def broadcast(self, event_type: str, data: dict) -> None:
        if not self._subscribers:
            return
        # SSE format: event: <type>\ndata: <json>\n\n
        payload = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        for queue in list(self._subscribers):
            try:
                queue.put_nowait(payload)
            except Exception:
                pass


event_bus = SSEEventBus()
