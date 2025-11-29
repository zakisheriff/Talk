from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import shutil
import os
import uuid

from model_runner import ModelRunner
from embeddings import EmbeddingModel
from vectordb import VectorDB
from pdf_utils import extract_text_from_pdf
from ocr_utils import extract_text_from_image
from chunker import chunk_text

from routers import face_router
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.include_router(face_router.router, prefix="/face", tags=["face"])

# Initialize components
model_runner = ModelRunner()
embedding_model = EmbeddingModel()
vector_db = VectorDB()

os.makedirs("uploads", exist_ok=True)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "Talk Backend is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_ext = file.filename.split(".")[-1].lower()
    file_path = f"uploads/{file_id}.{file_ext}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    text = ""
    if file_ext == "pdf":
        text = extract_text_from_pdf(file_path)
    elif file_ext in ["png", "jpg", "jpeg"]:
        text = extract_text_from_image(file_path)
    else:
        return {"error": "Unsupported file type"}
        
    if not text:
        return {"message": "No text extracted or empty file."}
        
    chunks = chunk_text(text)
    embeddings = embedding_model.embed(chunks)
    
    metadatas = [{"text": chunk, "source": file.filename} for chunk in chunks]
    vector_db.add(embeddings, metadatas)
    
    return {"message": f"Processed {len(chunks)} chunks from {file.filename}"}

@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message
    
    # RAG: Search for relevant context
    query_embedding = embedding_model.embed([user_message])[0]
    results = vector_db.search(query_embedding, k=3)
    
    context = "\n".join([f"- {res['text']}" for res in results])
    
    # Construct Prompt
    # Construct Prompt (Llama 3 Format)
    # <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user_message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n
    
    system_prompt = "You are a helpful AI assistant. Use the provided context to answer the user's question. If the context is not relevant, answer generally. Keep your answers concise and conversational."
    
    prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}\n\nContext:\n{context}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user_message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
    
    # Generate Streaming Response
    return StreamingResponse(
        model_runner.stream_generate(prompt), 
        media_type="text/plain"
    )
