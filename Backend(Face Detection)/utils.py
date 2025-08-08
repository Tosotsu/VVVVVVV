from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple


def ensure_dir(path: Path | str) -> Path:
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def load_json(path: Path | str, default: Any = None) -> Any:
    p = Path(path)
    if not p.exists():
        return default
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path | str, data: Any) -> None:
    p = Path(path)
    ensure_dir(p.parent)
    with p.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def now_ts() -> datetime:
    return datetime.now()


def format_time(dt: datetime) -> str:
    return dt.strftime("%H:%M:%S")


def identify_video_location(filename: str, location_patterns: Dict[str, List[str]]) -> str:
    name = filename.lower()
    for location, patterns in location_patterns.items():
        for pattern in patterns:
            if pattern in name:
                return location
    return "unknown"


def resolve_video_path(filename: str | Path) -> Path:
    """Resolve a video path from current directory or data/ folder.
    - If absolute path provided, return as-is if exists.
    - Otherwise prefer ./<filename>, then ./data/<filename>.
    """
    p = Path(filename)
    if p.is_absolute() and p.exists():
        return p
    # Try current directory
    here = Path.cwd() / p.name
    if here.exists():
        return here
    # Try data directory next to cwd
    data_path = Path.cwd() / "data" / p.name
    if data_path.exists():
        return data_path
    # As a last resort, return the original (will likely fail later)
    return p


@dataclass
class Detection:
    track_id: int
    bbox_xyxy: Tuple[int, int, int, int]
    confidence: float
    class_id: int
    frame_index: int
    timestamp: float
    location: str | None = None
    face_id: str | None = None


def compute_iou(box1: Tuple[int, int, int, int], box2: Tuple[int, int, int, int]) -> float:
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter_w = max(0, x2 - x1)
    inter_h = max(0, y2 - y1)
    inter = inter_w * inter_h
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = max(area1 + area2 - inter, 1e-6)
    return inter / union


