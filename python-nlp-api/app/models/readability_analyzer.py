# readability_predictor.py
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
import warnings
from typing import Dict, List, Any

warnings.filterwarnings('ignore')


class ReadabilityPredictor:
    """Analyzes text complexity using Transformer embeddings."""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name)
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(self.device)
        except Exception as e:
            self.tokenizer = None
            self.model = None
            raise Exception(f"Failed to load model {model_name}: {e}")

    def _mean_pooling(self, model_output, attention_mask):
        """Apply mean pooling to get sentence embeddings."""
        token_embeddings = model_output[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

    def _chunk_text(self, text: str, max_tokens: int = 450) -> List[str]:
        """Split text into chunks preserving sentence boundaries."""
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            test_chunk = current_chunk + sentence + ". "
            tokens = self.tokenizer.encode(test_chunk, add_special_tokens=True)
            
            if len(tokens) <= max_tokens:
                current_chunk = test_chunk
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks

    def _process_chunk(self, text: str) -> float:
        """Process single text chunk and return difficulty score."""
        encoded_input = self.tokenizer(
            text, 
            padding=True, 
            truncation=True, 
            return_tensors='pt', 
            max_length=512
        ).to(self.device)

        with torch.no_grad():
            model_output = self.model(**encoded_input)

        sentence_embedding = self._mean_pooling(model_output, encoded_input['attention_mask'])
        sentence_embedding = torch.nn.functional.normalize(sentence_embedding, p=2, dim=1)
        
        # Use embedding standard deviation as complexity metric
        embedding_std = sentence_embedding.cpu().numpy().std()
        
        # Scale to 0-100 range (empirically determined thresholds)
        min_std, max_std = 0.03, 0.08
        difficulty_score = ((embedding_std - min_std) / (max_std - min_std)) * 100
        
        return max(0.0, min(100.0, difficulty_score))

    def _aggregate_scores(self, scores: List[float]) -> float:
        """Aggregate chunk scores using weighted mean."""
        if not scores:
            return 50.0
        if len(scores) == 1:
            return scores[0]
        
        # Weight later chunks more heavily
        weights = np.linspace(0.8, 1.2, len(scores))
        return np.average(scores, weights=weights)

    def _get_description(self, score: float) -> str:
        """Get difficulty description from score."""
        if score < 20:
            return "Very easy to read"
        elif score < 40:
            return "Easy to read"
        elif score < 60:
            return "Moderate difficulty"
        elif score < 80:
            return "Difficult to read"
        else:
            return "Very difficult to read"

    def predict_difficulty(self, text: str) -> Dict[str, Any]:
        """Predict readability difficulty of text."""
        if not self.model or not self.tokenizer:
            return {
                'difficulty_score': 50.0,
                'description': 'Model unavailable',
                'method': 'Fallback',
                'chunks_processed': 0
            }

        if not text.strip():
            return {
                'difficulty_score': 0.0,
                'description': 'Empty text',
                'method': 'Empty',
                'chunks_processed': 0
            }

        # Determine if chunking is needed
        tokens = self.tokenizer.encode(text, add_special_tokens=True)
        
        if len(tokens) <= 512:
            scores = [self._process_chunk(text)]
        else:
            chunks = self._chunk_text(text)
            scores = [self._process_chunk(chunk) for chunk in chunks if chunk.strip()]

        final_score = self._aggregate_scores(scores)

        return {
            'difficulty_score': round(final_score, 2),
            'description': self._get_description(final_score),
            'method': f'Transformer ({self.model_name})',
            'chunks_processed': len(scores)
        }