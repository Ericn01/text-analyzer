import unicodedata
from typing import List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import re

@dataclass
class PreprocessingConfig:
    """Configuration for text preprocessing options."""
    # Basic cleaning
    normalize_unicode: bool = True
    fix_common_typos: bool = True
    
    # Text normalization
    normalize_whitespace: bool = True
    normalize_quotes: bool = True
    normalize_hyphens: bool = True
    normalize_ellipses: bool = True
    
    # Content filtering
    remove_urls: bool = True
    remove_emails: bool = True
    remove_phone_numbers: bool = True
    remove_social_handles: bool = True
    
    # Text structure
    preserve_sentence_boundaries: bool = True
    min_sentence_length: int = 3
    max_sentence_length: int = 1000
    
    # Quality control
    min_text_length: int = 10
    max_text_length: int = 100000
    check_language: bool = True
    expected_language: str = "en"
    
    # Advanced options
    remove_repeated_chars: bool = True
    fix_spacing_around_punctuation: bool = True
    normalize_contractions: bool = True

class TextQuality(Enum):
    """Enumeration for text quality levels."""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNUSABLE = "unusable"


@dataclass
class TextQualityReport:
    """Report on text quality and preprocessing results."""
    original_length: int
    processed_length: int
    quality_score: TextQuality
    issues_found: List[str]
    corrections_applied: List[str]
    sentences_count: int
    words_count: int
    chars_removed: int


