'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from './Navigation';
import ExecutiveSummary from './ExecutiveSummary';
import { TextAnalyticsResponse } from '../../../types/analyticsResponse';
import ResultsHeader from './ResultsHeader';
import BasicAnalytics from './BasicAnalytics';
import ChartsGrid from './VisualAnalytics';
import ModelFeatures from '@/components/analytics/AdvancedAnalytics';
import Link from 'next/link';

type SectionHeaderProps = {
    sectionName: string
}

export const SectionHeader = ({ sectionName }: SectionHeaderProps): ReactElement => {
    return (
        <div className="flex justify-between align-center mb-5 pb-4 border-b-3 border-[#e0e6ed]">
            <h2 className="text-[26px] text-[#333] font-bold"> {sectionName} </h2>
        </div>
    )
}

const ReportGenerationDate = ({ timestamp }: { timestamp: string }) => (
  <div className="relative w-full">
        <div
            title="Timestamp of report generation"
            className="absolute top-0 right-3 text-sm font-semibold px-3 py-1 border border-black/20 rounded-full
            bg-gradient-to-r from-green-400 to-emerald-500
            text-white shadow-md shadow-emerald-500/20 transition-all duration-300
            hover:shadow-lg hover:scale-105 hover:cursor-default"
        >
        {`Generated: ${new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(timestamp))}`}
        </div>
  </div>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
    </div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">
            Error Loading Analysis
        </div>
        <p className="text-red-700 mb-4">{message}</p>
        <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
            Try Again
        </button>
        </div>
    </div>
);

const NoDataMessage = ({ onRedirect }: { onRedirect: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
        <div className="text-yellow-600 text-lg font-semibold mb-2">
            No Analysis Data Found
        </div>
        <p className="text-yellow-700 mb-4">
            It looks like there's no analysis data available. Please upload and analyze a document first.
        </p>
        <button
            onClick={onRedirect}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
            Upload Document
        </button>
        </div>
    </div>
);

const ResultsBody = ({
    timestamp,
    document,
    summary,
    basic_analytics,
    visual_analytics,
    advanced_features
}: TextAnalyticsResponse) => {
    const { overview, structure, readability } = basic_analytics;
    const { word_frequency, word_length_distribution, sentence_length_trends, parts_of_speech } = visual_analytics;
    const { sentiment_analysis, keyword_extraction, topic_modeling, language_patterns } = advanced_features;
    console.log(document)
    return (
        <article className="max-w-[1200px] mx-auto p-5">
        <div className="md:grid grid-cols-[250px_1fr] gap-6 my-auto">
            <Navigation />
            <div className="bg-white rounded-xl p-7 shadow-lg">
            <ReportGenerationDate timestamp={timestamp} />
            
            {/* Executive Summary Section */}
            <ExecutiveSummary document={document} summary={summary} />
            
            {/* Basic Analytics (Accordion) */}
            <BasicAnalytics
                overviewData={overview}
                structureData={structure}
                readabilityData={readability}
                wordFrequencyData={word_frequency}
                wordLengthData={word_length_distribution}
            />
            
            {/* Charts Grid */}
            <ChartsGrid
                wordFrequency={word_frequency}
                wordLengthDistribution={word_length_distribution}
                sentenceLengthTrends={sentence_length_trends}
                partsOfSpeech={parts_of_speech}
            />
            
            {/* Advanced Features Data */}
            <ModelFeatures
                sentiment={sentiment_analysis}
                keywords={keyword_extraction}
                topics={topic_modeling}
                language={language_patterns}
            />
            </div>
        </div>
        </article>
    );
};

// Custom hook for managing session storage data
const useAnalysisData = () => {
    const [data, setData] = useState<TextAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const loadData = () => {
        setLoading(true);
        setError(null);
        
        try {
            const storedData = sessionStorage.getItem('analysisResult');
            
            if (!storedData) {
                setData(null);
                setLoading(false);
                return;
            }

            const parsedData: TextAnalyticsResponse = JSON.parse(storedData);
            
            // Validate that the data has the required structure
            if (!parsedData.success || !parsedData.document || !parsedData.summary) {
                throw new Error('Invalid analysis data structure');
            }
            
            setData(parsedData);
            } catch (err) {
            console.error('Error loading analysis data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analysis data');
            setData(null);
            } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const redirectToUpload = () => <Link href="/" />

    const retry = () => {
        loadData();
    };

    return { data, loading, error, retry, redirectToUpload };
};

export default function Results() {
    const { data, loading, error, retry, redirectToUpload } = useAnalysisData();

    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }

        if (error) {
            return <ErrorMessage message={error} onRetry={retry} />;
        }

        if (!data) {
            return <NoDataMessage onRedirect={redirectToUpload} />;
        }

        return <ResultsBody {...data} />;
    };

    return (
        <section className="bg-[#f5f7fa] min-h-[100vh] text-[#333]">
            <ResultsHeader />
            {renderContent()}
        </section>
    );
}
