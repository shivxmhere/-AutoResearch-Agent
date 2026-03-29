"""
RAG Tool — Simple FAISS-based retrieval with TF-IDF embeddings.

Uses scikit-learn TF-IDF + FAISS for fast in-memory vector search.
No external embedding API needed — works fully offline.
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from langchain_text_splitters import RecursiveCharacterTextSplitter

# We'll use a simple numpy-based similarity instead of FAISS
# to avoid potential FAISS installation issues.
# This is functionally equivalent for small-scale in-memory usage.


class RAGStore:
    """Simple RAG store using TF-IDF + cosine similarity."""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words="english",
            ngram_range=(1, 2),
        )
        self.chunks: list[str] = []
        self.embeddings = None
        self._is_fitted = False

    def build_index(self, documents: list[str]) -> None:
        """
        Build a searchable index from a list of documents.

        Args:
            documents: List of document texts to index.
        """
        if not documents:
            return

        # Split documents into chunks
        self.chunks = []
        for doc in documents:
            if doc and len(doc.strip()) > 50:
                splits = self.text_splitter.split_text(doc)
                self.chunks.extend(splits)

        if not self.chunks:
            return

        # Build TF-IDF matrix
        try:
            self.embeddings = self.vectorizer.fit_transform(self.chunks)
            self._is_fitted = True
        except Exception as e:
            print(f"[RAG] Error building index: {e}")
            self._is_fitted = False

    def retrieve(self, query: str, k: int = 5) -> list[str]:
        """
        Retrieve the top-k most relevant chunks for a query.

        Args:
            query: The search query.
            k: Number of top results to return.

        Returns:
            List of the most relevant text chunks.
        """
        if not self._is_fitted or not self.chunks:
            return self.chunks[:k] if self.chunks else []

        try:
            # Transform query using the fitted vectorizer
            query_vec = self.vectorizer.transform([query])

            # Compute cosine similarity
            similarities = (self.embeddings @ query_vec.T).toarray().flatten()

            # Get top-k indices
            top_k = min(k, len(self.chunks))
            top_indices = np.argsort(similarities)[-top_k:][::-1]

            # Return chunks sorted by relevance
            results = []
            for idx in top_indices:
                if similarities[idx] > 0:
                    results.append(self.chunks[idx])

            # If no results had any similarity, return first k chunks
            if not results:
                return self.chunks[:k]

            return results

        except Exception as e:
            print(f"[RAG] Error retrieving: {e}")
            return self.chunks[:k] if self.chunks else []

    def clear(self) -> None:
        """Reset the store."""
        self.chunks = []
        self.embeddings = None
        self._is_fitted = False
