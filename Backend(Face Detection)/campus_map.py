from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Tuple

from .config import CampusMapConfig


@dataclass
class CampusMap:
    image_path: Path
    camera_positions: Dict[str, Tuple[int, int]]
    pixel_to_meter_ratio: float

    @classmethod
    def from_config(cls) -> "CampusMap":
        return cls(
            image_path=CampusMapConfig.aerial_image,
            camera_positions=CampusMapConfig.camera_positions,
            pixel_to_meter_ratio=CampusMapConfig.pixel_to_meter_ratio,
        )

    def distance_meters(self, point_a: Tuple[int, int], point_b: Tuple[int, int]) -> float:
        ax, ay = point_a
        bx, by = point_b
        pixel_dist = ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5
        return pixel_dist * self.pixel_to_meter_ratio


