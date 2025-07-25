import { SentimentAnalysis } from "../../../../types/advancedAnalytics";
import SentimentDistributionChart from "@/components/charts/SentimentDistributionChart";

const SentimentIcon = ({ sentiment, score }: { sentiment: string; score: number }) => {
    const getSentimentColor = () => {
        switch (sentiment.toLowerCase()) {
            case 'positive': return 'text-green-600';
            case 'negative': return 'text-red-600';
            case 'neutral': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    }

    const getSentimentIcon = () => {
        if (score > 0.7) return sentiment.toLowerCase() === 'positive' ? '😊' : '😢';
        if (score > 0.4) return sentiment.toLowerCase() === 'positive' ? '🙂' : '😐';
        return '😐';
    };

    return (
        <div className={`flex items-center space-x-2 ${getSentimentColor()}`}>
            <span className="text-2xl">{getSentimentIcon()}</span>
            <span className="text-xl font-semibold">{sentiment}</span>
        </div>
    );
}

const EmotionalToneIndicator = ({ emotion, value }: { emotion: string; value: number }) => {
    const getEmotionIcon = (emotion: string) => {
        const icons: { [key: string]: string } = {
            joy: '😊',
            anger: '😠',
            fear: '😨',
            sadness: '😢',
            surprise: '😲',
            disgust: '🤢',
            anticipation: '🤔',
            trust: '🤝'
        };
        return icons[emotion.toLowerCase()] || '😐';
    };

    const getEmotionColor = (value: number) => {
        if (value > 20) return 'bg-red-500';
        if (value > 10) return 'bg-orange-500';
        if (value > 5) return 'bg-yellow-500';
        return 'bg-gray-300';
    };

    return (
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
            <span className="text-xl">{getEmotionIcon(emotion)}</span>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium capitalize">{emotion}</span>
                <span className="text-sm text-gray-600">{(value * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full ${getEmotionColor(value * 100)}`}
                    style={{ width: `${Math.max(value * 100, 2)}%` }}
                ></div>
                </div>
            </div>
        </div>
    );
};

const SentimentSection = ({ data }: { data: SentimentAnalysis }) => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
        {/* Overall Sentiment Header */}
        <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
            <SentimentIcon 
                sentiment={data.overall_sentiment.label} 
                score={data.overall_sentiment.score} 
            />
            <div className="text-right">
                <div className="text-sm text-gray-500">Confidence</div>
                <div className="text-sm font-medium text-gray-700">
                {(data.overall_sentiment.confidence * 100).toFixed(1)}%
                </div>
            </div>
            </div>
        </div>

        {/* Description */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-gray-700 leading-relaxed">
            {data.description}
            </p>
        </div>

        {/* Sentiment Distribution */}
        <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800">Sentiment Distribution</h4>
            <div className="space-y-3">
            <div style={{ height: '40px' }}>
                <SentimentDistributionChart data={data.sentiment_distribution} />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Positive: {data.sentiment_distribution.positive.percentage}%</span>
                </div>
                <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>Neutral: {data.sentiment_distribution.neutral.percentage}%</span>
                </div>
                <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Negative: {data.sentiment_distribution.negative.percentage}%</span>
                </div>
            </div>
            </div>
        </div>

        {/* Emotional Tone */}
        <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800">Emotional Tone</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(data.emotional_tone).map(([emotion, value]) => (
                <EmotionalToneIndicator 
                key={emotion} 
                emotion={emotion} 
                value={value as number} 
                />
            ))}
            </div>
        </div>
        </div>
    );
};

export default SentimentSection;