class TextPreprocessor:
    """Comprehensive text preprocessing for NLP analysis."""
    
    def __init__(self, config: Optional[PreprocessingConfig] = None):
        self.config = config or PreprocessingConfig()
        self._setup_patterns()
        
    def _setup_patterns(self):
        """Initialize regex patterns for text cleaning."""
        # URLs (comprehensive pattern)
        self.url_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            r'|www\.(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            r'|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}'
        )
        
        # Email addresses
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        
        # Phone numbers (various formats)
        self.phone_pattern = re.compile(
            r'(\+?1[-.\s]?)?'
            r'(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})'
            r'|(\+?[0-9]{1,3}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})'
        )
        
        # Social media handles
        self.social_handle_pattern = re.compile(r'@[A-Za-z0-9_]+|#[A-Za-z0-9_]+')
        
        # Repeated characters (3 or more)
        self.repeated_chars_pattern = re.compile(r'(.)\1{2,}')
        
        # Multiple whitespace
        self.whitespace_pattern = re.compile(r'\s+')
        
        # Common contractions
        self.contractions = {
            "ain't": "are not", "aren't": "are not", "can't": "cannot",
            "couldn't": "could not", "didn't": "did not", "doesn't": "does not",
            "don't": "do not", "hadn't": "had not", "hasn't": "has not",
            "haven't": "have not", "he'd": "he would", "he'll": "he will",
            "he's": "he is", "i'd": "i would", "i'll": "i will", "i'm": "i am",
            "i've": "i have", "isn't": "is not", "it'd": "it would",
            "it'll": "it will", "it's": "it is", "let's": "let us",
            "shouldn't": "should not", "that's": "that is", "there's": "there is",
            "they'd": "they would", "they'll": "they will", "they're": "they are",
            "they've": "they have", "we'd": "we would", "we're": "we are",
            "we've": "we have", "weren't": "were not", "what's": "what is",
            "where's": "where is", "who's": "who is", "won't": "will not",
            "wouldn't": "would not", "you'd": "you would", "you'll": "you will",
            "you're": "you are", "you've": "you have"
        }
    
    def preprocess(self, text: str) -> Tuple[str, TextQualityReport]:
        """
        Comprehensive text preprocessing pipeline.
        
        Args:
            text: Raw input text
            
        Returns:
            Tuple of (processed_text, quality_report)
        """
        if not isinstance(text, str):
            text = str(text)
            
        original_text = text
        issues_found = []
        corrections_applied = []
        
        # Initial quality checks
        if len(text) < self.config.min_text_length:
            issues_found.append(f"Text too short ({len(text)} chars)")
        if len(text) > self.config.max_text_length:
            issues_found.append(f"Text too long ({len(text)} chars), will be truncated")
            text = text[:self.config.max_text_length]
            corrections_applied.append("Truncated to maximum length")
        
        # Unicode normalization
        if self.config.normalize_unicode:
            original_len = len(text)
            text = unicodedata.normalize('NFKC', text)
            if len(text) != original_len:
                corrections_applied.append("Normalized Unicode")
        
        # Remove unwanted content
        if self.config.remove_urls:
            url_count = len(self.url_pattern.findall(text))
            if url_count > 0:
                text = self.url_pattern.sub(' ', text)
                corrections_applied.append(f"Removed {url_count} URLs")
        
        if self.config.remove_emails:
            email_count = len(self.email_pattern.findall(text))
            if email_count > 0:
                text = self.email_pattern.sub(' ', text)
                corrections_applied.append(f"Removed {email_count} email addresses")
        
        if self.config.remove_phone_numbers:
            phone_count = len(self.phone_pattern.findall(text))
            if phone_count > 0:
                text = self.phone_pattern.sub(' ', text)
                corrections_applied.append(f"Removed {phone_count} phone numbers")
        
        if self.config.remove_social_handles:
            handle_count = len(self.social_handle_pattern.findall(text))
            if handle_count > 0:
                text = self.social_handle_pattern.sub(' ', text)
                corrections_applied.append(f"Removed {handle_count} social media handles")
        
        # Text normalization
        if self.config.normalize_quotes:
            text = re.sub(r'[""''`´]', '"', text)
            text = re.sub(r'[''`´]', "'", text)
            corrections_applied.append("Normalized quotes")
        
        if self.config.normalize_hyphens:
            text = re.sub(r'[–—]', '-', text)
            corrections_applied.append("Normalized hyphens")
        
        if self.config.normalize_ellipses:
            text = re.sub(r'\.{2,}', '...', text)
            corrections_applied.append("Normalized ellipses")
        
        # Fix repeated characters
        if self.config.remove_repeated_chars:
            repeated_matches = self.repeated_chars_pattern.findall(text)
            if repeated_matches:
                text = self.repeated_chars_pattern.sub(r'\1\1', text)
                corrections_applied.append(f"Fixed {len(repeated_matches)} repeated character sequences")
        
        # Expand contractions
        if self.config.normalize_contractions:
            contraction_count = 0
            for contraction, expansion in self.contractions.items():
                if contraction in text.lower():
                    text = re.sub(r'\b' + re.escape(contraction) + r'\b', expansion, text, flags=re.IGNORECASE)
                    contraction_count += 1
            if contraction_count > 0:
                corrections_applied.append(f"Expanded {contraction_count} contractions")
        
        # Fix spacing around punctuation
        if self.config.fix_spacing_around_punctuation:
            # Add space after punctuation if missing
            text = re.sub(r'([.!?])([A-Za-z])', r'\1 \2', text)
            # Remove space before punctuation
            text = re.sub(r'\s+([.!?,:;])', r'\1', text)
            corrections_applied.append("Fixed punctuation spacing")
        
        # Normalize whitespace
        if self.config.normalize_whitespace:
            original_len = len(text)
            text = self.whitespace_pattern.sub(' ', text).strip()
            if len(text) != original_len:
                corrections_applied.append("Normalized whitespace")
        
        # Quality assessment
        quality_score = self._assess_quality(text, issues_found)
        
        # Count sentences and words for report
        sentences = text.split('. ')
        sentences_count = len([s for s in sentences if len(s.strip()) >= self.config.min_sentence_length])
        words_count = len(text.split())
        chars_removed = len(original_text) - len(text)
        
        quality_report = TextQualityReport(
            original_length=len(original_text),
            processed_length=len(text),
            quality_score=quality_score,
            issues_found=issues_found,
            corrections_applied=corrections_applied,
            sentences_count=sentences_count,
            words_count=words_count,
            chars_removed=chars_removed
        )
        
        return text, quality_report
    
    def _assess_quality(self, text: str, issues: List[str]) -> TextQuality:
        """Assess overall text quality based on various factors."""
        if not text.strip():
            return TextQuality.UNUSABLE
        
        score = 100
        
        # Deduct points for issues
        score -= len(issues) * 10
        
        # Check text length
        if len(text) < 50:
            score -= 20
        elif len(text) < 100:
            score -= 10
        
        # Check for proper sentences
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if len(sentences) < 2:
            score -= 15
        
        # Check for word diversity (simple metric)
        words = text.lower().split()
        if len(words) > 0:
            unique_ratio = len(set(words)) / len(words)
            if unique_ratio < 0.3:
                score -= 20
            elif unique_ratio < 0.5:
                score -= 10
        
        # Determine quality level
        if score >= 85:
            return TextQuality.EXCELLENT
        elif score >= 70:
            return TextQuality.GOOD
        elif score >= 50:
            return TextQuality.FAIR
        elif score >= 30:
            return TextQuality.POOR
        else:
            return TextQuality.UNUSABLE