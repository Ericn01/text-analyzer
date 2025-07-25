import spacy
from typing import Dict, Any, List, Tuple

# Import the new modules
from models.readability_analyzer import ReadabilityPredictor
from models.sentiment_analyzer import SentimentAnalyzer
from models.keyword_extractor import KeywordExtractor
from models.topic_modeler import TopicModeler
from models.language_analyzer import LanguageAnalyzer
from models.process_text import TextPreprocessor, TextQualityReport, PreprocessingConfig

import warnings
warnings.filterwarnings('ignore') # Suppress warnings, especially from transformers

class NLPAnalyzer:
    def __init__(self):
        """Initialize with multiple lightweight models"""
        try:
            self.nlp = spacy.load("en_core_web_md")
        except OSError:
            raise Exception("Please install spaCy medium model: python -m spacy download en_core_web_md")
        
        # Configuration to improve the text quality for analysis
        preprocessing_config = PreprocessingConfig()

        # Initialize text preprocessor
        self.preprocessor = TextPreprocessor(preprocessing_config)

        # Initialize refactored components
        self.sentiment_analyzer = SentimentAnalyzer()
        self.keyword_extractor = KeywordExtractor()
        self.topic_modeler = TopicModeler(self.nlp) # Pass spaCy model for topic modeling
        self.readability_predictor = ReadabilityPredictor()

        # Pass emotion words to language analyzer (as it needs it for objectivity score)
        self.language_analyzer = LanguageAnalyzer(self.sentiment_analyzer.emotion_words) 

    def preprocess_text(self, text: str) -> Tuple[str, TextQualityReport]:
        """
        Preprocess text for analysis.
        
        Args:
            text: Raw input text
            
        Returns:
            Tuple of (processed_text, quality_report)
        """
        return self.preprocessor.preprocess(text)

    def analyze_text(self, text: str, skip_preprocessing: bool = False) -> Dict[str, Any]:
        """
        Main analysis function that returns the complete analysis.
        
        Args:
            text: Input text to analyze
            skip_preprocessing: If True, skip text preprocessing (not recommended)
            
        Returns:
            Dictionary containing all analysis results
        """
        # Preprocessing step
        quality_report = None
        if not skip_preprocessing:
            original_text = text
            text, quality_report = self.preprocess_text(text)
            
        # Check if text is still viable for analysis
        if not text.strip():
            return {
                "error": "Text is empty after preprocessing",
                "preprocessing_report": quality_report,
                "sentiment_analysis": None,
                "keyword_extraction": None,
                "topic_modeling": None,
                "language_patterns": None,
                "readability_prediction": None
            }

        # Process with spaCy
        try:
            doc = self.nlp(text)
            sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
        except Exception as e:
            return {
                "error": f"spaCy processing failed: {e}",
                "preprocessing_report": quality_report
            }

        # Run all analyses
        try:
            sentiment_analysis = self.sentiment_analyzer.analyze_sentiment(text, doc, sentences)
            keyword_extraction = self.keyword_extractor.extract_keywords(text, doc)
            topic_modeling = self.topic_modeler.model_topics(text, sentences, doc)
            language_patterns = self.language_analyzer.analyze_language_patterns(text, sentences, doc)
            readability_prediction = self.readability_predictor.predict_difficulty(text)

            results = {
                "preprocessing_report": quality_report,
                "sentiment_analysis": sentiment_analysis,
                "keyword_extraction": keyword_extraction,
                "topic_modeling": topic_modeling,
                "language_patterns": language_patterns,
                "readability_prediction": readability_prediction,
                "text_stats": {
                    "original_length": quality_report.original_length if quality_report else len(text),
                    "processed_length": len(text),
                    "sentences_count": len(sentences),
                    "words_count": len(text.split()),
                    "quality_score": quality_report.quality_score.value if quality_report else "unknown",
                    "processing_report": quality_report
                }
            }
            return results
        
        except Exception as e:
            return {
                "error": f"Analysis failed: {e}",
                "preprocessing_report": quality_report
            }
        
    def batch_analyze(self, texts: List[str], skip_preprocessing: bool = False) -> List[Dict[str, Any]]:
        """
        Analyze multiple texts efficiently.
        
        Args:
            texts: List of texts to analyze
            skip_preprocessing: If True, skip text preprocessing
            
        Returns:
            List of analysis results
        """
        results = []
        for i, text in enumerate(texts):
            try:
                result = self.analyze_text(text, skip_preprocessing)
                result['batch_index'] = i
                results.append(result)
            except Exception as e:
                results.append({
                    'batch_index': i,
                    'error': str(e),
                    'preprocessing_report': None
                })
        
        return results