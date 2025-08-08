

# P-TRACKER🎯

Basic Details

Team Name: VVVVVVVVVVVVV

Team Members

	•	Team Lead: Fresher Lonappan- SNMIMT🎯

	•	### Basic Details
	•	- **Team Name**: VVVVVVVVVVVVV
	•	- **Project Name**: P-Tracker

	•	### Team Members
	•	- **Team Lead**: Fresher Lonappan - SNMIMT
	•	- **Member 2**: Navaneeth - SMIMT

### Project Description
- **What it does**: Multi-camera person detection, tracking, and face-based identification across SNMIMT campus using YOLOv8 and InsightFace. Generates attendance logs and analytics and shows a live dashboard.
- **How it works**: Processes CCTV footage, identifies locations, tracks movements between buildings based on campus map, and correlates identities across cameras.

### The Problem (that doesn't exist)
- Identifying which student prefers the shady tree path vs the sunny corridor is absolutely critical to campus quantum vibes.

- Navaneeth and fresher quest for attendance

-IDEA : To track principal around the college, so student and facaulty can know the position of prinicpal reliably.
 > so for students can also know their attendance without the help of teacher logged attendance or false atttendance


### The Solution (that nobody asked for)
- A full-blown computer vision pipeline that tracks everyone across halls, entrances, and classrooms to produce heatmaps of favorite campus detours.

-Uses security camera to log the attendance and protray it on college made map

- Simulated feed of security has been obtained of a student walking to and form it

## Technical Details

### Technologies/Components Used
- **Software**
  - **Languages**: Python 3.11
  - **Frameworks**: Streamlit (dashboard)
  - **Libraries**: Ultralytics YOLOv8, OpenCV, InsightFace, ONNXRuntime, NumPy, Pandas, Scikit-learn, Matplotlib
  - **Tools**: Virtualenv, macOS ARM64 (CPU), PyTorch CPU wheels
- **Hardware**
  - **Cameras**: Existing campus CCTV (MP4 files in `data/`)
  - **Specs**: 720p–4K video support; tested on macOS ARM64 CPU
  - **Tools required**: None beyond laptop + footage

## Implementation

### For Software

#### Installation
```bash
# From project root: /Users/navi/Documents/SNM_footage
python3.11 -m venv .venv311
source .venv311/bin/activate
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r snmimt_campus_tracker/requirements.txt
```

#### Run
```bash
# Place videos in `data/` (already done) and aerial image at `data/campus_aerial.jpg` (optional)
# Add face photos under `faces/` (see structure below)

# Process all videos and print summaries
python -m snmimt_campus_tracker

# Dashboard (if 8501 busy, pick another port)
streamlit run snmimt_campus_tracker/dashboard.py --server.port 8502
```

#### Face Recognition Setup
```
faces/
├── principal/
│   ├── principal1.jpg
│   └── principal2.jpg
└── students/
    └── student_001/
        ├── image1.jpg
        └── image2.jpg
```
- Test recognition:
```bash
python test_face_recognition.py
python debug_faces.py
```

## Project Documentation

### For Software

#### Screenshots 


#### Diagrams
- ![Workflow](Add your workflow diagram here)
  - Camera feeds → YOLOv8 detection + tracking → face recognition (InsightFace) → cross-camera correlation → attendance + analytics → Streamlit dashboard.


## Project Demo

### Video

### Additional Demos
- Provide Security Footage(entrance, halls, classrooms) with overlays and attendance logs shown.

## Team Contributions
- Navaneeth , Fresher Lonappan

- Implemented:
  - Auto-discovery of videos in `data/`
  - CPU-only YOLOv8 inference
  - InsightFace-based recognition (macOS-friendly)
  - Unique track counting, deduping, and visualization exports to `outputs/`
  - Attendance logging with identities where recognized





