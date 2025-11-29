from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import cv2
import numpy as np
import torch

# Initialize TrOCR
print("Initializing TrOCR Large...")
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-large-handwritten')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-large-handwritten')

def extract_text_from_image(image_path: str) -> str:
    """
    Extracts text using a Sliding Window approach.
    Splits image into vertical slices (lines) and feeds them to TrOCR.
    This bypasses detection failures on messy documents.
    """
    try:
        # 1. Open Image first
        image = Image.open(image_path).convert("RGB")
        
        # Preprocessing for "Hard" Prescriptions
        # 2. Convert to Grayscale
        # 3. Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # 4. Sharpen to define edges
        
        open_cv_image = np.array(image) 
        # Convert RGB to BGR 
        open_cv_image = open_cv_image[:, :, ::-1].copy() 
        
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
        
        # CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        
        # Sharpening
        kernel = np.array([[0, -1, 0], 
                           [-1, 5,-1], 
                           [0, -1, 0]])
        sharpened = cv2.filter2D(enhanced, -1, kernel)
        
        # Convert back to PIL for TrOCR
        # CRITICAL: TrOCR expects RGB (3 channels), but sharpened is Grayscale (2D).
        image = Image.fromarray(sharpened).convert("RGB")
        
        width, height = image.size
        
        # Heuristic: Prescriptions usually have lines of text.
        # We'll slice the image into horizontal strips of fixed height.
        # Overlap ensures we don't cut text in half.
        
        slice_height = 100 # Approx height of a handwriting line
        overlap = 30
        
        full_text = []
        
        y = 0
        while y < height:
            # Crop strip
            box = (0, y, width, min(y + slice_height, height))
            strip = image.crop(box)
            
            # TrOCR Inference
            pixel_values = processor(images=strip, return_tensors="pt").pixel_values
            generated_ids = model.generate(pixel_values)
            text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            if text.strip() and len(text.strip()) > 3:
                # Deduplicate: If this line is very similar to the last one (due to overlap), skip
                if not full_text or text.strip() != full_text[-1].strip():
                    print(f"DEBUG: Slice {y}: {text}")
                    full_text.append(text)
            
            y += (slice_height - overlap)
                
        return "\n".join(full_text)

    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""
