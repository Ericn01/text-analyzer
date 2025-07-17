"use client"

import { SectionHeader } from "./Results"
import { useState } from "react";
import { OverviewMetrics, StructureMetrics, ReadabilityMetrics, ReadabilityMetric } from "@/app/types/basicAnalytics";
import { WordFrequencyData } from "@/app/types/visualAnalytics";

// Props interface for the component
type SimpleMetricsType = {
    overviewData: OverviewMetrics;
    structureData: StructureMetrics;
    readabilityData: ReadabilityMetrics;
    wordFrequencyData: WordFrequencyData;
}

const BasicAnalytics = ({overviewData, structureData, readabilityData, wordFrequencyData} : SimpleMetricsType) => {

    type TabType = 'overview' | 'structure' | 'readability';

    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Tab configuration
    const tabs = [
        { id: 'overview' as TabType, label: 'Overview' },
        { id: 'structure' as TabType, label: 'Structure' },
        { id: 'readability' as TabType, label: 'Readability' }
    ];

    const renderContent = () => {
        switch(activeTab){
            case 'overview':
                return <OverviewTab {...overviewData}/>
            case 'structure':
                return <StructureTab {...structureData}/>
            case 'readability':
                return <ReadabilityTab readabilityData={readabilityData}/>
            default: 
                return null;
        }
    }

    return (
        <article>
            <SectionHeader sectionName="Basic Analytics" />
            <div className="flex gap-1 mb-5 rounded-2 p-1">
                {tabs.map( tab => (
                    <button 
                        onClick={() => setActiveTab(tab.id)}
                        key={tab.id}
                        className={`px-3 py-4 border-none cursor-pointer text-[500] transition-colors duration-200
                        ${activeTab === tab.id 
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

const OverviewTab = ({total_words, unique_words, sentences, paragraphs, characters, average_words_per_sentence, lexical_diversity} : OverviewMetrics) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Overview Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total Words</h3>
                <p className="text-2xl font-bold text-blue-600">{total_words.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Unique Words</h3>
                <p className="text-2xl font-bold text-green-600">{unique_words.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Sentences</h3>
                <p className="text-2xl font-bold text-purple-600">{sentences.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800">Paragraphs</h3>
                <p className="text-2xl font-bold text-orange-600">{paragraphs.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800">Characters</h3>
                <p className="text-2xl font-bold text-red-600">{characters.toLocaleString()}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-indigo-800">Avg Words/Sentence</h3>
                    <p className="text-2xl font-bold text-indigo-600">{average_words_per_sentence.toFixed(1)}</p>
                </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Lexical Diversity</h3>
                    <p className="text-2xl font-bold text-gray-600">{lexical_diversity.toFixed(3)}</p>
                </div>
        </div>
    )
}

const StructureTab = ({headings, lists, bold_instances, italic_instances, links, images, tables, footnotes} : StructureMetrics) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Structure Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Headings</h3>
                    <p className="text-2xl font-bold text-blue-600">{headings}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">Lists</h3>
                    <p className="text-2xl font-bold text-green-600">{lists}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Bold Instances</h3>
                    <p className="text-2xl font-bold text-purple-600">{bold_instances}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-800">Italic Instances</h3>
                    <p className="text-2xl font-bold text-orange-600">{italic_instances}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800">Links</h3>
                    <p className="text-2xl font-bold text-red-600">{links}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-indigo-800">Images</h3>
                    <p className="text-2xl font-bold text-indigo-600">{images}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-pink-800">Tables</h3>
                    <p className="text-2xl font-bold text-pink-600">{tables}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">Footnotes</h3>
                    <p className="text-2xl font-bold text-yellow-600">{footnotes}</p>
                </div>
            </div>
        </div>
    )
} 

const ReadabilityTab = ({readabilityData} : {readabilityData: ReadabilityMetrics}) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Readability Metrics</h2>
            <div className="space-y-4">
                {Object.entries(readabilityData).map(([metricName, metricData]) => (
                    <ReadabilityBar 
                        key={metricName}
                        metricName={metricName}
                        readabilityData={metricData}
                    />
                ))}
            </div>
        </div>
    )
}

const ReadabilityBar = ({metricName, readabilityData} : {metricName: string, readabilityData: ReadabilityMetric}) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {metricName.charAt(0).toUpperCase() + metricName.slice(1).replace('_', ' ')}
                </h3>
                <p className="text-4xl font-bold text-blue-600 mb-2">{readabilityData.score.toFixed(1)}</p>
                <p className="text-lg text-gray-600 mb-4">{readabilityData.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${readabilityData.percentage}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{readabilityData.percentage.toFixed(1)}%</p>
            </div>
        </div>
    )
}

export default BasicAnalytics;