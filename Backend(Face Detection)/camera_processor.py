from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import cv2
import numpy as np

try:
    from ultralytics import YOLO
except Exception:  # pragma: no cover
    YOLO = None  # type: ignore

from .config import ModelConfig
from .utils import Detection


@dataclass
class CameraProcessor:
    model: YOLO | None
    conf: float
    iou: float

    @classmethod
    def create(cls) -> "CameraProcessor":
        model = None
        if YOLO is not None:
            try:
                model = YOLO(ModelConfig.yolo_weights)
            except Exception:
                model = None
        return cls(model=model, conf=ModelConfig.conf_threshold, iou=ModelConfig.iou_threshold)

    def _detect_persons(self, frame_bgr: np.ndarray) -> List[Tuple[Tuple[int, int, int, int], float, int]]:
        if self.model is None:
            return []
        res = self.model.predict(source=frame_bgr, conf=self.conf, iou=self.iou, device=ModelConfig.device, verbose=False)
        outputs: List[Tuple[Tuple[int, int, int, int], float, int]] = []
        for r in res:
            if r.boxes is None:
                continue
            for b in r.boxes:
                cls_id = int(b.cls.item()) if hasattr(b.cls, "item") else int(b.cls)
                if cls_id != ModelConfig.person_class_id:
                    continue
                conf = float(b.conf.item()) if hasattr(b.conf, "item") else float(b.conf)
                xyxy = b.xyxy[0].tolist()
                x1, y1, x2, y2 = map(int, xyxy)
                outputs.append(((x1, y1, x2, y2), conf, cls_id))
        return outputs

    def process_video(self, video_path: str | Path, location: str) -> List[Detection]:
        cap = cv2.VideoCapture(str(video_path))
        detections: List[Detection] = []
        frame_index = 0
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            boxes = self._detect_persons(frame)
            for i, (bbox, conf, cls_id) in enumerate(boxes):
                det = Detection(
                    track_id=i,  # placeholder; tracking handled in track_video
                    bbox_xyxy=bbox,
                    confidence=conf,
                    class_id=cls_id,
                    frame_index=frame_index,
                    timestamp=frame_index / fps,
                    location=location,
                )
                detections.append(det)
            frame_index += 1
        cap.release()
        return detections

    def track_video(self, video_path: str | Path, location: str) -> List[Detection]:
        # For simplicity, use model.track if available, otherwise fallback to per-frame ids
        if self.model is None:
            return self.process_video(video_path, location)

        cap = cv2.VideoCapture(str(video_path))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        cap.release()

        # Create output directory for visualizations
        output_dir = Path("outputs") / location
        output_dir.mkdir(parents=True, exist_ok=True)

        results = self.model.track(
            source=str(video_path),
            conf=self.conf,
            iou=self.iou,
            device=ModelConfig.device,
            verbose=False,
            persist=True,
            save=True,  # Always save visualizations
            project="outputs",
            name=location,
            save_txt=True,  # Save detection coordinates
        )
        
        detections: List[Detection] = []
        unique_tracks = set()  # Track unique person IDs
        
        for r in results:
            if r.boxes is None:
                continue
            frame_index = int(getattr(r, "frame_idx", 0))
            frame_detections = 0
            
            for b in r.boxes:
                cls_id = int(b.cls.item()) if hasattr(b.cls, "item") else int(b.cls)
                if cls_id != ModelConfig.person_class_id:
                    continue
                conf = float(b.conf.item()) if hasattr(b.conf, "item") else float(b.conf)
                xyxy = b.xyxy[0].tolist()
                x1, y1, x2, y2 = map(int, xyxy)
                track_id = int(b.id.item()) if getattr(b, "id", None) is not None else -1
                
                # Count unique tracks
                if track_id >= 0:
                    unique_tracks.add(track_id)
                
                det = Detection(
                    track_id=track_id,
                    bbox_xyxy=(x1, y1, x2, y2),
                    confidence=conf,
                    class_id=cls_id,
                    frame_index=frame_index,
                    timestamp=frame_index / fps,
                    location=location,
                )
                detections.append(det)
                frame_detections += 1
                
                # Limit detections per frame to avoid false positives
                if frame_detections >= ModelConfig.max_detections_per_frame:
                    break
        
        print(f"  📊 Unique people tracked: {len(unique_tracks)}")
        print(f"  📊 Total detections: {len(detections)}")
        print(f"  📁 Visualizations saved to: outputs/{location}/")
        
        return detections


