import re
import statistics
from typing import List, Dict, Any, Tuple
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import warnings
warnings.filterwarnings('ignore')

class SentimentAnalyzer:
    # Class constants
    SENTIMENT_THRESHOLDS = {'positive': 0.05, 'negative': -0.05}
    MODEL_WEIGHTS = {'two_models': [0.5, 0.5], 'three_models': [0.3, 0.4, 0.3]}

    def __init__(self, emotion_model="j-hartmann/emotion-english-distilroberta-base"):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.emotion_model = emotion_model
        self._initialize_pipelines()

        self.emotion_words = {
            'joy': {'happy', 'joy', 'excited', 'cheerful', 'delighted', 'elated', 'jubilant', 'pleased', 'glad', 'content', 'ecstatic', 'thrilled', 'blissful', 'euphoric', 'overjoyed'},
            'anger': {'angry', 'mad', 'furious', 'rage', 'annoyed', 'irritated', 'upset', 'frustrated', 'outraged', 'livid', 'irate', 'enraged', 'incensed', 'wrathful', 'indignant'},
            'fear': {'afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'fearful', 'alarmed', 'dread', 'apprehensive', 'petrified', 'horrified', 'intimidated', 'uneasy'},
            'sadness': {'sad', 'depressed', 'miserable', 'gloomy', 'melancholy', 'grief', 'sorrow', 'despair', 'dejected', 'blue', 'heartbroken', 'mournful', 'despondent', 'forlorn', 'downcast'},
            'surprise': {'surprised', 'amazed', 'shocked', 'astonished', 'stunned', 'bewildered', 'startled', 'astounded', 'flabbergasted', 'dumbfounded', 'taken aback', 'speechless'},
            'disgust': {'disgusted', 'revolted', 'repulsed', 'sick', 'nauseated', 'appalled', 'repugnant', 'loathe', 'abhor', 'detest', 'repelled', 'sickened', 'offended'}
        }
        
    def _initialize_pipelines(self):
        """Initialize transformer pipelines with error handling."""
        try:
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis", 
                model="distilbert-base-uncased-finetuned-sst-2-english",
                tokenizer="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1
            )
            self.emotion_classifier = pipeline(
                "text-classification", 
                model=self.emotion_model            
            )
        except Exception as e:
            print(f"Warning: Could not load transformer models: {e}")
            self.sentiment_pipeline = None
            self.emotion_classifier = None

    def analyze_sentiment(self, text: str, doc, sentences: List[str]) -> Dict[str, Any]:
        """Enhanced sentiment analysis using multiple models."""
        # Get base sentiment scores
        textblob_score, textblob_subjectivity = self._get_textblob_sentiment(text)
        vader_score = self._get_vader_sentiment(text)
        transformer_score, transformer_confidence = self._get_transformer_sentiment(text)
        
        # Get emotional tone
        emotional_tone = self._get_emotional_tone(doc)
        
        # Calculate ensemble sentiment
        overall_score, final_confidence = self._calculate_ensemble_sentiment(
            textblob_score, vader_score, transformer_score, 
            textblob_subjectivity, transformer_confidence
        )
        
        # Analyze individual sentences
        sentence_analysis = self._analyze_sentences(sentences)
        sentiment_distribution = self._calculate_distribution(sentence_analysis)
        
        # Generate description
        description = self._generate_description(
            overall_score, textblob_score, vader_score, transformer_score, sentiment_distribution
        )
        
        return {
            "overall_sentiment": {
                "score": round(overall_score, 3),
                "label": self._get_sentiment_label(overall_score),
                "confidence": round(final_confidence, 3)
            },
            "sentiment_distribution": sentiment_distribution,
            "emotional_tone": emotional_tone,
            "description": description
        }
    
    def _get_textblob_sentiment(self, text: str) -> Tuple[float, float]:
        """Get TextBlob sentiment scores."""
        blob = TextBlob(text)
        return blob.sentiment.polarity, blob.sentiment.subjectivity
    
    def _get_vader_sentiment(self, text: str) -> float:
        """Get VADER sentiment score."""
        return self.vader_analyzer.polarity_scores(text)['compound']
    
    def _get_transformer_sentiment(self, text: str) -> Tuple[float, float]:
        """Get transformer sentiment score with confidence."""
        if not self.sentiment_pipeline:
            return 0, 0
            
        try:
            chunks = self._split_text_for_transformer(text)
            results = []
            
            for chunk in chunks:
                result = self.sentiment_pipeline(chunk)[0]
                score = result['score'] if result['label'] == 'POSITIVE' else -result['score']
                results.append((score, result['score']))
            
            if results:
                avg_score = statistics.mean([r[0] for r in results])
                avg_confidence = statistics.mean([r[1] for r in results])
                return avg_score, avg_confidence
                
        except Exception as e:
            print(f"Transformer sentiment analysis failed: {e}")
            
        return 0, 0
    
    def _get_emotional_tone(self, doc) -> Dict[str, float]:
        """Get emotional tone analysis."""
        if not self.emotion_classifier:
            return {}
            
        try:
            # Split text into chunks to handle token limit
            chunks = self._split_text_for_transformer(doc.text, max_length=400)
            all_emotions = {}
            
            for chunk in chunks:
                chunk_results = self.emotion_classifier(chunk)
                for item in chunk_results:
                    emotion = item['label']
                    score = item['score']
                    if emotion in all_emotions:
                        all_emotions[emotion].append(score)
                    else:
                        all_emotions[emotion] = [score]
            
            # Average the scores across chunks
            return {emotion: statistics.mean(scores) for emotion, scores in all_emotions.items()}
            
        except Exception as e:
            print(f"Emotion analysis failed: {e}")
            return {}
    
    def _calculate_ensemble_sentiment(self, textblob_score: float, vader_score: float, 
                                    transformer_score: float, textblob_subjectivity: float,
                                    transformer_confidence: float) -> Tuple[float, float]:
        """Calculate weighted ensemble sentiment score and confidence."""
        sentiment_scores = [textblob_score, vader_score]
        
        if transformer_score != 0:
            sentiment_scores.append(transformer_score)
            weights = self.MODEL_WEIGHTS['three_models']
        else:
            weights = self.MODEL_WEIGHTS['two_models']
        
        overall_score = sum(score * weight for score, weight in zip(sentiment_scores, weights))
        
        # Calculate confidence
        model_agreement = self._calculate_model_agreement(sentiment_scores)
        base_confidence = (textblob_subjectivity + abs(vader_score) + transformer_confidence) / 3
        final_confidence = (base_confidence + model_agreement) / 2
        
        return overall_score, final_confidence
    
    def _analyze_sentences(self, sentences: List[str]) -> List[Dict[str, Any]]:
        """Analyze sentiment for individual sentences."""
        sentence_analysis = []
        
        for sentence in sentences:
            textblob_score = TextBlob(sentence).sentiment.polarity
            vader_score = self.vader_analyzer.polarity_scores(sentence)['compound']
            scores = [textblob_score, vader_score]
            
            # Add transformer score if available
            if self.sentiment_pipeline:
                try:
                    transformer_result = self.sentiment_pipeline(sentence)[0]
                    trans_score = (transformer_result['score'] 
                                    if transformer_result['label'] == 'POSITIVE' 
                                    else -transformer_result['score'])
                    scores.append(trans_score)
                except:
                    pass
            
            avg_score = statistics.mean(scores)
            sentiment_label = self._get_sentiment_label(avg_score)
            
            sentence_analysis.append({
                'sentence': sentence[:100] + '...' if len(sentence) > 100 else sentence,
                'sentiment': sentiment_label.lower(),
                'score': round(avg_score, 3),
                'confidence': round(abs(avg_score), 3)
            })
        
        return sentence_analysis
    
    def _calculate_distribution(self, sentence_analysis: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """Calculate sentiment distribution from sentence analysis."""
        sentiment_counts = {'positive': 0, 'neutral': 0, 'negative': 0}
        
        for analysis in sentence_analysis:
            sentiment_counts[analysis['sentiment']] += 1
        
        total = len(sentence_analysis)
        if total == 0:
            return {key: {"percentage": 0, "sentences": 0} for key in sentiment_counts}
        
        return {
            sentiment: {
                "percentage": round((count / total) * 100, 1),
                "sentences": count
            }
            for sentiment, count in sentiment_counts.items()
        }
    
    def _generate_description(self, overall_score: float, textblob_score: float, 
                            vader_score: float, transformer_score: float,
                            sentiment_distribution: Dict[str, Dict[str, float]]) -> str:
        """Generate description of the sentiment analysis."""
        label = self._get_sentiment_label(overall_score).lower()
        
        model_info = f"TextBlob: {textblob_score:.2f}, VADER: {vader_score:.2f}"
        if transformer_score != 0:
            model_info += f", Transformer: {transformer_score:.2f}"
        
        dist = sentiment_distribution
        distribution_info = (f"{dist['positive']['sentences']} positive, "
                            f"{dist['neutral']['sentences']} neutral, "
                            f"{dist['negative']['sentences']} negative sentences")
        
        return (f"Multi-model sentiment analysis shows {label} sentiment "
                f"(ensemble score: {overall_score:.3f}). {model_info}. "
                f"Distribution: {distribution_info}.")
    
    def _get_sentiment_label(self, score: float) -> str:
        """Convert numerical score to sentiment label."""
        if score > self.SENTIMENT_THRESHOLDS['positive']:
            return 'Positive'
        elif score < self.SENTIMENT_THRESHOLDS['negative']:
            return 'Negative'
        else:
            return 'Neutral'
    
    def _split_text_for_transformer(self, text: str, max_length: int = 400) -> List[str]:
        """Split text into chunks for transformer processing."""
        sentences = re.split(r'[.!?]+', text)
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            if len(current_chunk + " " + sentence) <= max_length:
                current_chunk += " " + sentence if current_chunk else sentence
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = sentence
        
        if current_chunk:
            chunks.append(current_chunk)
            
        return chunks or [text[:max_length]]
    
    def _calculate_model_agreement(self, scores: List[float]) -> float:
        """Calculate agreement between different models."""
        if len(scores) < 2:
            return 0.5
            
        valid_scores = [s for s in scores if s != 0]
        if len(valid_scores) < 2:
            return 0.5
            
        std_dev = statistics.stdev(valid_scores)
        return max(0, 1 - (std_dev / 2))