import torch 
from transformers import PegasusTokenizer, PegasusForConditionalGeneration
from typing import Dict, Any, List 
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import warnings 

warnings.filterwarnings('ignore')

class DocumentSummarizerMain: 
    def __init__(self, model_name : str = "google/pegasus-xsum"):
        """
        Initialize the pegasus summarizer

        Args:
            model_name: Hugging Face model identifier
        """
        self.model_name = model_name

        try:
            self.tokenizer = PegasusTokenizer.from_pretrained(model_name)
            self.model = PegasusForConditionalGeneration.from_pretrained(model_name)
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(self.device)
            print(f"DocumentSummarizer initialized with {model_name} on {self.device}")

        except Exception as e:
            self.tokenizer = None
            self.model = None
            raise Exception(f"Failed to load summarization model: {e}")
        
    def _chunk_text_for_summarization(self, text: str, max_tokens: int = 512) -> List[str]:
        """
        Split text into chunks suitable for Pegasus (max 512 tokens).
        Preserves sentence boundaries when possible.
        """
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            test_chunk = current_chunk + sentence + ". "
            tokens = self.tokenizer.encode(test_chunk, add_special_tokens=True, truncation=False)
            
            if len(tokens) <= max_tokens:
                current_chunk = test_chunk
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = sentence + ". "
                else:
                    # Single sentence is too long, truncate it
                    truncated = self.tokenizer.decode(
                        self.tokenizer.encode(sentence, max_length=max_tokens-2, truncation=True)
                    )
                    chunks.append(truncated + ".")
                    current_chunk = ""
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks

    def _generate_summary(self, text: str) -> str:
        """Generate summary for a single text chunk."""
        # Tokenize input
        inputs = self.tokenizer.encode(
            text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(self.device)
        
        # Generate summary
        with torch.no_grad():
            summary_ids = self.model.generate(
                inputs,
                max_length=150,          # Pegasus-XSum typically generates shorter summaries
                min_length=30,
                length_penalty=2.0,      # Encourage concise summaries
                num_beams=4,             # Beam search for better quality
                early_stopping=True,
                no_repeat_ngram_size=3  # Avoid repetition
            )
        
        # Decode summary
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary.strip()

    def _combine_chunk_summaries(self, summaries: List[str]) -> str:
        """
        Combine multiple chunk summaries into a single coherent paragraph.
        For very long documents with multiple chunks.
        """
        if len(summaries) == 1:
            return summaries[0]
        
        # Join summaries and re-summarize if needed
        combined_text = " ".join(summaries)
        
        # If combined summaries are still reasonable length, return as-is
        if len(combined_text.split()) <= 200:
            return combined_text
        
        # Otherwise, summarize the summaries
        try:
            final_summary = self._generate_summary(combined_text)
            return final_summary
        except:
            # Fallback: return first summary if re-summarization fails
            return summaries[0]

    def summarize_document(self, text: str) -> Dict[str, Any]:
        """
        Generate a document summary with metadata.
        
        Args:
            text: Input text to summarize
            
        Returns:
            Dictionary containing summary and metadata
        """
        if not self.model or not self.tokenizer:
            return {
                'summary': 'Summarization model not available',
                'method': 'error',
                'confidence': 0.0,
                'chunks_processed': 0
            }

        if not text.strip():
            return {
                'summary': 'No text provided for summarization',
                'method': 'empty',
                'confidence': 0.0,
                'chunks_processed': 0
            }

        # Check if text is too short to meaningfully summarize
        word_count = len(text.split())
        if word_count < 50:
            return {
                'summary': text[:500] + "..." if len(text) > 500 else text,
                'method': 'passthrough',
                'confidence': 1.0,
                'chunks_processed': 0,
                'original_word_count': word_count
            }

        try:
            # Determine chunking strategy
            tokens = self.tokenizer.encode(text, add_special_tokens=True, truncation=False)
            
            if len(tokens) <= 512:
                # Single chunk processing
                summary = self._generate_summary(text)
                chunks_processed = 1
            else:
                # Multi-chunk processing
                chunks = self._chunk_text_for_summarization(text)
                chunk_summaries = []
                
                for chunk in chunks:
                    if chunk.strip():
                        chunk_summary = self._generate_summary(chunk)
                        chunk_summaries.append(chunk_summary)
                
                summary = self._combine_chunk_summaries(chunk_summaries)
                chunks_processed = len(chunk_summaries)

            return {
                'summary': summary,
                'method': 'pegasus-xsum',
                'confidence': 0.85,  # Pegasus-XSum generally produces reliable summaries
                'chunks_processed': chunks_processed,
                'original_word_count': word_count,
                'summary_word_count': len(summary.split()),
                'compression_ratio': round(len(summary.split()) / word_count, 2)
            }

        except Exception as e:
            return {
                'summary': f'Error during summarization: {str(e)}',
                'method': 'error',
                'confidence': 0.0,
                'chunks_processed': 0,
                'error': str(e)
            }


# adding a second, simpler document summarizer model with facebook's bart-large-cnn model
# document_summarizer_alt.py
from transformers import pipeline
from typing import Dict, Any


class DocumentSummarizerAlt:
    def __init__(self):
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    
    def summarize_document(self, text: str) -> Dict[str, Any]:
        """Generate document summary with metadata."""
        if not text.strip():
            return {
                'summary': 'No text provided for summarization',
                'method': 'empty',
                'confidence': 0.0,
                'original_word_count': 0,
                'summary_word_count': 0,
                'compression_ratio': 0.0
            }
        
        # Check if text is too short to meaningfully summarize
        word_count = len(text.split())
        if word_count < 50:
            return {
                'summary': text[:500] + "..." if len(text) > 500 else text,
                'method': 'passthrough',
                'confidence': 1.0,
                'original_word_count': word_count,
                'summary_word_count': word_count,
                'compression_ratio': 1.0
            }
        
        try:
            result = self.summarizer(text,
                                    max_length=300,
                                    min_length=50,
                                    do_sample=False,
                                    truncation=True)  # Add truncation for safety
            
            original_word_count = len(text.split())
            summary_word_count = len(result[0]['summary_text'].split())
            
            # Fixed compression ratio calculation
            compression_ratio = round(summary_word_count / original_word_count, 2) if original_word_count > 0 else 0.0
            
            return {
                'summary': result[0]['summary_text'],
                'method': 'abstractive',
                'confidence': result[0].get('score', 0.8),
                'original_word_count': original_word_count,
                'summary_word_count': summary_word_count,
                'compression_ratio': compression_ratio
            }
            
        except Exception as e:
            return {
                'summary': f"Error generating summary: {str(e)}",
                'method': 'error',
                'confidence': 0.0,
                'original_word_count': len(text.split()) if text else 0,
                'summary_word_count': 0,
                'compression_ratio': 0.0
            }
