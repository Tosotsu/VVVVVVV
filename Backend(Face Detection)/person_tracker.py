from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from .config import TRAVEL_TIME_SECONDS
from .utils import Detection


@dataclass
class JourneySegment:
    from_location: str
    to_location: str
    start_time: float
    end_time: float
    confidence: float


class CrossCameraReIdentifier:
    def __init__(self) -> None:
        # map of global_id to last known appearance
        self.global_id_counter = 0
        self.track_to_global: Dict[str, int] = {}

    def _key(self, camera: str, track_id: int) -> str:
        return f"{camera}:{track_id}"

    def correlate(self, prev: Detection, curr: Detection) -> float:
        # simple appearance-free temporal rule: check time between camera pairs
        if prev.location and curr.location:
            travel = TRAVEL_TIME_SECONDS.get((prev.location, curr.location))
            if travel is None:
                # allow transitions inside same area types
                return 0.2
            dt = curr.timestamp - prev.timestamp
            # Score higher if dt close to expected travel
            if dt <= 0:
                return 0.0
            ratio = abs(dt - travel) / max(travel, 1e-3)
            return max(0.0, 1.0 - ratio)
        return 0.0

    def assign_global_id(self, camera: str, track_id: int) -> int:
        key = self._key(camera, track_id)
        if key not in self.track_to_global:
            self.global_id_counter += 1
            self.track_to_global[key] = self.global_id_counter
        return self.track_to_global[key]


def reconstruct_person_journey(detections_by_camera: Dict[str, List[Detection]]) -> Dict[int, List[JourneySegment]]:
    # Flatten and sort by time
    all_dets: List[Tuple[str, Detection]] = []
    for cam, dets in detections_by_camera.items():
        for d in dets:
            d.location = cam
            all_dets.append((cam, d))
    all_dets.sort(key=lambda x: x[1].timestamp)

    reid = CrossCameraReIdentifier()
    last_by_global: Dict[int, Detection] = {}
    journeys: Dict[int, List[JourneySegment]] = {}

    for cam, det in all_dets:
        global_id = reid.assign_global_id(cam, det.track_id)
        if global_id not in journeys:
            journeys[global_id] = []

        prev = last_by_global.get(global_id)
        if prev is not None and prev.location and det.location:
            conf = reid.correlate(prev, det)
            if conf > 0.4:  # threshold for accepting a transition
                journeys[global_id].append(
                    JourneySegment(
                        from_location=prev.location,
                        to_location=det.location,
                        start_time=prev.timestamp,
                        end_time=det.timestamp,
                        confidence=conf,
                    )
                )
        last_by_global[global_id] = det

    return journeys


