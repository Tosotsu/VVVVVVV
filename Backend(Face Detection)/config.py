from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent


class ModelConfig:
    yolo_weights: str = "yolov8n.pt"  # auto-download by ultralytics
    device: str = "cpu"  # force CPU on macOS (no CUDA)
    person_class_id: int = 0  # COCO class id for person
    conf_threshold: float = 0.5  # increased from 0.25 to reduce false positives
    iou_threshold: float = 0.45
    save_visualization: bool = True  # save detection visualizations
    max_detections_per_frame: int = 20  # limit detections per frame


class TrackingConfig:
    tracker_type: str = "deep_sort"  # "deep_sort" or "bytetrack" (via ultralytics track API)
    max_age: int = 30
    n_init: int = 3
    max_cosine_distance: float = 0.2
    nn_budget: int | None = None


class FaceConfig:
    faces_dir: Path = PROJECT_ROOT.parent / "faces"
    principal_dir: Path = faces_dir / "principal"
    students_dir: Path = faces_dir / "students"
    detector_backend: str = "retinaface"  # for deepface
    recognition_model: str = "Facenet512"  # for deepface
    recognition_threshold: float = 0.4  # lower is stricter for some models


class CampusMapConfig:
    data_dir: Path = PROJECT_ROOT.parent / "data"
    aerial_image: Path = data_dir / "campus_aerial.jpg"
    pixel_to_meter_ratio: float = 0.5  # placeholder; calibrate from aerial image
    camera_positions = {
        "electronics_hall": (400, 200),
        "main_entrance": (380, 400),
        "civil_hall": (320, 380),
        "classroom": (450, 380),
    }


TRAVEL_TIME_SECONDS = {
    ("main_entrance", "civil_hall"): 90,
    ("civil_hall", "main_entrance"): 90,
    ("main_entrance", "electronics_hall"): 180,
    ("electronics_hall", "main_entrance"): 180,
    ("civil_hall", "classroom"): 60,
    ("classroom", "civil_hall"): 60,
    ("main_entrance", "classroom"): 120,
    ("classroom", "main_entrance"): 120,
}


VIDEO_FILE_MAPPING = {
    "civil_hall": "civilhall1.mp4",
    "classrooms": [
        "class1.mp4",
        "class2.mp4",
        "class3.mp4",
        "class4.mp4",
    ],
    "electronics_halls": [
        "ece1.mp4",
        "ece2.mp4",
    ],
    "main_entrance": "mainentrance.mp4",
    "main_halls": [
        "mainhall1.mp4",
        "mainhall2.mp4",
        "mainhall3.mp4",
    ],
}


LOCATION_PATTERNS = {
    "civil_hall": ["civil"],
    "classroom": ["class"],
    "electronics_hall": ["ece"],
    "main_entrance": ["mainentrance"],
    "main_hall": ["mainhall"],
}


