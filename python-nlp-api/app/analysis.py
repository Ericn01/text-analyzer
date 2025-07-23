import re
import json
from collections import Counter, defaultdict
from typing import List, Dict, Any
import math
import statistics

# Required packages (lightweight):
# pip install spacy textblob scikit-learn transformers torch vaderSentiment yake-keyword
# python -m spacy download en_core_web_sm
# python -m textblob.download_corpora

import spacy
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import yake
import warnings
warnings.filterwarnings('ignore')

class EnhancedNLPAnalyzer:
    def __init__(self):
        """Initialize with multiple lightweight models"""
        try:
            # Load spaCy's small English model
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise Exception("Please install spaCy small model: python -m spacy download en_core_web_sm")
        
        # Initialize VADER sentiment analyzer
        self.vader_analyzer = SentimentIntensityAnalyzer()
        
        # Initialize lightweight transformer for sentiment (DistilBERT-based)
        try:
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis", 
                model="distilbert-base-uncased-finetuned-sst-2-english",
                tokenizer="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1  # Use CPU
            )
        except Exception as e:
            print(f"Warning: Could not load transformer model: {e}")
            self.sentiment_pipeline = None
        
        # Initialize YAKE keyword extractor
        self.yake_extractor = yake.KeywordExtractor(
            lan="en",
            n=3,  # Maximum number of words in keyphrase
            dedupLim=0.7,
            top=20
        )
        
        # Enhanced emotion word lists
        self.emotion_words = {
            'joy': {'happy', 'joy', 'excited', 'cheerful', 'delighted', 'elated', 'jubilant', 'pleased', 'glad', 'content', 'ecstatic', 'thrilled', 'blissful', 'euphoric', 'overjoyed'},
            'anger': {'angry', 'mad', 'furious', 'rage', 'annoyed', 'irritated', 'upset', 'frustrated', 'outraged', 'livid', 'irate', 'enraged', 'incensed', 'wrathful', 'indignant'},
            'fear': {'afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'fearful', 'alarmed', 'dread', 'apprehensive', 'petrified', 'horrified', 'intimidated', 'uneasy'},
            'sadness': {'sad', 'depressed', 'miserable', 'gloomy', 'melancholy', 'grief', 'sorrow', 'despair', 'dejected', 'blue', 'heartbroken', 'mournful', 'despondent', 'forlorn', 'downcast'},
            'surprise': {'surprised', 'amazed', 'shocked', 'astonished', 'stunned', 'bewildered', 'startled', 'astounded', 'flabbergasted', 'dumbfounded', 'taken aback', 'speechless'},
            'disgust': {'disgusted', 'revolted', 'repulsed', 'sick', 'nauseated', 'appalled', 'repugnant', 'loathe', 'abhor', 'detest', 'repelled', 'sickened', 'offended'}
        }
        
        # Sentiment intensity multipliers
        self.intensity_modifiers = {
            'very': 1.5, 'extremely': 2.0, 'really': 1.3, 'quite': 1.2, 'rather': 1.1,
            'somewhat': 0.8, 'slightly': 0.7, 'barely': 0.5, 'hardly': 0.4,
            'absolutely': 2.0, 'completely': 1.8, 'totally': 1.7, 'incredibly': 1.9
        }
    
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """Main analysis function that returns the complete analysis"""
        # Process text with spaCy
        doc = self.nlp(text)
        
        # Extract sentences and tokens
        sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
        
        sentiment_analysis = self._analyze_sentiment_enhanced(text, sentences, doc)
        keyword_extraction = self._extract_keywords_enhanced(text, doc)
        topic_modeling = self._model_topics(text, sentences, doc)
        language_patterns = self._analyze_language_patterns(text, sentences, doc)
        
        return {
            "sentiment_analysis": sentiment_analysis,
            "keyword_extraction": keyword_extraction,
            "topic_modeling": topic_modeling,
            "language_patterns": language_patterns
        }
    
    def _analyze_sentiment_enhanced(self, text: str, sentences: List[str], doc) -> Dict[str, Any]:
        """Enhanced sentiment analysis using multiple models"""
        
        # 1. TextBlob sentiment
        blob = TextBlob(text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity
        
        # 2. VADER sentiment
        vader_scores = self.vader_analyzer.polarity_scores(text)
        vader_compound = vader_scores['compound']
        
        # 3. Transformer-based sentiment (if available)
        transformer_score = 0
        transformer_confidence = 0
        if self.sentiment_pipeline:
            try:
                # Split long text for transformer (max 512 tokens)
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
        
        # 4. Enhanced emotion analysis with context and intensity
        emotional_tone = self._analyze_emotions_enhanced(doc)
        
        # 5. Ensemble sentiment scoring
        sentiment_scores = [textblob_polarity, vader_compound]
        if transformer_score != 0:
            sentiment_scores.append(transformer_score)
        
        # Weighted ensemble (give more weight to transformer and VADER)
        weights = [0.3, 0.4, 0.3] if len(sentiment_scores) == 3 else [0.5, 0.5]
        overall_score = sum(score * weight for score, weight in zip(sentiment_scores, weights))
        
        # Determine label and percentage
        if overall_score > 0.05:
            label = 'Positive'
            percentage = min(100, (overall_score + 1) * 50)
        elif overall_score < -0.05:
            label = 'Negative'
            percentage = min(100, (1 - (overall_score + 1)) * 50)
        else:
            label = 'Neutral'
            percentage = 50 + abs(overall_score) * 10
        
        # Enhanced sentence-level sentiment analysis
        sentence_sentiments = []
        sentence_details = []
        
        for sentence in sentences:
            # Multiple model analysis per sentence
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
            
            # Ensemble sentence sentiment
            sent_score = statistics.mean(sent_scores)
            
            if sent_score > 0.05:
                sentence_sentiments.append('positive')
                sent_label = 'positive'
            elif sent_score < -0.05:
                sentence_sentiments.append('negative')
                sent_label = 'negative'
            else:
                sentence_sentiments.append('neutral')
                sent_label = 'neutral'
            
            sentence_details.append({
                'sentence': sentence[:100] + '...' if len(sentence) > 100 else sentence,
                'sentiment': sent_label,
                'score': round(sent_score, 3),
                'confidence': round(abs(sent_score), 3)
            })
        
        # Count sentence sentiments
        pos_sentences = sentence_sentiments.count('positive')
        neu_sentences = sentence_sentiments.count('neutral')
        neg_sentences = sentence_sentiments.count('negative')
        total_sentences = len(sentences)
        
        # Enhanced confidence calculation
        model_agreement = self._calculate_model_agreement([textblob_polarity, vader_compound, transformer_score])
        base_confidence = (textblob_subjectivity + abs(vader_compound) + transformer_confidence) / 3
        final_confidence = (base_confidence + model_agreement) / 2
        
        # Generate enhanced description
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
        """Enhanced emotion analysis with context and intensity modifiers"""
        emotional_tone = {}
        words = [token for token in doc if not token.is_stop and token.is_alpha]
        
        for emotion, emotion_words in self.emotion_words.items():
            emotion_score = 0
            
            for i, token in enumerate(words):
                lemma = token.lemma_.lower()
                
                if lemma in emotion_words:
                    base_score = 1.0
                    
                    # Check for intensity modifiers in surrounding context
                    for j in range(max(0, i-2), min(len(words), i+3)):
                        if j != i:
                            modifier = words[j].lemma_.lower()
                            if modifier in self.intensity_modifiers:
                                base_score *= self.intensity_modifiers[modifier]
                    
                    # Check for negation
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
    
    def _extract_keywords_enhanced(self, text: str, doc) -> Dict[str, Any]:
        """Enhanced keyword extraction using multiple algorithms"""
        
        # 1. spaCy + TF-IDF approach (from previous version)
        spacy_keywords = self._extract_spacy_keywords(doc)
        
        # 2. YAKE keyword extraction
        yake_keywords = self._extract_yake_keywords(text)
        
        # 3. Enhanced named entity recognition
        enhanced_entities = self._extract_enhanced_entities(doc)
        
        # 4. Advanced phrase extraction using dependency parsing
        advanced_phrases = self._extract_dependency_phrases(doc)
        
        # 5. Combine and rank all keywords
        combined_keywords = self._combine_keyword_results(spacy_keywords, yake_keywords)
        
        return {
            "keywords": combined_keywords[:15],
            "key_phrases": advanced_phrases[:8],
            "named_entities": enhanced_entities[:10]
        }
    
    def _extract_spacy_keywords(self, doc) -> List[Dict[str, Any]]:
        """Extract keywords using spaCy with enhanced scoring"""
        tokens = [token for token in doc if not token.is_stop and not token.is_punct and token.is_alpha and len(token.text) > 2]
        
        word_freq = Counter()
        word_pos_scores = defaultdict(float)
        word_contexts = defaultdict(list)
        
        for token in tokens:
            lemma = token.lemma_.lower()
            word_freq[lemma] += 1
            word_contexts[lemma].append(token.sent.text[:50] + "...")
            
            # Enhanced POS scoring
            if token.pos_ in ['NOUN', 'PROPN']:
                word_pos_scores[lemma] += 3.0
            elif token.pos_ == 'ADJ':
                word_pos_scores[lemma] += 2.0
            elif token.pos_ == 'VERB':
                word_pos_scores[lemma] += 1.5
            else:
                word_pos_scores[lemma] += 1.0
            
            # Bonus for technical/domain-specific terms
            if len(token.text) > 7:
                word_pos_scores[lemma] += 0.5
        
        keywords = []
        for word, freq in word_freq.most_common(20):
            relevance = (freq * word_pos_scores[word]) / len(tokens)
            keywords.append({
                "word": word,
                "frequency": freq,
                "relevance": round(relevance, 4),
                "weight": round(math.log(freq + 1) * word_pos_scores[word], 3),
                "pos_score": round(word_pos_scores[word], 2)
            })
        
        return keywords
    
    def _extract_yake_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Extract keywords using YAKE algorithm"""
        try:
            yake_results = self.yake_extractor.extract_keywords(text)
            
            keywords = []
            for score, keyword in yake_results[:15]:
                # YAKE scores are lower for better keywords, so invert
                relevance = 1 / (1 + score)
                keywords.append({
                    "word": keyword.lower(),
                    "frequency": len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', text.lower())),
                    "relevance": round(relevance, 4),
                    "weight": round(relevance * 10, 3),
                    "yake_score": round(score, 4)
                })
            
            return keywords
        except Exception as e:
            print(f"YAKE extraction failed: {e}")
            return []
    
    def _combine_keyword_results(self, spacy_keywords: List[Dict], yake_keywords: List[Dict]) -> List[Dict]:
        """Combine and rank keywords from different sources"""
        combined = {}
        
        # Add spaCy keywords
        for kw in spacy_keywords:
            word = kw['word']
            combined[word] = {
                "word": word,
                "frequency": kw['frequency'],
                "relevance": kw['relevance'],
                "weight": kw['weight'],
                "sources": ['spacy'],
                "spacy_score": kw['relevance']
            }
        
        # Add YAKE keywords
        for kw in yake_keywords:
            word = kw['word']
            if word in combined:
                combined[word]['sources'].append('yake')
                combined[word]['yake_score'] = kw['relevance']
                combined[word]['weight'] = (combined[word]['weight'] + kw['weight']) / 2
                combined[word]['relevance'] = (combined[word]['relevance'] + kw['relevance']) / 2
            else:
                combined[word] = {
                    "word": word,
                    "frequency": kw['frequency'],
                    "relevance": kw['relevance'],
                    "weight": kw['weight'],
                    "sources": ['yake'],
                    "yake_score": kw['relevance']
                }
        
        # Boost keywords found by multiple sources
        for word, data in combined.items():
            if len(data['sources']) > 1:
                data['weight'] *= 1.3
                data['relevance'] *= 1.2
        
        # Sort by combined weight
        result = sorted(combined.values(), key=lambda x: x['weight'], reverse=True)
        
        # Clean up the output
        for item in result:
            item['sources'] = ', '.join(item['sources'])
            if 'spacy_score' not in item:
                item['spacy_score'] = 0
            if 'yake_score' not in item:
                item['yake_score'] = 0
        
        return result
    
    def _extract_dependency_phrases(self, doc) -> List[Dict[str, Any]]:
        """Extract phrases using dependency parsing"""
        phrases = []
        phrase_freq = Counter()
        
        # Extract noun phrases with their modifiers
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) >= 2 and not all(token.is_stop for token in chunk):
                phrase = chunk.text.lower().strip()
                if phrase and len(phrase) > 4:
                    phrase_freq[phrase] += 1
        
        # Extract verb phrases
        for token in doc:
            if token.pos_ == 'VERB' and not token.is_stop:
                # Get verb with its objects/complements
                phrase_parts = [token.lemma_.lower()]
                
                for child in token.children:
                    if child.dep_ in ['dobj', 'pobj', 'attr'] and not child.is_stop:
                        phrase_parts.append(child.lemma_.lower())
                
                if len(phrase_parts) > 1:
                    phrase = ' '.join(phrase_parts)
                    phrase_freq[phrase] += 1
        
        # Convert to list format
        for phrase, freq in phrase_freq.most_common(10):
            phrases.append({
                "phrase": phrase,
                "frequency": freq,
                "relevance": round(freq / len(list(doc.noun_chunks)), 4) if list(doc.noun_chunks) else 0,
                "type": "compound" if len(phrase.split()) > 2 else "simple"
            })
        
        return phrases
    
    def _extract_enhanced_entities(self, doc) -> List[Dict[str, Any]]:
        """Enhanced named entity extraction with confidence scoring"""
        entities = []
        entity_freq = Counter()
        entity_contexts = defaultdict(list)
        
        for ent in doc.ents:
            entity_freq[(ent.text, ent.label_)] += 1
            entity_contexts[ent.text].append(ent.sent.text[:100] + "...")
        
        for (entity, label), freq in entity_freq.most_common(15):
            # Calculate confidence based on various factors
            confidence = 0.5  # Base confidence
            
            # Boost confidence for frequent entities
            confidence += min(0.3, freq * 0.1)
            
            # Boost confidence for certain entity types
            if label in ['PERSON', 'ORG', 'GPE']:
                confidence += 0.2
            elif label in ['DATE', 'TIME', 'MONEY', 'PERCENT']:
                confidence += 0.1
            
            # Boost confidence for capitalized entities
            if entity[0].isupper():
                confidence += 0.1
            
            entities.append({
                "entity": entity,
                "type": label,
                "frequency": freq,
                "confidence": round(min(0.95, confidence), 3),
                "contexts": entity_contexts[entity][:2]  # Sample contexts
            })
        
        return entities
    
    def _split_text_for_transformer(self, text: str, max_length: int = 400) -> List[str]:
        """Split text into chunks for transformer processing"""
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
        """Calculate agreement between different sentiment models"""
        if len(scores) < 2:
            return 0.5
        
        # Remove zero scores (failed models)
        valid_scores = [s for s in scores if s != 0]
        if len(valid_scores) < 2:
            return 0.5
        
        # Calculate standard deviation (lower = better agreement)
        std_dev = statistics.stdev(valid_scores)
        
        # Convert to agreement score (0-1, where 1 is perfect agreement)
        agreement = max(0, 1 - (std_dev / 2))
        
        return agreement
    
    def _model_topics(self, text: str, sentences: List[str], doc) -> Dict[str, Any]:
        """Topic modeling using TF-IDF and K-means clustering"""
        # (Same implementation as before - keeping it unchanged for space)
        if len(sentences) < 2:
            return {
                "primary_topics": [],
                "topic_coherence_score": 0.0,
                "topic_evolution": []
            }
        
        # Prepare text for TF-IDF
        processed_sentences = []
        for sent in sentences:
            sent_doc = self.nlp(sent)
            words = [token.lemma_.lower() for token in sent_doc 
                    if not token.is_stop and not token.is_punct and token.is_alpha and len(token.text) > 2]
            if words:
                processed_sentences.append(' '.join(words))
        
        if not processed_sentences:
            return {"primary_topics": [], "topic_coherence_score": 0.0, "topic_evolution": []}
        
        # TF-IDF and clustering
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
    
    def _analyze_language_patterns(self, text: str, sentences: List[str], doc) -> Dict[str, Any]:
        """Analyze language complexity and style using spaCy"""
        # (Same implementation as before for brevity)
        if not list(doc):
            return {
                "complexity_metrics": {"average_syllables_per_word": 0, "polysyllabic_words": 0, "technical_terms": 0, "passive_voice_percentage": 0},
                "stylistic_features": {"formal_language_score": 0, "academic_tone_score": 0, "objectivity_score": 0, "clarity_score": 0}
            }
        
        words = [token for token in doc if token.is_alpha and not token.is_punct]
        
        def count_syllables(word):
            word = word.lower()
            vowels = "aeiouy"
            count = 0
            prev_was_vowel = False
            for char in word:
                is_vowel = char in vowels
                if is_vowel and not prev_was_vowel:
                    count += 1
                prev_was_vowel = is_vowel
            if word.endswith('e') and count > 1:
                count -= 1
            return max(1, count)
        
        syllable_counts = [count_syllables(token.text) for token in words]
        avg_syllables = sum(syllable_counts) / len(syllable_counts) if syllable_counts else 0
        polysyllabic = sum(1 for count in syllable_counts if count >= 3)
        technical_terms = sum(1 for token in words if len(token.text) > 7 or token.pos_ in ['PROPN'])
        
        passive_count = sum(1 for token in doc if token.dep_ == 'auxpass')
        passive_percentage = (passive_count / len(sentences)) * 100 if sentences else 0
        
        formal_indicators = {'therefore', 'however', 'moreover', 'furthermore', 'consequently', 'nevertheless', 'nonetheless'}
        academic_indicators = {'research', 'study', 'analysis', 'data', 'findings', 'conclusion', 'hypothesis', 'methodology'}
        
        formal_count = sum(1 for token in doc if token.lemma_.lower() in formal_indicators)
        academic_count = sum(1 for token in doc if token.lemma_.lower() in academic_indicators)
        
        formal_score = formal_count / len(words) if words else 0
        academic_score = academic_count / len(words) if words else 0
        
        personal_pronouns = sum(1 for token in doc if token.pos_ == 'PRON' and token.lemma_.lower() in ['i', 'me', 'my', 'we', 'us', 'our'])
        emotional_words_count = sum(1 for token in doc for emotion_set in self.emotion_words.values() if token.lemma_.lower() in emotion_set)
        
        subjectivity_indicators = personal_pronouns + emotional_words_count
        objectivity_score = max(0, 1 - (subjectivity_indicators / len(words))) if words else 0
        
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        complexity_penalty = min(avg_sentence_length / 20, 0.5)
        clarity_score = max(0.1, 1 - complexity_penalty)
        
        return {
            "complexity_metrics": {
                "average_syllables_per_word": round(avg_syllables, 2),
                "polysyllabic_words": polysyllabic,
                "technical_terms": technical_terms,
                "passive_voice_percentage": round(passive_percentage, 1)
            },
            "stylistic_features": {
                "formal_language_score": round(formal_score, 3),
                "academic_tone_score": round(academic_score, 3),
                "objectivity_score": round(objectivity_score, 3),
                "clarity_score": round(clarity_score, 3)
            }
        }

# Example usage
def main():
    analyzer = EnhancedNLPAnalyzer()
    
    sample_text = """
        The Color of the Sky: A Scientific and Cultural Exploration

The sky, a vast canvas that stretches across our view every day, evokes wonder, calm, and curiosity. Though it may seem like a simple backdrop to our daily lives, the color of the sky is a phenomenon rooted in complex scientific principles and shaped by cultural, poetic, and emotional interpretations. From the bright blue of a summer noon to the fiery reds of sunset and the inky black of night, the changing hues of the sky tell a story of light, atmosphere, and human perception.
The Science Behind the Sky’s Color

At the most basic level, the color of the sky can be explained by Rayleigh scattering. Sunlight, although it appears white, is actually made up of many colors—each with a different wavelength. When sunlight enters Earth’s atmosphere, it interacts with molecules and small particles in the air. Shorter wavelengths of light—blue and violet—scatter more than longer wavelengths like red and orange.

Despite violet scattering even more than blue, our eyes are more sensitive to blue light and less to violet, and some of the violet is absorbed by the ozone layer. As a result, we perceive the sky as blue during the day when the sun is high in the sky.

During sunrise and sunset, the sun is low on the horizon, and its light has to pass through a thicker layer of the atmosphere. More blue and green light is scattered out of the direct path of the light, allowing reds and oranges to dominate the sky's palette. This is why we often see vibrant shades of red, orange, pink, and purple at dusk and dawn.

At night, in the absence of sunlight, the sky turns dark, revealing stars and planets. The blackness of night is the true color of space, unobscured by sunlight scattering in our atmosphere.
Variations in Sky Color

While the blue sky of midday is most familiar, many factors influence the sky’s appearance. Humidity, pollution, dust, and volcanic ash can all affect the way light scatters, often leading to more brilliant or muted colors. For instance, after volcanic eruptions, particles in the upper atmosphere can enhance red and purple hues during sunsets around the world. Similarly, pollution can dull the blue of the sky or create eerie reddish hues, especially in urban areas.

In polar regions or at high altitudes, the sky can appear a deeper, more intense blue due to lower concentrations of atmospheric particles. In contrast, desert skies often appear a lighter blue, as fine dust particles can scatter light differently.

Clouds also play a major role. They scatter all wavelengths of light fairly evenly, which is why they usually appear white or grey. However, during sunrise and sunset, clouds can reflect the warm colors of the sun, leading to spectacular displays.
The Sky in Art, Culture, and Emotion

Beyond its physical explanation, the sky holds profound meaning in human culture. It has long inspired artists, poets, and philosophers. In Vincent van Gogh’s Starry Night, the swirling, dreamlike sky reflects emotional turbulence and wonder. For Romantic poets like Wordsworth and Keats, the sky was a symbol of the sublime—nature’s overwhelming beauty and power.

Blue skies have become synonymous with positivity and clarity—both literally and metaphorically. A “blue-sky day” suggests pleasant weather, while “blue-sky thinking” implies creative, unbounded ideation. Conversely, a “grey sky” often connotes gloom or melancholy.

In many religious traditions, the sky is associated with the divine or the afterlife. In Christianity, heaven is often imagined as being "in the sky." In Hinduism, the sky (or "Akasha") is considered one of the five classical elements, representing the ether or space that holds all things. Indigenous cultures across the globe have long seen the sky as a sacred realm, rich with stories of gods, ancestors, and cosmic forces.
The Sky in the Age of Science and Space Exploration

In modern times, our understanding of the sky has expanded dramatically. No longer just a ceiling over our world, the sky is now seen as a gateway to the universe. Astronomers study the night sky to understand the origins of galaxies, stars, and planets. Meteorologists observe sky conditions to predict weather patterns and climate shifts. Pilots, astronauts, and satellite engineers all rely on careful observation of the sky’s behavior.

The sky has also been a frontier of dreams and ambition. When Yuri Gagarin first traveled into space in 1961, he famously remarked, “I see Earth. It is so beautiful.” That moment marked a turning point—when humanity stopped merely looking at the sky and began venturing into it.

Today, our satellites, telescopes, and spacecraft help us look far beyond the blue canopy we once thought was the edge of existence. Yet, even with all our technological advances, the sky still retains its capacity to inspire awe. Watching a sunset, witnessing an eclipse, or simply lying on your back under the stars remains an experience that connects us deeply with the natural world.
Psychological and Biological Effects

Interestingly, the color of the sky can also affect our moods, mental states, and even physiology. Bright blue skies, especially when paired with sunlight, have been shown to elevate mood and increase serotonin levels. People with Seasonal Affective Disorder (SAD) often report feeling more energized and positive on sunny days compared to overcast ones.

On the other hand, prolonged periods of grey skies can contribute to feelings of depression or fatigue. In this way, the color of the sky acts not just as a visual phenomenon, but as a powerful force in shaping human experience.
Conclusion

The color of the sky is a dynamic interplay of light, air, perception, and meaning. Scientifically, it is an elegant demonstration of how tiny particles can influence the vast dome we see above us. Culturally, it is a wellspring of inspiration and spiritual symbolism. Emotionally, it connects deeply with the rhythms of our daily lives and inner worlds.

Whether pale at dawn, brilliant at noon, radiant at sunset, or mysterious at night, the sky is never the same twice. It is both universal and deeply personal—a daily reminder that beauty and complexity often lie in the things we take most for granted. In observing the sky, we not only look outward, but also inward, connecting to our place in the world and the cosmos beyond.

Nothing can beat the transcendent beauty of the sky. There is a little bit of sky in all of us, and it is our duty to find it through meaningful action. Sometimes the personal sky is filled with dark, cloudy skies. This is the doubt that resides within us, the challenge to be conquered. Rest assured that beyond this cloudy cover, there is a vast, seemingly infinite expanse of bliss. 
    """
    
    result = analyzer.analyze_text(sample_text)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()