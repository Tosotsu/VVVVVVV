from __future__ import annotations

from typing import Dict, List

from .camera_processor import CameraProcessor
from .utils import Detection


class BatchVideoProcessor:
    def __init__(self) -> None:
        self.video_groups: Dict[str, List[str]] = {
            "classrooms": ["class1.mp4", "class2.mp4", "class3.mp4", "class4.mp4"],
            "electronics_halls": ["ece1.mp4", "ece2.mp4"],
            "main_halls": ["mainhall1.mp4", "mainhall2.mp4", "mainhall3.mp4"],
            "civil_hall": ["civilhall1.mp4"],
            "main_entrance": ["mainentrance.mp4"],
        }
        self.processor = CameraProcessor.create()

    def process_single_video(self, video_file: str, location: str) -> List[Detection]:
        return self.processor.track_video(video_file, location)

    def process_video_group(self, location_type: str, video_files: List[str]) -> List[Detection]:
        combined: List[Detection] = []
        for vf in video_files:
            combined.extend(self.process_single_video(vf, location_type))
        return combined


