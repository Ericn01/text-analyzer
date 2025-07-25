import re
from typing import List, Dict, Any

class LanguageAnalyzer:
    def __init__(self, emotion_words):
        self.emotion_words = emotion_words

    def analyze_language_patterns(self, text: str, sentences: List[str], doc) -> Dict[str, Any]:
    
        words = [token for token in doc if token.is_alpha and not token.is_punct]
        num_words = len(words)
        num_sentences = len(sentences) if len(sentences) > 0 else 1 # Avoid division by zero
        
        def count_syllables_simple(word):
            word = word.lower()
            if not word: return 0
            count = 0
            vowels = "aeiouy"
            word = re.sub(r"([aeiouy])e\b", r"\1", word)
            word = re.sub(r"[^aeiouy]+", "#", word)
            word = re.sub(r"[aeiouy]{2,}", "!", word)
            count = len(word.replace("#", ""))
            return max(1, count)
        
        syllable_counts = [count_syllables_simple(token.text) for token in words]
        avg_syllables_per_word = sum(syllable_counts) / num_words if num_words else 0
        polysyllabic_words = sum(1 for count in syllable_counts if count >= 3)
        
        technical_terms = sum(1 for token in words if len(token.text) > 7 or token.pos_ in ['PROPN'])
        
        passive_count = sum(1 for token in doc if token.dep_ == 'auxpass' or (token.dep_ == 'agent' and token.head.pos_ == 'VERB'))
        passive_percentage = (passive_count / num_sentences) * 100 if num_sentences else 0
        
        formal_indicators = {'therefore', 'however', 'moreover', 'furthermore', 'consequently', 'nevertheless', 'nonetheless'}
        academic_indicators = {'research', 'study', 'analysis', 'data', 'findings', 'conclusion', 'hypothesis', 'methodology'}
        
        formal_count = sum(1 for token in doc if token.lemma_.lower() in formal_indicators)
        academic_count = sum(1 for token in doc if token.lemma_.lower() in academic_indicators)
        
        formal_score = formal_count / num_words if num_words else 0
        academic_score = academic_count / num_words if num_words else 0
        
        personal_pronouns = sum(1 for token in doc if token.pos_ == 'PRON' and token.lemma_.lower() in ['i', 'me', 'my', 'we', 'us', 'our'])
        
        emotional_words_count = sum(1 for token in doc for emotion_set in self.emotion_words.values() if token.lemma_.lower() in emotion_set)
        
        subjectivity_indicators = personal_pronouns + emotional_words_count
        objectivity_score = max(0, 1 - (subjectivity_indicators / num_words)) if num_words else 0
        
        avg_sentence_length_words = num_words / num_sentences
        clarity_score = max(0.1, 1 - (avg_sentence_length_words / 20))
        
        return {
            "complexity_metrics": {
                "average_syllables_per_word": round(avg_syllables_per_word, 2),
                "polysyllabic_words": polysyllabic_words,
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