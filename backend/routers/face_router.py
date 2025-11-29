from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from facefusion.fusion import fusion
from wan.wan_model import WanModel

router = APIRouter()

os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

wan_model = WanModel()

@router.post("/swap")
async def swap_faces(source: UploadFile = File(...), target: UploadFile = File(...)):
    source_id = str(uuid.uuid4())
    target_id = str(uuid.uuid4())
    
    source_path = f"uploads/{source_id}_{source.filename}"
    target_path = f"uploads/{target_id}_{target.filename}"
    try:
        # Determine if target is video or image
        target_ext = target.filename.split('.')[-1].lower()
        is_video = target_ext in ['mp4', 'mov', 'avi', 'mkv']
        
        if is_video:
            output_path = f"outputs/{target_id}_swapped.mp4"
            result_path = fusion.swap_video(source_path, target_path, output_path)
        else:
            output_path = f"outputs/{target_id}_swapped.jpg"
            result_path = fusion.swap_face(source_path, target_path, output_path)
            
        return {"output_path": result_path, "message": "Face swap successful"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/analyze")
async def analyze_face(image: UploadFile = File(...)):
    image_id = str(uuid.uuid4())
    image_path = f"uploads/{image_id}_{image.filename}"
    
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    try:
        result = wan_model.predict(image_path)
        return {"analysis": result}
    except Exception as e:
        return {"error": str(e)}
