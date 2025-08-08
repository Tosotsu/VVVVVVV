from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict

from .utils import ensure_dir


def export_attendance_csv(attendance_report: Dict[str, dict], out_path: str | Path) -> Path:
    out_path = Path(out_path)
    ensure_dir(out_path.parent)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["date", "person_id", "first_seen", "location", "time", "confidence"])
        for date, persons in attendance_report.items():
            for pid, details in persons.items():
                first_seen = details.get("first_seen", "")
                for loc in details.get("locations", []):
                    writer.writerow([date, pid, first_seen, loc.get("location", ""), loc.get("time", ""), loc.get("confidence", 0.0)])
    return out_path


