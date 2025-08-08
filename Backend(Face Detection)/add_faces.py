#!/usr/bin/env python3
"""
Helper script to add face photos for recognition
"""

import shutil
from pathlib import Path

def setup_face_database():
    """Create face database structure and guide user"""
    
    # Create directories
    faces_dir = Path("faces")
    principal_dir = faces_dir / "principal"
    students_dir = faces_dir / "students"
    
    principal_dir.mkdir(parents=True, exist_ok=True)
    students_dir.mkdir(parents=True, exist_ok=True)
    
    print("🎯 Face Recognition Database Setup")
    print("=" * 50)
    print()
    print("📁 Created directories:")
    print(f"  - {principal_dir}")
    print(f"  - {students_dir}")
    print()
    print("📸 Add photos to recognize people:")
    print()
    print("For Principal:")
    print(f"  Place photos in: {principal_dir}/")
    print("  Example: principal1.jpg, principal2.jpg")
    print()
    print("For Students:")
    print(f"  Create folders like: {students_dir}/student_001/")
    print("  Place photos in each student folder")
    print("  Example: student_001/photo1.jpg, student_001/photo2.jpg")
    print()
    print("📋 Photo Requirements:")
    print("  ✅ Clear, frontal face photos")
    print("  ✅ Good lighting")
    print("  ✅ Multiple photos per person")
    print("  ✅ JPG or PNG format")
    print()
    print("🔍 After adding photos, run:")
    print("  python test_face_recognition.py")
    print()
    
    # Check if any photos exist
    existing_photos = list(faces_dir.rglob("*.jpg")) + list(faces_dir.rglob("*.png"))
    if existing_photos:
        print("📸 Found existing photos:")
        for photo in existing_photos:
            print(f"  - {photo}")
    else:
        print("⚠️  No photos found yet. Add some photos and run this script again.")

if __name__ == "__main__":
    setup_face_database()
