from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
import cv2

try:
    from insightface.app import FaceAnalysis
    from insightface.utils.face_align import norm_crop
except Exception:
    FaceAnalysis = None  # type: ignore

from .config import FaceConfig


@dataclass
class FaceMatch:
    identity: str
    confidence: float
    bbox_xyxy: Tuple[int, int, int, int] | None = None


class FaceRecognitionSystem:
    def __init__(self) -> None:
        self.known_faces_dir = FaceConfig.faces_dir
        self.model: FaceAnalysis | None = None
        self.embeddings: dict[str, np.ndarray] = {}
        self.threshold = 0.95  # Very lenient threshold for testing

    def load_known_faces(self, faces_dir: str | Path) -> None:
        self.known_faces_dir = Path(faces_dir)
        self.known_faces_dir.mkdir(parents=True, exist_ok=True)

        if FaceAnalysis is None:
            return

        # Initialize InsightFace FaceAnalysis (will download models on first run)
        self.model = FaceAnalysis(name='buffalo_l')
        self.model.prepare(ctx_id=-1)  # CPU mode

        # Build embeddings index
        self.embeddings.clear()
        for person_dir in sorted(self.known_faces_dir.rglob('*')):
            if not person_dir.is_dir():
                continue
            person_id = person_dir.name
            # Skip top-level folders like faces itself
            if person_id in {"faces", "principal", "students"} and person_dir == self.known_faces_dir:
                continue

            # Accept jpg/png images inside
            for img_path in person_dir.glob('*'):
                if img_path.suffix.lower() not in {'.jpg', '.jpeg', '.png'}:
                    continue
                img = cv2.imread(str(img_path))
                if img is None:
                    continue
                faces = self.model.get(img)
                if not faces:
                    continue
                face = faces[0]
                emb = face.normed_embedding
                if emb is None:
                    # Align crop if embedding missing
                    aimg = norm_crop(img, face.kps)
                    faces2 = self.model.get(aimg)
                    if not faces2:
                        continue
                    emb = faces2[0].normed_embedding
                    if emb is None:
                        continue
                # Average embeddings for same person
                if person_id in self.embeddings:
                    self.embeddings[person_id] = (self.embeddings[person_id] + emb) / 2.0
                else:
                    self.embeddings[person_id] = emb

    def _cosine_distance(self, a: np.ndarray, b: np.ndarray) -> float:
        a = a / (np.linalg.norm(a) + 1e-6)
        b = b / (np.linalg.norm(b) + 1e-6)
        return 1.0 - float(np.dot(a, b))

    def recognize(self, frame_bgr: np.ndarray, face_bbox: Tuple[int, int, int, int]) -> Optional[FaceMatch]:
        if self.model is None or not self.embeddings:
            return None
        x1, y1, x2, y2 = face_bbox
        x1, y1 = max(x1, 0), max(y1, 0)
        x2, y2 = max(x2, x1 + 1), max(y2, y1 + 1)
        face_img = frame_bgr[y1:y2, x1:x2]
        if face_img.size == 0:
            return None
        faces = self.model.get(face_img)
        if not faces:
            return None
        face = faces[0]
        query_emb = face.normed_embedding
        if query_emb is None:
            aimg = norm_crop(face_img, face.kps)
            faces2 = self.model.get(aimg)
            if not faces2 or faces2[0].normed_embedding is None:
                return None
            query_emb = faces2[0].normed_embedding

        # Find best match by cosine distance
        best_id = None
        best_dist = 1e9
        for person_id, ref_emb in self.embeddings.items():
            dist = self._cosine_distance(query_emb, ref_emb)
            if dist < best_dist:
                best_dist = dist
                best_id = person_id

        if best_id is None or best_dist > self.threshold:
            return None

        confidence = float(max(0.0, 1.0 - best_dist))
        return FaceMatch(identity=best_id, confidence=confidence, bbox_xyxy=face_bbox)


