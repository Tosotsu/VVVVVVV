from __future__ import annotations

from typing import Dict, Tuple


def setup_campus_coordinates():
    campus_map = {
        "image_reference": "campus_aerial_view.jpg",
        "coordinate_system": "pixel_to_meters_conversion",
        "camera_positions": {
            "electronics_hall": (400, 200),
            "main_entrance": (380, 400),
            "civil_hall": (320, 380),
            "classroom": (450, 380),
        },
    }
    return campus_map


