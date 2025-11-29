# <div align="center">Talk</div>

<div align="center">
<strong>100% Local, AI-Powered Chat & Face Fusion Platform</strong>
</div>

<br />

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

<a href="#">
<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" height="50" />
</a>

<br />
<br />

**[🚀 Local AI Powerhouse running on Apple Silicon]**

</div>

<br />

> **"Privacy-first AI that lives on your Mac."**
>
> Talk isn't just a chatbot; it's a complete local AI suite.  
> Powered by Llama 3, InsightFace, and GFPGAN, it brings state-of-the-art LLM chat and Face Manipulation tools directly to your desktop, offline and secure.

---

## 🌟 Vision

Talk's mission is to be:

- **A completely local AI platform** — no data leaves your device
- **A multi-modal powerhouse** — Text, Images, PDFs, and Face Swapping
- **A beautiful, modern web application** — Apple-inspired "Liquid Glass" design

---

## ✨ Why Talk?

Most AI tools require cloud subscriptions and sacrifice privacy.  
Talk democratizes AI by running **Llama 3 (Chat)** and **FaceFusion (Deepfakes)** entirely on your M1/M2/M3 Mac with Metal acceleration.

---

## 🎨 Apple-Inspired "Liquid Glass" Design

- **Minimalist Aesthetics**  
  Pure CSS implementation following Apple's design principles — no frameworks, just elegance.

- **Liquid Glass Effects**  
  Translucent overlays with `backdrop-filter: blur()` create depth and focus.

- **Soft Elevation**  
  Subtle shadows and smooth transitions provide a premium feel.

- **System Fonts**  
  Native `-apple-system` typography for maximum legibility and native feel.

---

## 🤖 AI-Powered Intelligence

- **Local Llama 3 Chat**  
  Run Meta's latest 8B model locally with `llama.cpp` and Metal acceleration.

- **RAG Pipeline**  
  Chat with your PDF documents and images using FAISS vector search and OCR.

- **Face Lab (Face Swap)**  
  Swap faces in Images and Videos using `inswapper_128` and `insightface`.

- **High-Definition Restoration**  
  Automatically upscale and restore swapped faces to 1080p quality using **GFPGAN**.

- **WAN Analysis**  
  Deep facial analysis to detect age, gender, and pose.

---

## 📁 Project Structure

```
Talk/
├── backend/                      # FastAPI Python Server
│   ├── app.py                    # Main entry point
│   ├── model_runner.py           # Llama 3 Wrapper (llama-cpp-python)
│   ├── embeddings.py             # SentenceTransformers
│   ├── vectordb.py               # FAISS Vector Database
│   ├── facefusion/               # Face Swap Logic
│   │   └── fusion.py             # InsightFace + GFPGAN Wrapper
│   ├── routers/                  # API Routes
│   │   └── face_router.py        # Face Swap & Analysis Endpoints
│   └── models/                   # Local Model Weights (.gguf, .onnx, .pth)
│
└── frontend/                     # React + Vite SPA
    ├── src/
    │   ├── App.jsx               # Main Layout
    │   ├── Chat.jsx              # Chat Interface (Streaming)
    │   ├── FaceLab.jsx           # Face Swap UI (Image/Video)
    │   ├── WanAnalysis.jsx       # Face Analysis UI
    │   ├── Sidebar.jsx           # Navigation
    │   └── styles.css            # Pure CSS (Apple-inspired)
    └── index.html
```

---

## 🚀 Quick Start

### Prerequisites

- **Mac with Apple Silicon** (M1/M2/M3)
- **Node.js** (v18+)
- **Python** (3.10+)

### 1. Clone the Repository

```bash
git clone https://github.com/zakisheriff/Talk.git
cd Talk
```

### 2. Install Dependencies

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 3. Download Models

The system requires several large model files (~4GB total).
Run the setup script or download manually to `backend/models/`:
- `Meta-Llama-3-8B-Instruct-Q4_K_M.gguf`
- `inswapper_128.onnx`
- `GFPGANv1.4.pth`

### 4. Run the Application

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 🔧 Tech Stack

### Backend
- **FastAPI** — High-performance Async API
- **Llama.cpp** — Local LLM inference
- **InsightFace** — State-of-the-art Face Analysis/Swapping
- **GFPGAN** — Face Restoration & Upscaling
- **FAISS** — Vector Similarity Search
- **PyMuPDF & Tesseract** — Document Processing

### Frontend
- **React.js** — Modern UI framework
- **Vite** — Lightning-fast build tool
- **Lucide React** — Beautiful icons
- **Pure CSS** — No frameworks, Apple-inspired design

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License — 100% Free and Open Source

---

<p align="center">
Made by <strong>Zaki Sheriff</strong>
</p>

<p align="center">
<em>Privacy-first AI for everyone.</em>
</p>
