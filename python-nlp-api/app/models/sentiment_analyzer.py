import re
import statistics
from collections import Counter, defaultdict
from typing import List, Dict, Any
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import warnings
warnings.filterwarnings('ignore')

class SentimentAnalyzer:
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        try:
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis", 
                model="distilbert-base-uncased-finetuned-sst-2-english",
                tokenizer="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1  # Use CPU
            )
        except Exception as e:
            print(f"Warning: Could not load transformer sentiment model: {e}")
            self.sentiment_pipeline = None
        
        self.emotion_words = {
            'joy': {'happy', 'joy', 'excited', 'cheerful', 'delighted', 'elated', 'jubilant', 'pleased', 'glad', 'content', 'ecstatic', 'thrilled', 'blissful', 'euphoric', 'overjoyed'},
            'anger': {'angry', 'mad', 'furious', 'rage', 'annoyed', 'irritated', 'upset', 'frustrated', 'outraged', 'livid', 'irate', 'enraged', 'incensed', 'wrathful', 'indignant'},
            'fear': {'afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'fearful', 'alarmed', 'dread', 'apprehensive', 'petrified', 'horrified', 'intimidated', 'uneasy'},
            'sadness': {'sad', 'depressed', 'miserable', 'gloomy', 'melancholy', 'grief', 'sorrow', 'despair', 'dejected', 'blue', 'heartbroken', 'mournful', 'despondent', 'forlorn', 'downcast'},
            'surprise': {'surprised', 'amazed', 'shocked', 'astonished', 'stunned', 'bewildered', 'startled', 'astounded', 'flabbergasted', 'dumbfounded', 'taken aback', 'speechless'},
            'disgust': {'disgusted', 'revolted', 'repulsed', 'sick', 'nauseated', 'appalled', 'repugnant', 'loathe', 'abhor', 'detest', 'repelled', 'sickened', 'offended'}
        }
        
        self.intensity_modifiers = {
            'very': 1.5, 'extremely': 2.0, 'really': 1.3, 'quite': 1.2, 'rather': 1.1,
            'somewhat': 0.8, 'slightly': 0.7, 'barely': 0.5, 'hardly': 0.4,
            'absolutely': 2.0, 'completely': 1.8, 'totally': 1.7, 'incredibly': 1.9
        }

    def analyze_sentiment(self, text: str, doc, sentences: List[str]) -> Dict[str, Any]:
        """Enhanced sentiment analysis using multiple models."""
        blob = TextBlob(text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity
        
        vader_scores = self.vader_analyzer.polarity_scores(text)
        vader_compound = vader_scores['compound']
        
        transformer_score = 0
        transformer_confidence = 0
        if self.sentiment_pipeline:
            try:
                chunks = self._split_text_for_transformer(text)
                transformer_results = []
                for chunk in chunks:
                    result = self.sentiment_pipeline(chunk)[0]
                    score = result['score']
                    if result['label'] == 'NEGATIVE':
                        score = -score
                    transformer_results.append((score, result['score']))
                
                if transformer_results:
                    transformer_score = statistics.mean([r[0] for r in transformer_results])
                    transformer_confidence = statistics.mean([r[1] for r in transformer_results])
            except Exception as e:
                print(f"Transformer sentiment analysis failed: {e}")
        
        emotional_tone = self._analyze_emotions_enhanced(doc)
        
        sentiment_scores = [textblob_polarity, vader_compound]
        if transformer_score != 0:
            sentiment_scores.append(transformer_score)
        
        weights = [0.3, 0.4, 0.3] if len(sentiment_scores) == 3 else [0.5, 0.5]
        overall_score = sum(score * weight for score, weight in zip(sentiment_scores, weights))
        
        label = 'Positive' if overall_score > 0.05 else ('Negative' if overall_score < -0.05 else 'Neutral')
        percentage = min(100, (overall_score + 1) * 50) if label != 'Neutral' else 50 + abs(overall_score) * 10
        
        sentence_sentiments = []
        sentence_details = []
        for sentence in sentences:
            sent_blob = TextBlob(sentence)
            sent_vader = self.vader_analyzer.polarity_scores(sentence)
            sent_scores = [sent_blob.sentiment.polarity, sent_vader['compound']]
            
            if self.sentiment_pipeline:
                try:
                    sent_transformer = self.sentiment_pipeline(sentence)[0]
                    trans_score = sent_transformer['score']
                    if sent_transformer['label'] == 'NEGATIVE':
                        trans_score = -trans_score
                    sent_scores.append(trans_score)
                except:
                    pass
            
            sent_score = statistics.mean(sent_scores)
            sent_label = 'positive' if sent_score > 0.05 else ('negative' if sent_score < -0.05 else 'neutral')
            sentence_sentiments.append(sent_label)
            
            sentence_details.append({
                'sentence': sentence[:100] + '...' if len(sentence) > 100 else sentence,
                'sentiment': sent_label,
                'score': round(sent_score, 3),
                'confidence': round(abs(sent_score), 3)
            })
        
        pos_sentences = sentence_sentiments.count('positive')
        neu_sentences = sentence_sentiments.count('neutral')
        neg_sentences = sentence_sentiments.count('negative')
        total_sentences = len(sentences)
        
        model_agreement = self._calculate_model_agreement([textblob_polarity, vader_compound, transformer_score])
        base_confidence = (textblob_subjectivity + abs(vader_compound) + transformer_confidence) / 3
        final_confidence = (base_confidence + model_agreement) / 2
        
        model_info = f"TextBlob: {textblob_polarity:.2f}, VADER: {vader_compound:.2f}"
        if transformer_score != 0:
            model_info += f", Transformer: {transformer_score:.2f}"
        description = f"Multi-model sentiment analysis shows {label.lower()} sentiment (ensemble score: {overall_score:.3f}). {model_info}. Distribution: {pos_sentences} positive, {neu_sentences} neutral, {neg_sentences} negative sentences."
        
        return {
            "overall_sentiment": {
                "score": round(overall_score, 3),
                "label": label,
                "percentage": round(percentage, 1),
                "confidence": round(final_confidence, 3)
            },
            "sentiment_distribution": {
                "positive": {
                    "percentage": round((pos_sentences / total_sentences) * 100, 1) if total_sentences > 0 else 0,
                    "sentences": pos_sentences
                },
                "neutral": {
                    "percentage": round((neu_sentences / total_sentences) * 100, 1) if total_sentences > 0 else 0,
                    "sentences": neu_sentences
                },
                "negative": {
                    "percentage": round((neg_sentences / total_sentences) * 100, 1) if total_sentences > 0 else 0,
                    "sentences": neg_sentences
                }
            },
            "emotional_tone": emotional_tone,
            "description": description
        }

    def _analyze_emotions_enhanced(self, doc) -> Dict[str, float]:
        emotional_tone = {}
        words = [token for token in doc if not token.is_stop and token.is_alpha]
        
        for emotion, emotion_words in self.emotion_words.items():
            emotion_score = 0
            for i, token in enumerate(words):
                lemma = token.lemma_.lower()
                if lemma in emotion_words:
                    base_score = 1.0
                    for j in range(max(0, i-2), min(len(words), i+3)):
                        if j != i:
                            modifier = words[j].lemma_.lower()
                            if modifier in self.intensity_modifiers:
                                base_score *= self.intensity_modifiers[modifier]
                    negation_found = False
                    for j in range(max(0, i-3), i):
                        if words[j].lemma_.lower() in ['not', 'no', 'never', 'none', 'neither', 'hardly']:
                            negation_found = True
                            break
                    if negation_found:
                        base_score *= -0.5
                    emotion_score += base_score
            emotional_tone[emotion] = round(max(0, emotion_score / len(words)), 4) if words else 0
        return emotional_tone
    
    def _split_text_for_transformer(self, text: str, max_length: int = 400) -> List[str]:
        sentences = re.split(r'[.!?]+', text)
        chunks = []
        current_chunk = ""
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence: continue
            if len(current_chunk + " " + sentence) <= max_length:
                current_chunk += " " + sentence if current_chunk else sentence
            else:
                if current_chunk: chunks.append(current_chunk)
                current_chunk = sentence
        if current_chunk: chunks.append(current_chunk)
        return chunks or [text[:max_length]]
    
    def _calculate_model_agreement(self, scores: List[float]) -> float:
        if len(scores) < 2: return 0.5
        valid_scores = [s for s in scores if s != 0] # remove scores of 0
        if len(valid_scores) < 2: return 0.5
        std_dev = statistics.stdev(valid_scores)
        agreement = max(0, 1 - (std_dev / 2))
        return agreement