from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional


class AttendanceSystem:
    def __init__(self) -> None:
        self.daily_attendance: Dict[str, Dict[str, dict]] = {}

    def log_attendance(self, person_id: str, location: str, timestamp: datetime, confidence: float) -> None:
        date = timestamp.strftime("%Y-%m-%d")
        time_str = timestamp.strftime("%H:%M:%S")

        if date not in self.daily_attendance:
            self.daily_attendance[date] = {}

        if person_id not in self.daily_attendance[date]:
            self.daily_attendance[date][person_id] = {
                "first_seen": time_str,
                "locations": [],
                "total_detections": 0,
                "confidence_scores": [],
            }

        self.daily_attendance[date][person_id]["locations"].append(
            {"location": location, "time": time_str, "confidence": confidence}
        )
        self.daily_attendance[date][person_id]["total_detections"] += 1
        self.daily_attendance[date][person_id]["confidence_scores"].append(confidence)

    def generate_attendance_report(self, date: Optional[str] = None) -> Dict[str, dict]:
        if date:
            return self.daily_attendance.get(date, {})
        return self.daily_attendance

    def calculate_duration(self, locations: List[dict]) -> str:
        if not locations:
            return "0m"
        fmt = "%H:%M:%S"
        times = [datetime.strptime(loc["time"], fmt) for loc in locations]
        duration = (max(times) - min(times)).seconds
        minutes, seconds = divmod(duration, 60)
        hours, minutes = divmod(minutes, 60)
        if hours:
            return f"{hours}h {minutes}m"
        return f"{minutes}m {seconds}s"

    def get_principal_tracking(self) -> Dict[str, dict]:
        principal_movements = {}
        for date, attendance in self.daily_attendance.items():
            if "principal" in attendance:
                principal_movements[date] = {
                    "arrival_time": attendance["principal"]["first_seen"],
                    "locations_visited": [loc["location"] for loc in attendance["principal"]["locations"]],
                    "total_time_on_campus": self.calculate_duration(attendance["principal"]["locations"]),
                }
        return principal_movements


