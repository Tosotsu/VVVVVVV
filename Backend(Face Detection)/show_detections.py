#!/usr/bin/env python3
"""
Simple script to show YOLO detections on a sample frame
"""

import cv2
import numpy as np
from pathlib import Path

try:
    from ultralytics import YOLO
except ImportError:
    print("Please install ultralytics: pip install ultralytics")
    exit(1)

def show_detections(video_path: str, output_path: str = "detection_sample.jpg"):
    """Show detections on first frame of video"""
    
    # Load YOLO model
    model = YOLO("yolov8n.pt")
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print(f"Could not read video: {video_path}")
        return
    
    print(f"Processing frame from: {video_path}")
    print(f"Frame shape: {frame.shape}")
    
    # Run detection
    results = model.predict(frame, conf=0.5, verbose=False)
    
    # Draw detections
    annotated_frame = results[0].plot()
    
    # Save result
    cv2.imwrite(output_path, annotated_frame)
    print(f"Detection visualization saved to: {output_path}")
    
    # Count people
    person_count = 0
    for r in results:
        if r.boxes is not None:
            for b in r.boxes:
                cls_id = int(b.cls.item()) if hasattr(b.cls, "item") else int(b.cls)
                if cls_id == 0:  # person class
                    person_count += 1
    
    print(f"People detected: {person_count}")
    
    return annotated_frame

if __name__ == "__main__":
    # Test with a few videos
    videos = ["data/class3.mp4", "data/mainhall3.mp4"]
    
    for video in videos:
        if Path(video).exists():
            output = f"detection_{Path(video).stem}.jpg"
            show_detections(video, output)
            print("-" * 50)
        else:
            print(f"Video not found: {video}")
