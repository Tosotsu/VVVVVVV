SNMIMT Campus Person Tracking System
====================================

Quick start
-----------

1. Place the campus aerial image at `data/campus_aerial.jpg` (create the `data/` folder next to this package).
2. Put face images in `faces/principal/` and `faces/students/<student_id>/`.
3. Have your videos (`civilhall1.mp4`, `class1.mp4`, ..., `mainhall3.mp4`) in the working directory.
4. Create a virtual environment and install requirements:

```
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r snmimt_campus_tracker/requirements.txt
```

5. Run processing:

```
python -m snmimt_campus_tracker.main
```

6. Dashboard (separate terminal):

```
streamlit run snmimt_campus_tracker/dashboard.py
```

Notes
-----

- YOLO weights download automatically on first run.
- Face recognition requires DeepFace; place clear frontal images per person.
- For Apple Silicon, TensorFlow macOS + metal acceleration are included in requirements.


