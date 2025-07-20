import { ReactElement } from 'react';
import Navigation from './Navigation';
import ExecutiveSummary from './ExecutiveSummary';
import { TextAnalyticsResponse } from '@/app/types/analyticsResponse';
import ResultsHeader from './ResultsHeader';
import BasicAnalytics from './BasicAnalytics';
import ChartsGrid from './VisualAnalytics';
import { CircleQuestionMark } from 'lucide-react';
import { analyticsData } from '@/app/exampleResponse';
import ModelFeatures from './AdvancedFeatures';

type SectionHeaderProps = {
    sectionName: string
}

export const SectionHeader = ({ sectionName } : SectionHeaderProps) : ReactElement => {
    return (
        <div className="flex justify-between align-center mb-5 pb-4 border-b-3 border-[#e0e6ed]">
            <h2 className="text-[26px] text-[#333] font-bold"> {sectionName} </h2>
        </div>
    )
}

const ResultsBody = ({
                    timestamp,
                    document, 
                    summary,
                    basic_analytics,
                    visual_analytics,
                    advanced_features} : TextAnalyticsResponse) => {
    const {overview, structure, readability} = basic_analytics;
    const {word_frequency, word_length_distribution, sentence_length_trends, parts_of_speech} = visual_analytics;
    const {sentiment_analysis, keyword_extraction, topic_modeling, language_patterns} = advanced_features
    return (
        <article className="max-w-[1200px] mx-auto p-5">
            <div className="md:grid grid-cols-[250px_1fr] gap-6 my-auto">
                <Navigation />
                <div className="bg-white rounded-xl p-7 shadow-lg">
                    <h1> Analysis completed at {new Date(timestamp).toLocaleDateString()}</h1>
                    {/* Executive Summary Section */}
                    <ExecutiveSummary document={document} summary={summary}/>
                    {/* Basic Analytics (Accordion) */}
                    <BasicAnalytics 
                        overviewData={overview} 
                        structureData={structure} 
                        readabilityData={readability} 
                        wordFrequencyData={word_frequency}
                        wordLengthData={word_length_distribution}
                    />
                    {/* Charts Grid (still in progress) */}
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
    )
}


export default async function Results () {
    const textAnalysisData = analyticsData;

    return (
        <section className="bg-[#f5f7fa] min-h-[100vh]">
            <CircleQuestionMark size={64} className='text-indigo-500'/> 
            <ResultsHeader />
            <ResultsBody {...textAnalysisData} />
        </section>
    )
}