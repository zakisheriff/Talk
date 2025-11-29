import requests
import os
import sys

MODELS = {
    "inswapper_128.onnx": "https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx",
    # Using a generic face analysis model for WAN if specific WAN 2.1 not found easily publicly
    # For now, let's assume we can use 'buffalo_l' from insightface which contains analysis models
}

MODEL_DIR = "models"

def download_file(url, filename):
    path = os.path.join(MODEL_DIR, filename)
    if os.path.exists(path):
        print(f"{filename} already exists.")
        return

    print(f"Downloading {filename}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded {filename}.")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")

if __name__ == "__main__":
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
    
    download_file(MODELS["inswapper_128.onnx"], "inswapper_128.onnx")
