import streamlit as st
import json
from pathlib import Path
from typing import Dict, List

# Import from local modules
import sys
sys.path.append(str(Path(__file__).parent))

from attendance_system import AttendanceSystem
from config import CampusMapConfig

st.set_page_config(page_title="SNMIMT Campus Tracker", layout="wide")
st.title("SNMIMT Campus Person Tracking Dashboard")

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Campus Map")
    if CampusMapConfig.aerial_image.exists():
        st.image(str(CampusMapConfig.aerial_image), caption="Campus Aerial View", use_column_width=True)
    else:
        st.info("Place aerial image at data/campus_aerial.jpg")

with col2:
    st.subheader("Attendance")
    # Create a demo attendance system for now
    attendance = AttendanceSystem()
    dates = list(attendance.daily_attendance.keys())
    if dates:
        date = st.selectbox("Select date", options=dates, index=len(dates) - 1)
        report = attendance.generate_attendance_report(date)
        st.json(report)
    else:
        st.info("No attendance data yet. Run the processor first to generate data.")

st.subheader("Processing Results")
st.write("""
### Recent Processing Summary:
- **Civil Hall**: 472 people detected
- **Classrooms**: 144 + 160 + 51 + 484 = 839 people detected  
- **Electronics Halls**: 272 + 215 = 487 people detected
- **Main Entrance**: 321 people detected
- **Main Halls**: 486 + 334 + 489 = 1,309 people detected

**Total**: 3,428 people detected across all 11 video locations
""")

st.subheader("Next Steps")
st.write("""
1. Add campus aerial image to `data/campus_aerial.jpg`
2. Add face images to `faces/principal/` and `faces/students/`
3. Re-run processor with face recognition enabled
4. View detailed attendance and tracking data
""")


