from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from .utils import Detection


def compute_peak_hours(detections: List[Detection], fps: float = 30.0, window_minutes: int = 15) -> Dict[int, int]:
    window = window_minutes * 60
    bucket_counts: Dict[int, int] = defaultdict(int)
    for d in detections:
        bucket = int(d.timestamp // window)
        bucket_counts[bucket] += 1
    return dict(bucket_counts)


def count_unique_tracks(detections: List[Detection]) -> int:
    return len({(d.location, d.track_id) for d in detections})


def corridor_congestion(detections: List[Detection]) -> float:
    # simple proxy: average simultaneous detections per minute bucket
    per_bucket = compute_peak_hours(detections, window_minutes=1)
    if not per_bucket:
        return 0.0
    return sum(per_bucket.values()) / len(per_bucket)


