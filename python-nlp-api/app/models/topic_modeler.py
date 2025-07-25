from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

class TopicModeler:
    def __init__(self, nlp_model):
        self.nlp = nlp_model

    def model_topics(self, text: str, sentences: List[str], doc) -> Dict[str, Any]:
        if len(sentences) < 2:
            return {
                "primary_topics": [],
                "topic_coherence_score": 0.0,
                "topic_evolution": []
            }
        
        processed_sentences = []
        for sent in sentences:
            sent_doc = self.nlp(sent)
            words = [token.lemma_.lower() for token in sent_doc 
                    if not token.is_stop and not token.is_punct and token.is_alpha and len(token.text) > 2]
            if words:
                processed_sentences.append(' '.join(words))
        
        if not processed_sentences:
            return {"primary_topics": [], "topic_coherence_score": 0.0, "topic_evolution": []}
        
        vectorizer = TfidfVectorizer(max_features=50, ngram_range=(1, 2))
        try:
            tfidf_matrix = vectorizer.fit_transform(processed_sentences)
            feature_names = vectorizer.get_feature_names_out()
            
            n_topics = min(3, max(1, len(processed_sentences) // 2))
            kmeans = KMeans(n_clusters=n_topics, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(tfidf_matrix)
            
            topics = []
            for i in range(n_topics):
                cluster_center = kmeans.cluster_centers_[i]
                top_indices = cluster_center.argsort()[-8:][::-1]
                topic_words = [feature_names[idx] for idx in top_indices]
                
                cluster_size = sum(1 for label in cluster_labels if label == i)
                percentage = round((cluster_size / len(sentences)) * 100, 1)
                
                topics.append({
                    "id": f"topic_{i + 1}",
                    "name": f"Topic {i + 1}: {topic_words[0].replace('_', ' ').title()}",
                    "percentage": percentage,
                    "keywords": topic_words[:5],
                    "description": f"Topic covering: {', '.join(topic_words[:3])}"
                })
            
            return {
                "primary_topics": topics,
                "topic_coherence_score": round(max(0.1, min(0.9, 1 - (kmeans.inertia_ / (len(sentences) * 1000)))), 3),
                "topic_evolution": []
            }
            
        except Exception:
            return {"primary_topics": [], "topic_coherence_score": 0.0, "topic_evolution": []}