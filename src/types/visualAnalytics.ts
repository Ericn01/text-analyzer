import {ChartDataPoint, XYDataPoint} from './coreAnalytics';

// Visual analytics interfaces
export interface WordFrequencyData {
    top_words: Array<{
        word: string;
        count: number;
        percentage: number;
    }>;
    chart_data: ChartDataPoint[];
}

export interface WordLengthDistribution {
    buckets: Array<{
        length: string;
        count: number;
        percentage: number;
    }>;
    chart_data: ChartDataPoint[];
}

export interface SentenceLengthTrends {
    data_points: Array<{
        sentence: number;
        length: number;
        paragraph: number;
    }>;
    chart_data: XYDataPoint[];
    average_length: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PartsOfSpeech {
    breakdown: {
        nouns: { count: number; percentage: number };
        verbs: { count: number; percentage: number };
        adjectives: { count: number; percentage: number };
        adverbs: { count: number; percentage: number };
        prepositions: { count: number; percentage: number };
        pronouns: { count: number; percentage: number };
        conjunctions: { count: number; percentage: number };
        articles: { count: number; percentage: number };
    };
    chart_data: ChartDataPoint[];
}

export interface VisualAnalytics {
    word_frequency: WordFrequencyData;
    word_length_distribution: WordLengthDistribution;
    sentence_length_trends: SentenceLengthTrends;
    parts_of_speech: PartsOfSpeech;
}
