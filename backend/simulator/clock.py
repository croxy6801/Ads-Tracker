"""
Ad Waste Finder – Simulator clock state machine.
Supports: play, pause, speed, jump, reset.
"""

from datetime import date, timedelta
from typing import Optional


class SimulatorClock:
    """Manages virtual simulation time and playback state."""

    START_DATE: date = date(2024, 1, 1)

    def __init__(self, start_date: Optional[date] = None, speed: float = 1.0):
        self.start_date = start_date or self.START_DATE
        self.current_day: int = 0
        self.is_playing: bool = False
        self.speed: float = speed  # 1.0 = 1s per day, 2.0 = 0.5s per day

    @property
    def current_date(self) -> date:
        return self.start_date + timedelta(days=self.current_day)

    def play(self) -> None:
        self.is_playing = True

    def pause(self) -> None:
        self.is_playing = False

    def toggle(self) -> bool:
        self.is_playing = not self.is_playing
        return self.is_playing

    def set_speed(self, speed: float) -> None:
        if speed > 0:
            self.speed = speed

    def tick(self) -> int:
        """Advance by 1 virtual day."""
        self.current_day += 1
        return self.current_day

    def jump_to(self, target_day: int) -> int:
        """Jump to specific virtual day number."""
        if target_day >= 0:
            self.current_day = target_day
        return self.current_day

    def reset(self) -> None:
        self.current_day = 0
        self.is_playing = False


simulator_clock = SimulatorClock()
