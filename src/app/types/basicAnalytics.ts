// Document metadata
export interface DocumentInfo {
    filename: string;
    original_name: string;
    type: 'pdf' | 'txt' | 'docx';
    size_bytes: number;
    uploaded_at: string;
    category: string;
}

// Summary section
export interface AnalyticsSummary {
    total_words: number;
    reading_time_minutes: number;
    sentiment_score: number;
    reading_level: number;
    writing_style: string;
    key_topics: string[];
    complexity_level: string;
}

// Basic analytics interfaces
export interface OverviewMetrics {
    total_words: number;
    unique_words: number;
    sentences: number;
    paragraphs: number;
    characters: number;
    average_words_per_sentence: number;
    lexical_diversity: number;
}

export interface StructureMetrics {
    headings: number;
    lists: number;
    bold_instances: number;
    italic_instances: number;
    links: number;
    images: number;
    tables: number;
    footnotes: number;
}

export interface ReadabilityMetric {
    score: number;
    description: string;
    percentage: number;
}


export interface ReadabilityMetrics {
    flesch_reading_ease: ReadabilityMetric;
    flesch_kincaid_grade: ReadabilityMetric;
    smog_index: ReadabilityMetric;
    automated_readability_index: ReadabilityMetric;
}

export interface BasicAnalytics {
    overview: OverviewMetrics;
    structure: StructureMetrics;
    readability: ReadabilityMetrics;
}