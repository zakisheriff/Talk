from llama_cpp import Llama
import os

class ModelRunner:
    def __init__(self, model_path: str = "models/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf"):
        self.model_path = model_path
        self.llm = None
        self.load_model()

    def load_model(self):
        """
        Loads the Llama 3 model.
        """
        if not os.path.exists(self.model_path):
            print(f"Model not found at {self.model_path}")
            return

        print(f"Loading Llama 3 Model from {self.model_path}...")
        
        try:
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=2048,  # Context window
                n_gpu_layers=-1,  # Offload all to GPU (Metal)
                verbose=True
            )
            print("Llama 3 Model loaded successfully!")
        except Exception as e:
            print(f"Failed to load model: {e}")

    def stream_chat(self, messages: list, max_tokens: int = 512):
        """
        Generates chat stream using native chat template.
        """
        if not self.llm:
            yield "Error: No model loaded."
            return

        stream = self.llm.create_chat_completion(
            messages=messages,
            max_tokens=max_tokens,
            stream=True
        )
        
        for output in stream:
            delta = output['choices'][0]['delta']
            if 'content' in delta:
                yield delta['content']
