from __future__ import annotations

from pathlib import Path
from typing import Dict, List

import cv2
import numpy as np

from .attendance_system import AttendanceSystem
from .camera_processor import CameraProcessor
from .config import LOCATION_PATTERNS, VIDEO_FILE_MAPPING
from .face_recognition_system import FaceRecognitionSystem
from .location_identifier import LocationIdentifier
from .utils import now_ts, resolve_video_path


class SNMIMTCampusTracker:
    def __init__(self, campus_image: str | None = None):
        self.location_identifier = LocationIdentifier()
        self.camera_processor = CameraProcessor.create()
        self.camera_locations = {
            "electronics_hall": {"building": "northern_electronics_block", "floor": "ground_floor", "type": "department_entrance"},
            "main_entrance": {"building": "main_engineering_building", "floor": "ground_floor", "type": "primary_campus_entrance"},
            "civil_hall": {"building": "main_engineering_building", "floor": "ground_floor", "type": "department_corridor"},
            "classroom": {"building": "main_engineering_building", "floor": "ground_floor", "type": "classroom_interior"},
        }

    def process_video_with_recognition(self, video_file: str, location: str, face_system: FaceRecognitionSystem, attendance: AttendanceSystem):
        video_path = resolve_video_path(video_file)
        detections = self.camera_processor.track_video(str(video_path), location)
        
        print(f"  🔍 Running face recognition on {len(detections)} detections...")
        
        # Process face recognition for each detection
        cap = cv2.VideoCapture(str(video_path))
        frame_cache = {}
        recognition_count = 0
        
        for det in detections:
            frame_idx = det.frame_index
            if frame_idx not in frame_cache:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ok, frame = cap.read()
                if not ok:
                    continue
                frame_cache[frame_idx] = frame
            frame = frame_cache[frame_idx]

            x1, y1, x2, y2 = det.bbox_xyxy
            width = max(0, x2 - x1)
            height = max(0, y2 - y1)
            if width == 0 or height == 0:
                continue
                
            # Try to recognize face in the upper portion of person bbox
            face_box = (x1, y1, x2, y1 + int(0.4 * height))
            match = face_system.recognize(frame, face_box)
            
            if match is not None:
                det.face_id = match.identity
                attendance.log_attendance(match.identity, location, now_ts(), match.confidence)
                recognition_count += 1
                print(f"    ✅ Recognized: {match.identity} (confidence: {match.confidence:.2f})")
        
        cap.release()
        
        if recognition_count > 0:
            print(f"  🎯 Total recognitions: {recognition_count}")
        else:
            print(f"  ⚠️  No faces recognized in this video")
            
        return detections


def identify_video_location(filename: str) -> str:
    from .utils import identify_video_location as _identify
    return _identify(filename, LOCATION_PATTERNS)


def discover_video_files() -> List[str]:
    """Discover all video files in data/; fallback to current directory if none found. Avoid duplicates."""
    video_extensions = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv"}
    names: set[str] = set()
    ordered: List[str] = []

    data_dir = Path("data")
    if data_dir.exists():
        for p in sorted(data_dir.iterdir()):
            if p.suffix.lower() in video_extensions and p.name not in names:
                names.add(p.name)
                ordered.append(p.name)
    if not ordered:
        for p in sorted(Path('.').iterdir()):
            if p.suffix.lower() in video_extensions and p.name not in names:
                names.add(p.name)
                ordered.append(p.name)
    return ordered


def run_all_videos() -> None:
    tracker = SNMIMTCampusTracker(campus_image=str(Path("data/campus_aerial.jpg")))
    face_system = FaceRecognitionSystem()
    face_system.load_known_faces("faces/")
    attendance = AttendanceSystem()

    video_files = discover_video_files()
    if not video_files:
        print("No video files found in data/ folder or current directory!")
        print("Supported formats: .mp4, .avi, .mov, .mkv, .wmv, .flv")
        return

    print(f"Found {len(video_files)} video files to process:")
    for vf in video_files:
        print(f"  - {vf}")
    print()

    total_detections = 0
    for video_file in video_files:
        location = identify_video_location(video_file)
        print(f"Processing {video_file} (location: {location})...")
        detections = tracker.process_video_with_recognition(video_file, location, face_system, attendance)
        total_detections += len(detections)
        print(f"  ✓ {len(detections)} people detected")

    print(f"\n=== Processing Complete ===")
    print(f"Total videos processed: {len(video_files)}")
    print(f"Total people detected: {total_detections}")

    daily_report = attendance.generate_attendance_report()
    principal_tracking = attendance.get_principal_tracking()

    print("\n=== Daily Attendance Report ===")
    for date, people in daily_report.items():
        print(f"\nDate: {date}")
        for person_id, details in people.items():
            print(f"  {person_id}: First seen at {details['first_seen']}")
            print(f"    Locations: {[loc['location'] for loc in details['locations']]}" )

    print("\n=== Principal Tracking ===")
    for date, movements in principal_tracking.items():
        print(f"Date: {date}")
        print(f"  Arrival: {movements['arrival_time']}")
        print(f"  Visited: {movements['locations_visited']}")


if __name__ == "__main__":
    run_all_videos()


