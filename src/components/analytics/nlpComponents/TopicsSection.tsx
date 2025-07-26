import { TopicModelingTopic, TopicModeling } from "../../../../types/advancedAnalytics";
import { chartColors } from "@/lib/utils/chartStyles";
import EvolutionChart from "@/components/charts/TopicEvolutionChart";

const WordCloud = ({ keywords, color }: { keywords: string[], color: string }) => {
    const sizes = [
        'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'
    ];
    
    const positions = [
        'transform rotate-12', 'transform -rotate-6', 'transform rotate-3', 
        'transform -rotate-12', 'transform rotate-6', ''
    ];

    return (
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 flex flex-wrap items-center justify-center">
        {keywords.slice(0, 6).map((keyword, idx) => (
            <span
            key={idx}
            className={`
                absolute font-bold opacity-80 transition-all duration-300 hover:opacity-100 hover:scale-110
                ${sizes[idx % sizes.length]} 
                ${positions[idx % positions.length]}
            `}
            style={{
                color: color,
                left: `${15 + (idx * 12) % 70}%`,
                top: `${10 + (idx * 15) % 60}%`,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
            >
            {keyword}
            </span>
        ))}
        </div>
    );
};

// Topic Card Component
const TopicCard = ({ topic, index }: { topic: TopicModelingTopic, index: number }) => {
    const colorSet = Object.values(chartColors.primary)[index % Object.values(chartColors.primary).length];
    
    return (
        <div className="bg-white rounded-xl shadow-lg mb-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
        {/* Header */}
        <div 
            className="px-6 py-4 text-white relative"
            style={{ backgroundColor: colorSet.border }}
        >
            <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold truncate">{topic.name}</h3>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-black">{topic.percentage}%</span>
            </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
        </div>
        
        {/* Word Cloud */}
        <div className="p-4">
            <WordCloud keywords={topic.keywords} color={colorSet.border} />
        </div>
        
        {/* Description */}
        <div className="px-6 pb-6">
            <p className="text-gray-600 text-sm leading-relaxed">{topic.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
            {topic.keywords.slice(0, 4).map((keyword, idx) => (
                <span 
                key={idx}
                className="px-2 py-1 text-xs rounded-full border"
                style={{ 
                    borderColor: colorSet.border, 
                    color: colorSet.border,
                    backgroundColor: colorSet.bg 
                }}
                >
                {keyword}
                </span>
            ))}
            </div>
        </div>
        </div>
    );
};

const CoherenceGauge = ({ score }: { score: number }) => {
    const percentage = Math.round(score * 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const getScoreColor = (score: number) => {
        if (score >= 0.7) return '#10b981'; // green
        if (score >= 0.5) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 0.7) return 'Excellent';
        if (score >= 0.5) return 'Good';
        return 'Needs Improvement';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Topic Coherence</h3>
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
            />
            {/* Progress circle */}
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke={getScoreColor(score)}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-in-out"
            />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>
                {percentage}%
            </span>
            <span className="text-xs text-gray-500 mt-1">{getScoreLabel(score)}</span>
            </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
            Measures how well topics are internally coherent and distinct from each other
        </p>
        </div>
    );
};

// Main Component
const TopicsSection = ({ data }: { data: TopicModeling }) => {
    return (
        <div className="space-y-8 bg-gray-50 p-6 rounded-2xl">
        {/* Header */}
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Topic Analysis</h2>
            <p className="text-gray-600">Discover the key themes and their evolution throughout the document</p>
        </div>

        {/* Coherence Score */}
        {data.topic_coherence_score && (
            <div className="flex justify-center">
            <CoherenceGauge score={data.topic_coherence_score} />
            </div>
        )}

        {/* Primary Topics Grid */}
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Primary Topics</h3>
            <div className="grid grid-cols-2 gap-5">
            {data.primary_topics.map((topic, index) => (
                <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
            </div>
        </div>

        {/* Topic Evolution */}
        {data.topic_evolution && data.topic_evolution.length > 0 && (
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Topic Evolution</h3>
                <EvolutionChart data={data.topic_evolution} />
            </div>
        )}
        </div>
    );
};

export default TopicsSection;