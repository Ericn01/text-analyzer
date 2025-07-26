from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np

class TopicModeler:
    def __init__(self, nlp_model):
        self.nlp = nlp_model
    
    def _create_document_segments(self, sentences: List[str], segment_size: int = 5) -> List[Dict[str, Any]]:
        """Create overlapping segments of the document for evolution tracking."""
        segments = []
        total_sentences = len(sentences)
        
        # Create segments with overlap for smoother evolution tracking
        overlap = max(1, segment_size // 3)  # 33% overlap
        
        for i in range(0, total_sentences, segment_size - overlap):
            end_idx = min(i + segment_size, total_sentences)
            if end_idx - i >= 2:  # Ensure minimum segment size
                segment_sentences = sentences[i:end_idx]
                segments.append({
                    'sentences': segment_sentences,
                    'start_idx': i,
                    'end_idx': end_idx - 1,
                    'range': f"{i+1}-{end_idx}"
                })
            
            if end_idx >= total_sentences:
                break
        
        return segments
    
    def _calculate_topic_intensity(self, segment_sentences: List[str], topic_keywords: List[str]) -> float:
        """Calculate how strongly a topic is represented in a document segment."""
        if not segment_sentences or not topic_keywords:
            return 0.0
        
        # Process segment text
        processed_segment = []
        for sent in segment_sentences:
            sent_doc = self.nlp(sent)
            words = [token.lemma_.lower() for token in sent_doc
                    if not token.is_stop and not token.is_punct and token.is_alpha and len(token.text) > 2]
            processed_segment.extend(words)
        
        if not processed_segment:
            return 0.0
        
        # Calculate keyword presence intensity
        total_words = len(processed_segment)
        keyword_matches = 0
        
        for word in processed_segment:
            for keyword in topic_keywords:
                # Handle both single words and phrases
                if '_' in keyword:
                    # For phrases, check if all parts are present nearby
                    keyword_parts = keyword.split('_')
                    if all(part in processed_segment for part in keyword_parts):
                        keyword_matches += 1
                        break
                else:
                    if word == keyword:
                        keyword_matches += 1
                        break
        
        # Normalize intensity (0-1 scale)
        intensity = min(1.0, keyword_matches / max(1, total_words) * 10)  # Scale factor of 10
        return intensity
    
    def _track_topic_evolution(self, sentences: List[str], topics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Track how topics evolve across the document."""
        if len(sentences) < 5:  # Not enough content for meaningful evolution
            return []
        
        # Create document segments
        segments = self._create_document_segments(sentences, segment_size=max(5, len(sentences) // 4))
        
        if len(segments) < 2:  # Need at least 2 segments for evolution
            return []
        
        evolution_data = []
        
        for topic in topics:
            topic_name = topic['name']
            topic_keywords = topic['keywords']
            
            for segment in segments:
                intensity = self._calculate_topic_intensity(segment['sentences'], topic_keywords)
                
                evolution_data.append({
                    'topic': topic_name,
                    'paragraph_range': segment['range'],
                    'intensity': round(intensity, 3)
                })
        
        return evolution_data
    
    def _calculate_coherence_score(self, kmeans, tfidf_matrix, cluster_labels) -> float:
        """Calculate a more sophisticated coherence score."""
        try:
            # Silhouette-like score based on intra-cluster vs inter-cluster distances
            n_samples = tfidf_matrix.shape[0]
            n_clusters = len(set(cluster_labels))
            
            if n_clusters <= 1:
                return 0.1
            
            # Calculate average intra-cluster distance
            intra_cluster_distances = []
            for i in range(n_clusters):
                cluster_points = tfidf_matrix[cluster_labels == i]
                if cluster_points.shape[0] > 1:
                    center = kmeans.cluster_centers_[i]
                    distances = [np.linalg.norm(point.toarray() - center) for point in cluster_points]
                    intra_cluster_distances.extend(distances)
            
            avg_intra_distance = np.mean(intra_cluster_distances) if intra_cluster_distances else 1.0
            
            # Calculate average inter-cluster distance
            inter_cluster_distances = []
            centers = kmeans.cluster_centers_
            for i in range(len(centers)):
                for j in range(i + 1, len(centers)):
                    dist = np.linalg.norm(centers[i] - centers[j])
                    inter_cluster_distances.append(dist)
            
            avg_inter_distance = np.mean(inter_cluster_distances) if inter_cluster_distances else 0.1
            
            # Coherence score: higher when clusters are tight (low intra) and well-separated (high inter)
            coherence = min(0.95, max(0.1, avg_inter_distance / (avg_intra_distance + 0.01)))
            
            return round(coherence, 3)
            
        except Exception:
            # Fallback to original method
            return round(max(0.1, min(0.9, 1 - (kmeans.inertia_ / (n_samples * 1000)))), 3)

    def model_topics(self, text: str, sentences: List[str], doc) -> Dict[str, Any]:
        if len(sentences) < 2:
            return {
                "primary_topics": [],
                "topic_coherence_score": 0.0,
                "topic_evolution": []
            }

        # Process sentences
        processed_sentences = []
        for sent in sentences:
            sent_doc = self.nlp(sent)
            words = [token.lemma_.lower() for token in sent_doc
                    if not token.is_stop and not token.is_punct and token.is_alpha and len(token.text) > 2]
            if words:
                processed_sentences.append(' '.join(words))

        if not processed_sentences:
            return {"primary_topics": [], "topic_coherence_score": 0.0, "topic_evolution": []}

        # Vectorization
        vectorizer = TfidfVectorizer(max_features=50, ngram_range=(1, 2))
        try:
            tfidf_matrix = vectorizer.fit_transform(processed_sentences)
            feature_names = vectorizer.get_feature_names_out()

            # Clustering
            n_topics = min(5, max(2, len(processed_sentences) // 3))  # Allow up to 5 topics
            kmeans = KMeans(n_clusters=n_topics, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(tfidf_matrix)

            # Extract topics
            topics = []
            for i in range(n_topics):
                cluster_center = kmeans.cluster_centers_[i]
                top_indices = cluster_center.argsort()[-8:][::-1]
                topic_words = [feature_names[idx] for idx in top_indices]
                
                cluster_size = sum(1 for label in cluster_labels if label == i)
                percentage = round((cluster_size / len(sentences)) * 100, 1)
                
                # Generate more descriptive topic names
                main_keyword = topic_words[0].replace('_', ' ').title()
                topic_name = f"{main_keyword}"
                
                # Create better descriptions
                key_terms = [word.replace('_', ' ') for word in topic_words[:3]]
                description = f"This topic focuses on {', '.join(key_terms)} and related concepts."
                
                topics.append({
                    "id": f"topic_{i + 1}",
                    "name": topic_name,
                    "percentage": percentage,
                    "keywords": topic_words[:6], 
                    "description": description
                })

            # Calculate coherence score
            coherence_score = self._calculate_coherence_score(kmeans, tfidf_matrix, cluster_labels)
            
            # Track topic evolution
            topic_evolution = self._track_topic_evolution(sentences, topics)

            return {
                "primary_topics": topics,
                "topic_coherence_score": coherence_score,
                "topic_evolution": topic_evolution
            }

        except Exception as e:
            print(f"Error in topic modeling: {e}") 
            return {"primary_topics": [], "topic_coherence_score": 0.0, "topic_evolution": []}