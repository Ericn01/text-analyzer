"use client";
import { SectionHeader } from "./Results"
import { useState } from "react";
import { OverviewMetrics, StructureMetrics, ReadabilityMetrics, ReadabilityMetric } from "../../../types/basicAnalytics";
import { WordFrequencyData, WordLengthDistribution } from "../../../types/visualAnalytics";
import { WordFrequencyChart } from "../charts/WordFrequencyChart";
import { formatMetricName } from "@/lib/utils/formatMetric";
import { StructureChart } from "../charts/StructureChart";
import ReadabilityChart from "../charts/ReadabilityChart";

// Props interface for the component
type BasicAnalyticsProps = {
    overviewData: OverviewMetrics;
    structureData: StructureMetrics;
    readabilityData: ReadabilityMetrics;
    wordFrequencyData: WordFrequencyData;
    wordLengthData: WordLengthDistribution;
}

const BasicAnalytics = ({
    overviewData,
    structureData,
    readabilityData,
    wordFrequencyData,
    wordLengthData
}: BasicAnalyticsProps) => {

    type TabType = 'overview' | 'structure' | 'readability';
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Tab configuration
    const tabs = [
        { id: 'overview' as TabType, label: 'Overview' },
        { id: 'structure' as TabType, label: 'Structure' },
        { id: 'readability' as TabType, label: 'Readability' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab
                        overviewData={overviewData}
                        wordFrequencyData={wordFrequencyData}
                    />
                );
            case 'structure':
                return <StructureTab structureData={structureData} />
            case 'readability':
                return <ReadabilityTab readabilityData={readabilityData} />
            default:
                return null;
        }
    }

    return (
        <article id="basic" className="w-full max-w-6xl mx-auto mb-7">
            <SectionHeader sectionName="Basic Analytics" />

            <div className="flex gap-1 mb-6 rounded-lg p-1 bg-gray-100 w-fit">
                {tabs.map(tab => (
                    <button
                        onClick={() => setActiveTab(tab.id)}
                        key={tab.id}
                        className={`px-4 py-2 font-medium text-sm rounded-md transition-all duration-200 min-w-[100px]
                        ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="transition-all duration-300">
                {renderContent()}
            </div>
        </article>
    )
}

const OverviewTab = ({
    overviewData,
    wordFrequencyData,
}: {
    overviewData: OverviewMetrics;
    wordFrequencyData: WordFrequencyData;
}) => {

    const formatMetricValue = (key: string, value: number) => {
        if (key === 'average_words_per_sentence') {
            return value.toFixed(1);
        }
        if (key === 'lexical_diversity') {
            return (value * 100).toFixed(1) + '%';
        }
        return value.toLocaleString();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Metrics list */}
            <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-md">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Document Metrics</h3>
                    </div>
                    <div className="bg-white">
                        {Object.entries(overviewData).map(([metric, value], index) => (
                            <div
                                key={metric}
                                className={`flex justify-between items-center px-4 py-3 ${index !== Object.entries(overviewData).length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <span className="text-gray-700 font-medium">
                                    {formatMetricName(metric)}
                                </span>
                                <span className="text-gray-900 font-semibold">
                                    {formatMetricValue(metric, value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side: Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <WordFrequencyChart wordFrequencyData={wordFrequencyData} />
            </div>
        </div>
    );
};

const StructureTab = ({ structureData }: { structureData: StructureMetrics }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-md">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Document Structure</h3>
                    </div>
                    <div className="bg-white">
                        {Object.entries(structureData).map(([metric, value], index) => (
                            <div
                                key={metric}
                                className={`flex justify-between items-center px-4 py-3 ${index !== Object.entries(structureData).length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <span className="text-gray-700 font-medium">
                                    {formatMetricName(metric)}
                                </span>
                                <span className="text-gray-900 font-semibold">
                                    {value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Right side: Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <StructureChart structureData={structureData} />
            </div>
        </div>
    );
};

const ReadabilityTab = ({ readabilityData }: { readabilityData: ReadabilityMetrics }) => {
    const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Readability Metrics</h3>
            
            {/* Toggle Switch */}
            <div className="flex items-center space-x-3">
            <span className={`text-sm ${viewMode === 'cards' ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                Cards
            </span>
            <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'chart' : 'cards')}
                className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${viewMode === 'chart' ? 'bg-blue-600' : 'bg-gray-200'}
                `}
            >
                <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${viewMode === 'chart' ? 'translate-x-6' : 'translate-x-1'}
                `}
                />
            </button>
            <span className={`text-sm ${viewMode === 'chart' ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                Chart
            </span>
            </div>
        </div>
    
        {/* Content based off the viewing mode */}
        {viewMode === 'cards' ? ( 
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(readabilityData).map(([metricName, metricData]) => (
                    <ReadabilityCard
                    key={metricName}
                    metricName={metricName}
                    readabilityData={metricData}
                    />
                ))}
            </div>
        ) : (
            <ReadabilityChart readabilityData={readabilityData} />
        )}
        </div>
    )
};

const ReadabilityCard = ({
    metricName,
    readabilityData
}: {
    metricName: string;
    readabilityData: ReadabilityMetric;
}) => {
    const getScoreColor = (percentage: number) => {
        if (percentage >= 70) return 'text-green-600';
        if (percentage >= 45) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getBarColor = (percentage: number) => {
        if (percentage >= 70) return 'bg-green-500';
        if (percentage >= 45) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {formatMetricName(metricName, true)}
                </h4>
                <p className={`text-3xl font-bold mb-2 ${getScoreColor(readabilityData.percentage)}`}>
                    {readabilityData.score.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mb-4 h-12 flex items-center justify-center">
                    {readabilityData.description}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${getBarColor(readabilityData.percentage)}`}
                        style={{ width: `${Math.min(readabilityData.percentage, 100)}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500">
                    {readabilityData.percentage.toFixed(1)}% Score
                </p>
            </div>
        </div>
    );
};

export default BasicAnalytics;