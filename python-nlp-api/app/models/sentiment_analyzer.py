import re
import statistics
from typing import List, Dict, Any, Tuple
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import warnings
warnings.filterwarnings('ignore')

class SentimentAnalyzer:
    
    SENTIMENT_THRESHOLDS = {
        'positive': 0.15,   
        'negative': -0.15      
    }
    
    # Confidence thresholds for emotion detection
    EMOTION_CONFIDENCE_THRESHOLDS = {
        'minimum_sentiment_magnitude': 0.2,  # Only analyze emotions if sentiment is strong enough
        'minimum_emotion_score': 0.4,        # Only include emotions above this threshold
        'minimum_subjectivity': 0.3,         # Only analyze emotions if text is subjective enough
        'ensemble_agreement_threshold': 0.6   # Models must agree before strong sentiment classification
    }
    
    MODEL_WEIGHTS = {'two_models': [0.5, 0.5], 'three_models': [0.3, 0.4, 0.3]}

    def __init__(self, emotion_model="j-hartmann/emotion-english-distilroberta-base"):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.emotion_model = emotion_model
        self._initialize_pipelines()

        # Expanded emotion words for better detection
        self.emotion_words = {
            'joy': {'happy', 'joy', 'excited', 'cheerful', 'delighted', 'elated', 'jubilant', 
                   'pleased', 'glad', 'content', 'ecstatic', 'thrilled', 'blissful', 'euphoric', 
                   'overjoyed', 'wonderful', 'fantastic', 'amazing', 'love', 'adore'},
            'anger': {'angry', 'mad', 'furious', 'rage', 'annoyed', 'irritated', 'upset', 
                        'frustrated', 'outraged', 'livid', 'irate', 'enraged', 'incensed', 
                        'wrathful', 'indignant', 'hate', 'despise', 'loathe'},
            'fear': {'afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 
                    'panic', 'fearful', 'alarmed', 'dread', 'apprehensive', 'petrified', 
                    'horrified', 'intimidated', 'uneasy', 'concern', 'stressed'},
            'sadness': {'sad', 'depressed', 'miserable', 'gloomy', 'melancholy', 'grief', 
                        'sorrow', 'despair', 'dejected', 'blue', 'heartbroken', 'mournful', 
                        'despondent', 'forlorn', 'downcast', 'disappointed', 'upset'},
            'surprise': {'surprised', 'amazed', 'shocked', 'astonished', 'stunned', 
                        'bewildered', 'startled', 'astounded', 'flabbergasted', 
                        'dumbfounded', 'speechless', 'unexpected'},
            'disgust': {'disgusted', 'revolted', 'repulsed', 'sick', 'nauseated', 'appalled', 
                        'repugnant', 'abhor', 'detest', 'repelled', 'sickened', 'offended', 
                        'gross', 'awful', 'terrible'}
        }
        
        # Neutral indicators that suggest factual/objective content
        self.neutral_indicators = {
            'factual_words': {'according', 'research', 'study', 'data', 'analysis', 'report', 
                                'statistics', 'evidence', 'findings', 'results', 'conclusion',
                                'methodology', 'objective', 'measurement', 'observation'},
            'academic_phrases': {'it has been shown', 'research indicates', 'studies suggest',
                                'data shows', 'analysis reveals', 'findings indicate',
                                'evidence suggests', 'research demonstrates'},
            'temporal_markers': {'yesterday', 'today', 'tomorrow', 'recently', 'currently',
                                'previously', 'subsequently', 'meanwhile', 'thereafter'}
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
        """Enhanced sentiment analysis with balanced thresholds."""
        # Get base sentiment scores
        textblob_score, textblob_subjectivity = self._get_textblob_sentiment(text)
        vader_score = self._get_vader_sentiment(text)
        transformer_score, transformer_confidence = self._get_transformer_sentiment(text)
        
        # Check if text appears to be factual/neutral
        factual_score = self._assess_factual_content(text)
        
        # Calculate ensemble sentiment with factual adjustment
        overall_score, final_confidence = self._calculate_ensemble_sentiment(
            textblob_score, vader_score, transformer_score, 
            textblob_subjectivity, transformer_confidence, factual_score
        )
        
        # Only analyze emotions if sentiment is strong enough and text is subjective
        emotional_tone = {}
        if (abs(overall_score) >= self.EMOTION_CONFIDENCE_THRESHOLDS['minimum_sentiment_magnitude'] 
            and textblob_subjectivity >= self.EMOTION_CONFIDENCE_THRESHOLDS['minimum_subjectivity']
            and factual_score < 0.6):  # Not too factual
            emotional_tone = self._get_filtered_emotional_tone(doc, overall_score, textblob_subjectivity)
        
        # Analyze individual sentences with conservative thresholds
        sentence_analysis = self._analyze_sentences_conservative(sentences)
        sentiment_distribution = self._calculate_distribution(sentence_analysis)
        
        # Generate description
        description = self._generate_balanced_description(
            overall_score, textblob_score, vader_score, transformer_score, 
            sentiment_distribution, factual_score, textblob_subjectivity
        )
        
        return {
            "overall_sentiment": {
                "score": round(overall_score, 3),
                "label": self._get_sentiment_label_conservative(overall_score, final_confidence),
                "confidence": round(final_confidence, 3),
                "factual_content_score": round(factual_score, 3)
            },
            "sentiment_distribution": sentiment_distribution,
            "emotional_tone": emotional_tone,
            "description": description
        }
    
    def _assess_factual_content(self, text: str) -> float:
        """Assess how factual/objective the content appears to be."""
        text_lower = text.lower()
        word_count = len(text.split())
        
        if word_count == 0:
            return 0.0
        
        factual_indicators = 0
        
        # Count factual words
        for word in self.neutral_indicators['factual_words']:
            factual_indicators += text_lower.count(word)
        
        # Count academic phrases (weighted more heavily)
        for phrase in self.neutral_indicators['academic_phrases']:
            factual_indicators += text_lower.count(phrase) * 2
        
        # Count temporal markers
        for marker in self.neutral_indicators['temporal_markers']:
            factual_indicators += text_lower.count(marker) * 0.5
        
        # Check for numerical data, dates, percentages
        factual_indicators += len(re.findall(r'\b\d+%\b|\b\d{4}\b|\b\d+\.\d+\b', text))
        
        # Normalize by word count
        factual_score = min(1.0, factual_indicators / (word_count * 0.1))
        
        return factual_score
    
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
    
    def _get_filtered_emotional_tone(self, doc, overall_sentiment: float, subjectivity: float) -> Dict[str, float]:
        """Get emotional tone analysis with confidence filtering."""
        if not self.emotion_classifier:
            return {}
            
        try:
            # Split text into chunks to handle token limit
            chunks = self._split_text_for_transformer(doc.text, max_length=400)
            all_emotions = {}
            
            for chunk in chunks:
                chunk_results = self.emotion_classifier(chunk)
                for item in chunk_results:
                    emotion = item['label'].lower()
                    score = item['score']
                    
                    # Only include emotions above minimum threshold
                    if score >= self.EMOTION_CONFIDENCE_THRESHOLDS['minimum_emotion_score']:
                        if emotion in all_emotions:
                            all_emotions[emotion].append(score)
                        else:
                            all_emotions[emotion] = [score]
            
            # Average the scores across chunks and apply additional filtering
            averaged_emotions = {emotion: statistics.mean(scores) 
                               for emotion, scores in all_emotions.items()}
            
            # Further filter based on lexical presence and sentiment alignment
            filtered_emotions = {}
            for emotion, score in averaged_emotions.items():
                if self._validate_emotion_presence(doc.text, emotion, overall_sentiment):
                    filtered_emotions[emotion] = round(score, 3)
            
            return filtered_emotions
            
        except Exception as e:
            print(f"Emotion analysis failed: {e}")
            return {}
    
    def _validate_emotion_presence(self, text: str, emotion: str, sentiment_score: float) -> bool:
        """Validate that detected emotion aligns with text content and sentiment."""
        text_lower = text.lower()
        
        # Check if emotion words are actually present in the text
        if emotion in self.emotion_words:
            emotion_word_present = any(word in text_lower for word in self.emotion_words[emotion])
        else:
            emotion_word_present = False
        
        # Check sentiment-emotion alignment
        positive_emotions = {'joy', 'happiness', 'love', 'excitement'}
        negative_emotions = {'anger', 'sadness', 'fear', 'disgust', 'disappointment'}
        
        sentiment_aligned = True
        if emotion in positive_emotions and sentiment_score < -0.1:
            sentiment_aligned = False
        elif emotion in negative_emotions and sentiment_score > 0.1:
            sentiment_aligned = False
        
        # Return True only if emotion words are present OR sentiment strongly aligns
        return emotion_word_present or (sentiment_aligned and abs(sentiment_score) > 0.3)
    
    def _calculate_ensemble_sentiment(self, textblob_score: float, vader_score: float, 
                                    transformer_score: float, textblob_subjectivity: float,
                                    transformer_confidence: float, factual_score: float) -> Tuple[float, float]:
        """Calculate weighted ensemble sentiment score with factual content adjustment."""
        sentiment_scores = [textblob_score, vader_score]
        
        if transformer_score != 0:
            sentiment_scores.append(transformer_score)
            weights = self.MODEL_WEIGHTS['three_models']
        else:
            weights = self.MODEL_WEIGHTS['two_models']
        
        raw_score = sum(score * weight for score, weight in zip(sentiment_scores, weights))
        
        # Apply factual content dampening - reduce sentiment strength for factual content
        factual_dampening = 1 - (factual_score * 0.4)  # Reduce by up to 40% for highly factual content
        adjusted_score = raw_score * factual_dampening
        
        # Calculate confidence
        model_agreement = self._calculate_model_agreement(sentiment_scores)
        base_confidence = (textblob_subjectivity + abs(vader_score) + transformer_confidence) / 3
        
        # Reduce confidence for factual content
        factual_confidence_penalty = factual_score * 0.3
        final_confidence = max(0.1, (base_confidence + model_agreement) / 2 - factual_confidence_penalty)
        
        return adjusted_score, final_confidence
    
    def _get_sentiment_label_conservative(self, score: float, confidence: float) -> str:
        """Convert numerical score to sentiment label with conservative thresholds."""
        # Require higher confidence for non-neutral classifications
        if confidence < self.EMOTION_CONFIDENCE_THRESHOLDS['ensemble_agreement_threshold']:
            # If confidence is low, bias toward neutral
            if abs(score) < 0.3:
                return 'Neutral'
        
        if score > self.SENTIMENT_THRESHOLDS['positive']:
            return 'Positive'
        elif score < self.SENTIMENT_THRESHOLDS['negative']:
            return 'Negative'
        else:
            return 'Neutral'
    
    def _analyze_sentences_conservative(self, sentences: List[str]) -> List[Dict[str, Any]]:
        """Analyze sentiment for individual sentences with conservative thresholds."""
        sentence_analysis = []
        
        for sentence in sentences:
            # Skip very short sentences that are likely neutral
            if len(sentence.split()) < 4:
                sentiment_label = 'neutral'
                avg_score = 0.0
            else:
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
                
                # Apply conservative thresholds
                if abs(avg_score) < 0.2:  # More conservative than overall thresholds
                    sentiment_label = 'neutral'
                    avg_score = 0.0
                else:
                    sentiment_label = self._get_sentiment_label_conservative(avg_score, abs(avg_score)).lower()
            
            sentence_analysis.append({
                'sentence': sentence[:100] + '...' if len(sentence) > 100 else sentence,
                'sentiment': sentiment_label,
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
    
    def _generate_balanced_description(self, overall_score: float, textblob_score: float, 
                                    vader_score: float, transformer_score: float,
                                    sentiment_distribution: Dict[str, Dict[str, float]],
                                    factual_score: float, subjectivity: float) -> str:
        """Generate description of the balanced sentiment analysis."""
        label = self._get_sentiment_label_conservative(overall_score, abs(overall_score)).lower()
        
        model_info = f"TextBlob: {textblob_score:.2f}, VADER: {vader_score:.2f}"
        if transformer_score != 0:
            model_info += f", Transformer: {transformer_score:.2f}"
        
        dist = sentiment_distribution
        distribution_info = (f"{dist['positive']['sentences']} positive, "
                            f"{dist['neutral']['sentences']} neutral, "
                            f"{dist['negative']['sentences']} negative sentences")
        
        # Add context about factual content and subjectivity
        content_type = ""
        if factual_score > 0.5:
            content_type = " (appears to be factual/objective content)"
        elif subjectivity < 0.3:
            content_type = " (low subjectivity detected)"
        
        return (f"Conservative sentiment analysis shows {label} sentiment "
                f"(adjusted score: {overall_score:.3f}){content_type}. "
                f"{model_info}. Distribution: {distribution_info}. "
                f"Factual content score: {factual_score:.2f}, "
                f"Subjectivity: {subjectivity:.2f}.")
    
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