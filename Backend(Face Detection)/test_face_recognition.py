#!/usr/bin/env python3
"""
Test face recognition on video frames
"""

import cv2
import numpy as np
from pathlib import Path
import sys
sys.path.append('snmimt_campus_tracker')

from snmimt_campus_tracker.face_recognition_system import FaceRecognitionSystem

def test_face_recognition(video_path: str):
    """Test face recognition on first frame of video"""
    
    # Initialize face recognition system
    face_system = FaceRecognitionSystem()
    face_system.load_known_faces("faces/")
    
    print(f"Loaded {len(face_system.embeddings)} known faces:")
    for person_id in face_system.embeddings.keys():
        print(f"  - {person_id}")
    
    if not face_system.embeddings:
        print("\n⚠️  No face images found in faces/ folder!")
        print("Add photos to:")
        print("  faces/principal/ - for principal")
        print("  faces/students/student_XXX/ - for students")
        return
    
    # Open video and get first frame
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print(f"Could not read video: {video_path}")
        return
    
    print(f"\nProcessing frame from: {video_path}")
    print(f"Frame shape: {frame.shape}")
    
    # Detect faces in the frame
    if face_system.model is None:
        print("Face recognition model not loaded")
        return
    
    faces = face_system.model.get(frame)
    print(f"Found {len(faces)} faces in frame")
    
    # Try to recognize each face
    for i, face in enumerate(faces):
        # Get face bounding box
        bbox = face.bbox.astype(int)
        x1, y1, x2, y2 = bbox
        
        # Try to recognize this face
        face_box = (x1, y1, x2, y2)
        match = face_system.recognize(frame, face_box)
        
        if match:
            print(f"  Face {i+1}: Recognized as '{match.identity}' (confidence: {match.confidence:.2f})")
        else:
            print(f"  Face {i+1}: Unknown person")
    
    # Save frame with face detection boxes
    if faces:
        # Draw face detection boxes
        for face in faces:
            bbox = face.bbox.astype(int)
            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        
        output_path = f"face_detection_{Path(video_path).stem}.jpg"
        cv2.imwrite(output_path, frame)
        print(f"\nFace detection visualization saved to: {output_path}")

if __name__ == "__main__":
    # Test with a video
    test_video = "data/class3.mp4"
    if Path(test_video).exists():
        test_face_recognition(test_video)
    else:
        print(f"Test video not found: {test_video}")
        print("Available videos:")
        for v in Path("data").glob("*.mp4"):
            print(f"  - {v}")
