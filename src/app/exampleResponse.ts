import { TextAnalyticsResponse } from "./types/analyticsResponse";

export const analyticsData : TextAnalyticsResponse = {
  "success": true,
  "timestamp": "2025-01-15T10:30:00Z",
  "processing_time_ms": 2340,
  "document": {
    "filename": "sample-document.pdf",
    "original_name": "Research Paper - Data Analysis.pdf",
    "type": "pdf",
    "size_bytes": 245760,
    "uploaded_at": "2025-01-15T10:28:00Z",
    "category": "Academic Paper"
  },
  "summary": {
    "total_words": 3247,
    "reading_time_minutes": 12,
    "sentiment_score": 0.72,
    "reading_level": 8.2,
    "writing_style": "Formal academic tone with technical vocabulary",
    "key_topics": ["Data analysis", "Machine learning", "Statistics"],
    "complexity_level": "College-level reading difficulty"
  },
  "basic_analytics": {
    "overview": {
      "total_words": 3247,
      "unique_words": 1182,
      "sentences": 156,
      "paragraphs": 28,
      "characters": 18432,
      "average_words_per_sentence": 20.8,
      "lexical_diversity": 0.364
    },
    "structure": {
      "headings": 12,
      "lists": 8,
      "bold_instances": 34,
      "italic_instances": 18,
      "links": 5,
      "images": 3,
      "tables": 2,
      "footnotes": 7
    },
    "readability": {
      "flesch_reading_ease": {
        "score": 58.3,
        "description": "Fairly difficult to read",
        "percentage": 58
      },
      "flesch_kincaid_grade": {
        "score": 8.2,
        "description": "8th to 9th grade level",
        "percentage": 68
      },
      "smog_index": {
        "score": 9.1,
        "description": "9th grade level",
        "percentage": 76
      },
      "automated_readability_index": {
        "score": 7.8,
        "description": "7th to 8th grade level",
        "percentage": 65
      }
    }
  },
  "visual_analytics": {
    "word_frequency": {
      "top_words": [
        { "word": "data", "count": 87, "percentage": 2.68 },
        { "word": "analysis", "count": 65, "percentage": 2.00 },
        { "word": "machine", "count": 43, "percentage": 1.32 },
        { "word": "learning", "count": 42, "percentage": 1.29 },
        { "word": "statistical", "count": 38, "percentage": 1.17 }
      ],
      "chart_data": [
        { "label": "data", "value": 87 },
        { "label": "analysis", "value": 65 },
        { "label": "machine", "value": 43 }
      ]
    },
    "word_length_distribution": {
      "buckets": [
        { "length": "1-3", "count": 245, "percentage": 12.3 },
        { "length": "4-6", "count": 892, "percentage": 44.8 },
        { "length": "7-9", "count": 654, "percentage": 32.9 },
        { "length": "10-12", "count": 156, "percentage": 7.8 },
        { "length": "13+", "count": 44, "percentage": 2.2 }
      ],
      "chart_data": [
        { "label": "1-3 chars", "value": 245 },
        { "label": "4-6 chars", "value": 892 },
        { "label": "7-9 chars", "value": 654 },
        { "label": "10-12 chars", "value": 156 },
        { "label": "13+ chars", "value": 44 }
      ]
    },
    "sentence_length_trends": {
      "data_points": [
        { "sentence": 1, "length": 18, "paragraph": 1 },
        { "sentence": 2, "length": 22, "paragraph": 1 },
        { "sentence": 3, "length": 15, "paragraph": 1 }
      ],
      "chart_data": [
        { "x": 1, "y": 18 },
        { "x": 2, "y": 22 },
        { "x": 3, "y": 15 }
      ],
      "average_length": 20.8,
      "trend": "stable"
    },
    "parts_of_speech": {
      "breakdown": {
        "nouns": { "count": 1247, "percentage": 38.4 },
        "verbs": { "count": 623, "percentage": 19.2 },
        "adjectives": { "count": 445, "percentage": 13.7 },
        "adverbs": { "count": 287, "percentage": 8.8 },
        "prepositions": { "count": 324, "percentage": 10.0 },
        "pronouns": { "count": 156, "percentage": 4.8 },
        "conjunctions": { "count": 89, "percentage": 2.7 },
        "articles": { "count": 76, "percentage": 2.3 }
      },
      "chart_data": [
        { "label": "Nouns", "value": 38.4, "color": "#FF6B6B" },
        { "label": "Verbs", "value": 19.2, "color": "#4ECDC4" },
        { "label": "Adjectives", "value": 13.7, "color": "#45B7D1" },
        { "label": "Adverbs", "value": 8.8, "color": "#96CEB4" },
        { "label": "Other", "value": 19.9, "color": "#FFEAA7" }
      ]
    }
  },
  "advanced_features": {
    "sentiment_analysis": {
      "overall_sentiment": {
        "score": 0.72,
        "label": "Positive",
        "percentage": 72,
        "confidence": 0.89
      },
      "sentiment_distribution": {
        "positive": { "percentage": 72, "sentences": 112 },
        "neutral": { "percentage": 21, "sentences": 33 },
        "negative": { "percentage": 7, "sentences": 11 }
      },
      "emotional_tone": {
        "joy": 0.34,
        "anger": 0.02,
        "fear": 0.05,
        "sadness": 0.03,
        "surprise": 0.15,
        "disgust": 0.01
      },
      "description": "The document maintains a predominantly positive tone with confident language and optimistic projections."
    },
    "keyword_extraction": {
      "keywords": [
        { "word": "data analysis", "score": 0.94, "frequency": 23 },
        { "word": "machine learning", "score": 0.88, "frequency": 19 },
        { "word": "statistical methods", "score": 0.82, "frequency": 15 },
        { "word": "research methodology", "score": 0.78, "frequency": 12 },
        { "word": "findings", "score": 0.75, "frequency": 18 }
      ],
      "key_phrases": [
        { "phrase": "significant correlation", "frequency": 8, "positions": [23, 145, 267] },
        { "phrase": "data-driven approach", "frequency": 6, "positions": [89, 234, 445] },
        { "phrase": "statistical significance", "frequency": 11, "positions": [45, 178, 298] }
      ],
      "named_entities": [
        { "entity": "Python", "type": "TECHNOLOGY", "frequency": 5 },
        { "entity": "2024", "type": "DATE", "frequency": 3 },
        { "entity": "University of California", "type": "ORGANIZATION", "frequency": 2 }
      ]
    },
    "topic_modeling": {
      "primary_topics": [
        {
          "id": "topic_1",
          "name": "Statistical Analysis",
          "percentage": 32,
          "keywords": ["statistics", "analysis", "correlation", "regression"],
          "description": "Focus on statistical methods and analytical approaches"
        },
        {
          "id": "topic_2", 
          "name": "Machine Learning Applications",
          "percentage": 28,
          "keywords": ["machine learning", "algorithm", "model", "prediction"],
          "description": "Discussion of ML techniques and applications"
        },
        {
          "id": "topic_3",
          "name": "Data Visualization",
          "percentage": 24,
          "keywords": ["visualization", "chart", "graph", "dashboard"],
          "description": "Methods for presenting and visualizing data"
        },
        {
          "id": "topic_4",
          "name": "Research Methodology",
          "percentage": 16,
          "keywords": ["methodology", "research", "study", "approach"],
          "description": "Research design and methodological considerations"
        }
      ],
      "topic_coherence_score": 0.84,
      "topic_evolution": [
        { "topic": "Statistical Analysis", "paragraph_range": "1-8", "intensity": 0.8 },
        { "topic": "Machine Learning Applications", "paragraph_range": "9-18", "intensity": 0.9 },
        { "topic": "Data Visualization", "paragraph_range": "19-24", "intensity": 0.7 },
        { "topic": "Research Methodology", "paragraph_range": "25-28", "intensity": 0.6 }
      ]
    },
    "language_patterns": {
      "complexity_metrics": {
        "average_syllables_per_word": 2.3,
        "polysyllabic_words": 234,
        "technical_terms": 89,
        "passive_voice_percentage": 15.2
      },
      "stylistic_features": {
        "formal_language_score": 0.87,
        "academic_tone_score": 0.92,
        "objectivity_score": 0.78,
        "clarity_score": 0.71
      }
    }
  },
  "metadata": {
    "language": "en",
    "encoding": "utf-8",
    "processing_version": "1.2.3",
    "models_used": {
      "sentiment": "distilbert-base-uncased-finetuned-sst-2-english",
      "topic_modeling": "all-MiniLM-L6-v2",
      "pos_tagging": "en_core_web_sm"
    }
  },
  "errors": [],
  "warnings": [
    "Some characters may not have been processed correctly due to encoding issues"
  ]
}