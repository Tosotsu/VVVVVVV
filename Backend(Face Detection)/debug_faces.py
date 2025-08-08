#!/usr/bin/env python3
"""
Debug face detection and recognition
"""

import cv2
import numpy as np
from pathlib import Path
import sys
sys.path.append('snmimt_campus_tracker')

from snmimt_campus_tracker.face_recognition_system import FaceRecognitionSystem

def debug_face_recognition(video_path: str):
    """Debug face recognition step by step"""
    
    print("🔍 Debugging Face Recognition")
    print("=" * 50)
    
    # Initialize face recognition system
    face_system = FaceRecognitionSystem()
    face_system.load_known_faces("faces/")
    
    print(f"📸 Loaded {len(face_system.embeddings)} known faces:")
    for person_id in face_system.embeddings.keys():
        print(f"  - {person_id}")
    
    if not face_system.embeddings:
        print("❌ No face images found in faces/ folder!")
        return
    
    # Open video and get first frame
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print(f"❌ Could not read video: {video_path}")
        return
    
    print(f"\n📹 Processing frame from: {video_path}")
    print(f"📐 Frame shape: {frame.shape}")
    
    # Step 1: Detect faces using InsightFace
    if face_system.model is None:
        print("❌ Face recognition model not loaded")
        return
    
    faces = face_system.model.get(frame)
    print(f"👥 Found {len(faces)} faces in frame")
    
    if not faces:
        print("❌ No faces detected in frame")
        return
    
    # Step 2: Try to recognize each face
    for i, face in enumerate(faces):
        print(f"\n--- Face {i+1} ---")
        
        # Get face bounding box
        bbox = face.bbox.astype(int)
        x1, y1, x2, y2 = bbox
        print(f"📍 Face bbox: ({x1}, {y1}, {x2}, {y2})")
        
        # Try to recognize this face
        face_box = (x1, y1, x2, y2)
        match = face_system.recognize(frame, face_box)
        
        if match:
            print(f"✅ Recognized as: '{match.identity}' (confidence: {match.confidence:.2f})")
        else:
            print(f"❓ Unknown person")
            
            # Debug: show face embedding
            if hasattr(face, 'normed_embedding') and face.normed_embedding is not None:
                emb = face.normed_embedding
                print(f"🔢 Face embedding shape: {emb.shape}")
                
                # Check distances to known faces
                for person_id, ref_emb in face_system.embeddings.items():
                    dist = face_system._cosine_distance(emb, ref_emb)
                    print(f"   Distance to {person_id}: {dist:.3f} (threshold: {face_system.threshold})")
    
    # Step 3: Save visualization
    if faces:
        # Draw face detection boxes
        for i, face in enumerate(faces):
            bbox = face.bbox.astype(int)
            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            cv2.putText(frame, f"Face {i+1}", (bbox[0], bbox[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        output_path = f"debug_faces_{Path(video_path).stem}.jpg"
        cv2.imwrite(output_path, frame)
        print(f"\n📁 Debug visualization saved to: {output_path}")

if __name__ == "__main__":
    # Test with a few videos
    videos = ["data/class3.mp4", "data/mainhall3.mp4"]
    
    for video in videos:
        if Path(video).exists():
            print(f"\n🎬 Testing: {video}")
            debug_face_recognition(video)
            print("\n" + "="*50)
        else:
            print(f"❌ Video not found: {video}")
