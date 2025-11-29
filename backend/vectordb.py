import faiss
import numpy as np
import pickle
import os

class VectorDB:
    def __init__(self, dimension: int = 384, index_path: str = "data/faiss_index.bin", metadata_path: str = "data/metadata.pkl"):
        self.dimension = dimension
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.metadata = []  # List of dicts: [{"text": "...", "source": "..."}]
        
        if os.path.exists(index_path) and os.path.exists(metadata_path):
            self.index = faiss.read_index(index_path)
            with open(metadata_path, "rb") as f:
                self.metadata = pickle.load(f)
        else:
            self.index = faiss.IndexFlatL2(dimension)

    def add(self, embeddings: list[list[float]], metadatas: list[dict]):
        """
        Adds embeddings and metadata to the index.
        """
        if not embeddings:
            return
        
        vectors = np.array(embeddings).astype('float32')
        self.index.add(vectors)
        self.metadata.extend(metadatas)
        self.save()

    def search(self, query_vector: list[float], k: int = 5, threshold: float = 1.5) -> list[dict]:
        """
        Searches for the k nearest neighbors.
        Returns only results with distance < threshold.
        """
        if self.index.ntotal == 0:
            return []
            
        vector = np.array([query_vector]).astype('float32')
        distances, indices = self.index.search(vector, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            dist = distances[0][i]
            if idx != -1 and idx < len(self.metadata):
                # Only include if distance is low enough (relevant)
                if dist < threshold:
                    results.append(self.metadata[idx])
                
        return results

    def save(self):
        """
        Saves the index and metadata to disk.
        """
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "wb") as f:
            pickle.dump(self.metadata, f)
