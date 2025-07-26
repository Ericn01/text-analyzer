import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
import warnings
from typing import Dict, List, Any, Optional

warnings.filterwarnings('ignore')

class ReadabilityPredictor:
    """Analyzes text complexity using Transformer embeddings combined with traditional readability metrics."""
    
    def __init__(self, model_name: str = "sentence-transformers/paraphrase-MiniLM-L6-v2"):
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

    def _extract_embedding_features(self, text: str) -> Dict[str, float]:
        """Extract various features from text embeddings."""
        encoded_input = self.tokenizer(
            text, 
            padding=True, 
            truncation=True, 
            return_tensors='pt', 
            max_length=512
        ).to(self.device)

        with torch.no_grad():
            model_output = self.model(**encoded_input)

        # Get sentence embedding
        sentence_embedding = self._mean_pooling(model_output, encoded_input['attention_mask'])
        sentence_embedding = torch.nn.functional.normalize(sentence_embedding, p=2, dim=1)
        
        # Get token-level embeddings for more detailed analysis
        token_embeddings = model_output[0].cpu().numpy().squeeze()
        sentence_emb_np = sentence_embedding.cpu().numpy().squeeze()
        
        # Calculate various complexity features
        features = {
            'embedding_std': sentence_emb_np.std(),
            'embedding_mean_magnitude': np.linalg.norm(sentence_emb_np),
            'token_embedding_variance': np.var(token_embeddings, axis=0).mean(),
            'embedding_entropy': self._calculate_entropy(sentence_emb_np),
            'token_similarity_variance': self._calculate_token_similarity_variance(token_embeddings)
        }
        
        return features

    def _calculate_entropy(self, embedding: np.ndarray) -> float:
        """Calculate entropy of embedding as a complexity measure."""
        # Discretize embedding values for entropy calculation
        hist, _ = np.histogram(embedding, bins=50, density=True)
        hist = hist[hist > 0]  # Remove zero bins
        return -np.sum(hist * np.log2(hist + 1e-10))

    def _calculate_token_similarity_variance(self, token_embeddings: np.ndarray) -> float:
        """Calculate variance in token similarity as complexity measure."""
        if len(token_embeddings) < 2:
            return 0.0
        
        # Calculate pairwise cosine similarities
        similarities = []
        for i in range(len(token_embeddings) - 1):
            for j in range(i + 1, min(i + 10, len(token_embeddings))):  # Limit comparisons for efficiency
                sim = np.dot(token_embeddings[i], token_embeddings[j]) / (
                    np.linalg.norm(token_embeddings[i]) * np.linalg.norm(token_embeddings[j]) + 1e-10
                )
                similarities.append(sim)
        
        return np.var(similarities) if similarities else 0.0

    def _normalize_metric_score(self, score: float, metric_name: str) -> float:
        """Normalize traditional readability scores to 0-100 scale."""
        if metric_name == 'flesch_reading_ease':
            # Flesch Reading Ease: 0-100 (higher = easier, we want higher = harder)
            return 100 - max(0, min(100, score))
        
        elif metric_name == 'flesch_kincaid_grade':
            # FK Grade: typically 0-18+ (higher = harder)
            return min(100, max(0, (score / 18.0) * 100))
        
        elif metric_name == 'smog_index':
            # SMOG: typically 6-20+ (higher = harder)
            normalized = ((score - 6) / 14.0) * 100
            return min(100, max(0, normalized))
        
        elif metric_name == 'automated_readability_index':
            # ARI: typically 0-20+ (higher = harder)
            return min(100, max(0, (score / 20.0) * 100))
        
        elif metric_name == 'dale_chall_formula':
            # Dale-Chall: typically 1-16+ (higher = harder)
            normalized = ((score - 1) / 15.0) * 100
            return min(100, max(0, normalized))
        
        else:
            # Default: assume 0-100 scale
            return max(0, min(100, score))

    def _combine_features(self, embedding_features: Dict[str, float], 
                            readability_metrics: Optional[Dict[str, Any]] = None) -> float:
        """Combine embedding features with traditional readability metrics."""
        
        # Normalize embedding features to 0-100 scale
        embedding_score = 0.0
        feature_weights = {
            'embedding_std': 0.2,
            'embedding_mean_magnitude': 0.15,  
            'token_embedding_variance': 0.25,
            'embedding_entropy': 0.2,
            'token_similarity_variance': 0.2
        }
        
        # Normalize each embedding feature
        normalized_features = {}
        
        # Empirically determined ranges for normalization
        feature_ranges = {
            'embedding_std': (0.02, 0.12),
            'embedding_mean_magnitude': (0.8, 1.2),
            'token_embedding_variance': (0.001, 0.02),
            'embedding_entropy': (3.0, 6.0),
            'token_similarity_variance': (0.001, 0.1)
        }
        
        for feature, value in embedding_features.items():
            if feature in feature_ranges:
                min_val, max_val = feature_ranges[feature]
                normalized = ((value - min_val) / (max_val - min_val)) * 100
                normalized_features[feature] = max(0, min(100, normalized))
            else:
                normalized_features[feature] = 50.0  # Default middle value
        
        # Calculate weighted embedding score
        for feature, weight in feature_weights.items():
            embedding_score += normalized_features.get(feature, 50.0) * weight
        
        # If no traditional metrics provided, rely solely on embeddings
        if not readability_metrics:
            return embedding_score
        
        # Combine with traditional readability metrics
        traditional_scores = []
        traditional_weights = []
        
        metrics_to_use = [
            'flesch_reading_ease', 'flesch_kincaid_grade', 'smog_index',
            'automated_readability_index', 'dale_chall_formula'
        ]
        
        for metric_name in metrics_to_use:
            if metric_name in readability_metrics:
                metric_data = readability_metrics[metric_name]
                if isinstance(metric_data, dict) and 'score' in metric_data:
                    normalized_score = self._normalize_metric_score(metric_data['score'], metric_name)
                    traditional_scores.append(normalized_score)
                    traditional_weights.append(1.0)
        
        if traditional_scores:
            # Weight traditional metrics vs embedding features
            traditional_weight = 0.7  # 70% traditional metrics
            embedding_weight = 0.3    # 30% embedding features
            
            traditional_avg = np.average(traditional_scores, weights=traditional_weights)
            final_score = (traditional_weight * traditional_avg) + (embedding_weight * embedding_score)
        else:
            final_score = embedding_score
        
        return final_score

    def _get_description(self, score: float) -> str:
        """Get difficulty description from score."""
        if score < 15:
            return "Very easy to read (elementary school level)"
        elif score < 30:
            return "Easy to read (middle school level)"
        elif score < 50:
            return "Moderate difficulty (high school level)"
        elif score < 70:
            return "Difficult to read (college level)"
        elif score < 85:
            return "Very difficult (graduate level)"
        else:
            return "Extremely difficult (academic/professional)"

    def predict_difficulty(self, text: str, readability_metrics: Optional[Dict[str, int]] = None) -> Dict[str, Any]:
        """
        Predict readability difficulty of text using both embeddings and traditional metrics.
        
        Args:
            text: Input text to analyze
            readability_metrics: Optional dictionary containing traditional readability metrics
                                Format should match ReadabilityMetrics interface
        
        Returns:
            Dictionary with difficulty score, description, and processing details
        """
        if not self.model or not self.tokenizer:
            return {
                'difficulty_score': 50.0,
                'description': 'Model unavailable - using fallback',
                'method': 'Fallback',
            }

        if not text.strip():
            return {
                'difficulty_score': 0.0,
                'description': 'Empty text',
                'method': 'Empty',
            }

        # Determine if chunking is needed
        tokens = self.tokenizer.encode(text, add_special_tokens=True)
        
        if len(tokens) <= 512:
            embedding_features = self._extract_embedding_features(text)
            chunk_scores = [self._combine_features(embedding_features, readability_metrics)]
        else:
            chunks = self._chunk_text(text)
            chunk_scores = []
            for chunk in chunks:
                if chunk.strip():
                    embedding_features = self._extract_embedding_features(chunk)
                    score = self._combine_features(embedding_features, readability_metrics)
                    chunk_scores.append(score)

        # Aggregate scores with slight preference for later chunks (conclusion bias)
        if chunk_scores:
            if len(chunk_scores) == 1:
                final_score = chunk_scores[0]
            else:
                weights = np.linspace(0.9, 1.1, len(chunk_scores))
                final_score = np.average(chunk_scores, weights=weights)
        else:
            final_score = 50.0

        # Determine which features were used
        features_used = ['transformer_embeddings']
        if readability_metrics:
            features_used.extend([k for k in readability_metrics.keys() 
                                if k in ['flesch_reading_ease', 'flesch_kincaid_grade', 
                                    'smog_index', 'automated_readability_index', 'dale_chall_formula']])

        return {
            'difficulty_score': round(final_score, 2),
            'description': self._get_description(final_score),
            'method': f'Enhanced Transformer + Traditional Metrics ({self.model_name})',
        }