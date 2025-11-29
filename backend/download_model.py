import requests
import os
import sys

MODEL_URL = "https://huggingface.co/lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "Meta-Llama-3-8B-Instruct-Q4_K_M.gguf")

def download_model():
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    if os.path.exists(MODEL_PATH):
        print(f"Model already exists at {MODEL_PATH}")
        return

    print(f"Downloading model from {MODEL_URL}...")
    print("This may take a while (approx 4.6 GB)...")
    
    try:
        response = requests.get(MODEL_URL, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024 * 1024 # 1MB
        
        with open(MODEL_PATH, "wb") as f:
            downloaded = 0
            for data in response.iter_content(block_size):
                f.write(data)
                downloaded += len(data)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    sys.stdout.write(f"\rDownloaded: {percent:.2f}% ({downloaded / (1024*1024):.2f} MB)")
                    sys.stdout.flush()
                    
        print("\nDownload complete!")
        
    except Exception as e:
        print(f"\nError downloading model: {e}")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)

if __name__ == "__main__":
    download_model()
