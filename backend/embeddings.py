from sentence_transformers import SentenceTransformer
import os

class EmbeddingModel:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)

    def embed(self, texts: list[str]) -> list[list[float]]:
        """
        Generates embeddings for a list of texts.
        """
        if not texts:
            return []
        embeddings = self.model.encode(texts)
        return embeddings.tolist()
