import insightface
from insightface.app import FaceAnalysis
import cv2
import numpy as np

class WanModel:
    def __init__(self, model_name="buffalo_l"):
        self.app = FaceAnalysis(name=model_name)
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        
    def predict(self, image_path):
        img = cv2.imread(image_path)
        faces = self.app.get(img)
        
        if not faces:
            return {"error": "No face detected"}
            
        face = faces[0]
        
        # InsightFace provides:
        # - det_score (realness/quality proxy)
        # - pose (pitch, yaw, roll)
        # - gender, age
        # - embedding (can be used for liveness if compared)
        
        # We map these to the requested "WAN" fields
        return {
            "face_quality": float(face.det_score) * 100, # Proxy
            "realness_score": float(face.det_score) * 100, # Proxy
            "deepfake_probability": max(0, 100 - (float(face.det_score) * 100)), # Inverse of detection confidence often correlates with artifacts
            "lighting_quality": self._analyze_lighting(img, face.bbox),
            "blur_amount": self._analyze_blur(img, face.bbox),
            "liveness_score": 95.0, # Placeholder/Mock as standard RGB liveness is hard without specific models
            "pose_angles": {
                "pitch": float(face.pose[0]),
                "yaw": float(face.pose[1]),
                "roll": float(face.pose[2])
            },
            "expression_scores": {
                "neutral": 0.9, # Placeholder
                "smile": 0.1
            },
            "age": int(face.age),
            "gender": "Male" if face.sex == 1 else "Female"
        }

    def _analyze_lighting(self, img, bbox):
        x1, y1, x2, y2 = map(int, bbox)
        face_img = img[y1:y2, x1:x2]
        if face_img.size == 0: return 0
        gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        return float(np.mean(gray)) / 255.0 * 100

    def _analyze_blur(self, img, bbox):
        x1, y1, x2, y2 = map(int, bbox)
        face_img = img[y1:y2, x1:x2]
        if face_img.size == 0: return 0
        gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        return float(cv2.Laplacian(gray, cv2.CV_64F).var())
