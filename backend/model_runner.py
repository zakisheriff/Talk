from llama_cpp import Llama
import os
import glob

class ModelRunner:
    def __init__(self, model_dir: str = "models", n_ctx: int = 2048):
        self.model_dir = model_dir
        self.n_ctx = n_ctx
        self.llm = None
        self.load_model()

    def load_model(self):
        """
        Loads the first .gguf model found in the models directory.
        """
        models = glob.glob(os.path.join(self.model_dir, "*.gguf"))
        if not models:
            print(f"No .gguf models found in {self.model_dir}")
            return
        
        model_path = models[0]
        print(f"Loading model: {model_path}")
        
        try:
            # Initialize Llama model with Metal (MPS) support if available (n_gpu_layers=-1)
            # On M1, this should automatically use Metal if compiled with -DGGML_METAL=on
            self.llm = Llama(
                model_path=model_path,
                n_ctx=self.n_ctx,
                n_gpu_layers=-1, # Offload all layers to GPU (Metal)
                verbose=True
            )
        except Exception as e:
            print(f"Failed to load Llama model: {e}")
            self.llm = None

    def generate(self, prompt: str, max_tokens: int = 512, stop: list = None) -> str:
        """
        Generates text based on the prompt.
        """
        if not self.llm:
            return "Error: No model loaded. Please check backend/models/ directory."
            
        output = self.llm(
            prompt,
            max_tokens=max_tokens,
            stop=stop or ["User:", "\nUser", "<|eot_id|>"],
            echo=False
        )
        
        return output['choices'][0]['text'].strip()

    def stream_generate(self, prompt: str, max_tokens: int = 512, stop: list = None):
        """
        Generates text stream.
        """
        if not self.llm:
            yield "Error: No model loaded."
            return

        stream = self.llm(
            prompt,
            max_tokens=max_tokens,
            stop=stop or ["User:", "\nUser", "<|eot_id|>"],
            stream=True,
            echo=False
        )
        
        for output in stream:
            yield output['choices'][0]['text']
