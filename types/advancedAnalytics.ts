import { KeywordItem, KeyPhrase, NamedEntity } from "./coreAnalytics";

export interface SentimentAnalysis {
    overall_sentiment: {
        score: number;
        label: 'Positive' | 'Negative' | 'Neutral';
        percentage: number;
        confidence: number;
    };
    sentiment_distribution: {
        positive: { percentage: number; sentences: number };
        neutral: { percentage: number; sentences: number };
        negative: { percentage: number; sentences: number };
    };
    emotional_tone: {
        joy: number;
        anger: number;
        fear: number;
        sadness: number;
        surprise: number;
        disgust: number;
    };
    description: string;
}

export interface KeywordExtraction {
    keywords: KeywordItem[];
    key_phrases?: KeyPhrase[];
    named_entities?: NamedEntity[];
}

export interface TopicModelingTopic {
    id: string;
    name: string;
    percentage: number;
    keywords: string[];
    description: string;
}

export interface TopicEvolution {
    topic: string;
    paragraph_range: string;
    intensity: number;
}

export interface TopicModeling {
    primary_topics: TopicModelingTopic[];
    topic_coherence_score?: number;
    topic_evolution?: TopicEvolution[];
}

export interface LanguagePatterns {
    complexity_metrics: {
        average_syllables_per_word: number;
        polysyllabic_words: number;
        technical_terms: number;
        passive_voice_percentage: number;
    };
    stylistic_features: {
        formal_language_score: number;
        academic_tone_score: number;
        objectivity_score: number;
        clarity_score: number;
    };
}

export interface NLPReadingLevel {
    difficulty_score: number;
    description: string;
    method: string;
}

export interface ProcessedTextStats {
    original_length: number;
    processed_length: number;
    sentences_count: number;
    words_count: number;
    quality_score: number;
    processing_report?: QualityReport;
}

export interface QualityReport {
    original_length:  number;
    processed_length: number;
    quality_score: "excellent" | "good" | "fair" | "poor" | "unasable";
    issues_found?: string[];
    corrections_applied: string[];
    sentences_count: number;
    words_count: number;
    chars_removed: number;
}

export interface AdvancedFeatures {
    sentiment_analysis: SentimentAnalysis;
    keyword_extraction: KeywordExtraction;
    topic_modeling: TopicModeling;
    language_patterns: LanguagePatterns;
    readability_prediction: NLPReadingLevel;
    text_stats?: ProcessedTextStats;
}