from __future__ import annotations

import cv2
import numpy as np
from typing import Dict, List, Tuple

from .config import LOCATION_PATTERNS
from .utils import identify_video_location


class LocationIdentifier:
    def __init__(self) -> None:
        self.location_signatures: Dict[str, Dict[str, float]] = {}

    def signature_from_frame(self, frame: np.ndarray) -> Dict[str, float]:
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        brightness = float(np.mean(gray) / 255.0)
        # crude edges for corridors/structures
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(edges.mean() / 255.0)
        return {
            "sharpness": lap_var,
            "brightness": brightness,
            "edge_density": edge_density,
        }

    def identify_by_filename(self, filename: str) -> str:
        return identify_video_location(filename, LOCATION_PATTERNS)

    def compare_signature(self, sig: Dict[str, float]) -> Tuple[str, float]:
        if not self.location_signatures:
            return "unknown", 0.0
        best_loc = "unknown"
        best_score = -1.0
        for loc, ref in self.location_signatures.items():
            score = 0.0
            score += 1.0 - min(abs(sig["sharpness"] - ref["sharpness"]) / (ref["sharpness"] + 1e-6), 1.0)
            score += 1.0 - min(abs(sig["brightness"] - ref["brightness"]) / (ref["brightness"] + 1e-6), 1.0)
            score += 1.0 - min(abs(sig["edge_density"] - ref["edge_density"]) / (ref["edge_density"] + 1e-6), 1.0)
            if score > best_score:
                best_score = score
                best_loc = loc
        confidence = max(0.0, min(best_score / 3.0, 1.0))
        return best_loc, confidence

    def add_reference_signature(self, location: str, frame: np.ndarray) -> None:
        self.location_signatures[location] = self.signature_from_frame(frame)


