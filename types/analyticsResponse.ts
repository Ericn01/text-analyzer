import { DocumentInfo, AnalyticsSummary, BasicAnalytics } from "./basicAnalytics";
import { VisualAnalytics } from "./visualAnalytics";
import { AdvancedFeatures } from "./advancedAnalytics";


// Metadata interface
export interface AnalyticsMetadata {
    language: string;
    encoding: string;
    processing_version: string;
    models_used: {
        sentiment: string;
        topic_modeling: string;
        pos_tagging: string;
    };
}

// Main response interface
export interface TextAnalyticsResponse {
    success: boolean;
    timestamp: string;
    processing_time_ms: number;
    document: DocumentInfo;
    summary: AnalyticsSummary;
    basic_analytics: BasicAnalytics;
    visual_analytics: VisualAnalytics;
    advanced_features: AdvancedFeatures;
    metadata: AnalyticsMetadata;
    errors: string[];
    warnings: string[];
}