import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ProcessedTextStats } from '../../../../types/advancedAnalytics';

const TextStats = ({ stats }: { stats: ProcessedTextStats }) => {
    const [showQualityPanel, setShowQualityPanel] = useState(true);

    const getQualityColor = (quality: string) => {
        switch (quality) {
        case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
        case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'unusable': return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getQualityIcon = (quality: string) => {
        switch (quality) {
        case 'excellent':
        case 'good':
            return <CheckCircle className="w-4 h-4" />;
        case 'fair':
            return <Info className="w-4 h-4" />;
        case 'poor':
        case 'unusable':
            return <AlertCircle className="w-4 h-4" />;
        default:
            return <FileText className="w-4 h-4" />;
        }
    };

    const getQualityValue = (quality: string) => {
        switch(quality) {
            case 'excellent':
                return 100;
            case 'good':
                return 80;
            case 'fair':
                return 60;
            case 'poor':
                return 40;
            case 'unusable':
                return 20;
            default:
                return 0;
        }
    }
    

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Text Processing Statistics
            </h2>
        </div>

        <div className="flex">
            {/* Main Stats Table */}
            <div className="flex-1 p-6">
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Text Length
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(stats.processed_length)} chars
                    </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Sentences
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(stats.sentences_count)}
                    </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Words
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(stats.words_count)}
                    </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Quality Score
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-medium">
                            {getQualityValue(stats.quality_score)}/100
                        </span>
                        {stats.processing_report && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getQualityColor(stats.processing_report.quality_score)}`}>
                            {getQualityIcon(stats.processing_report.quality_score)}
                            {stats.processing_report.quality_score}
                            </span>
                        )}
                        </div>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>

            {/* Quality processing_report Toggle */}
            {stats.processing_report && (
                <div className="mt-4">
                <button
                    onClick={() => setShowQualityPanel(!showQualityPanel)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    {showQualityPanel ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {showQualityPanel ? 'Hide' : 'Show'} Quality Processing Report Details
                </button>
                </div>
            )}
            </div>

            {/* Quality processing_report Side Panel */}
            {stats.processing_report && showQualityPanel && (
            <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
                <div className="space-y-4">
                {/* Quality Overview */}
                <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">Quality Processing Report</h3>
                    <div className={`p-3 rounded-lg border ${getQualityColor(stats.processing_report.quality_score)}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {getQualityIcon(stats.processing_report.quality_score)}
                        <span className="font-semibold capitalize text-sm">
                        {stats.processing_report.quality_score} Quality
                        </span>
                    </div>
                    {stats.processing_report.chars_removed > 0 && (
                        <p className="text-xs">
                        {formatNumber(stats.processing_report.chars_removed)} characters removed
                        </p>
                    )}
                    </div>
                </div>

                {/* Issues Found */}
                {stats.processing_report.issues_found && stats.processing_report.issues_found.length > 0 && (
                    <div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-orange-500" />
                        Issues ({stats.processing_report.issues_found.length})
                    </h4>
                    <div className="space-y-1">
                        {stats.processing_report.issues_found.slice(0, 3).map((issue, index) => (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded p-2">
                            <p className="text-xs text-orange-800">{issue}</p>
                        </div>
                        ))}
                        {stats.processing_report.issues_found.length > 3 && (
                        <p className="text-xs text-gray-500">+{stats.processing_report.issues_found.length - 3} more</p>
                        )}
                    </div>
                    </div>
                )}

                {/* Corrections Applied */}
                {stats.processing_report.corrections_applied.length > 0 && (
                    <div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Corrections ({stats.processing_report.corrections_applied.length})
                    </h4>
                    <div className="space-y-1">
                        {stats.processing_report.corrections_applied.slice(0, 3).map((correction, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-800">{correction}</p>
                        </div>
                        ))}
                        {stats.processing_report.corrections_applied.length > 3 && (
                        <p className="text-xs text-gray-500">+{stats.processing_report.corrections_applied.length - 3} more</p>
                        )}
                    </div>
                    </div>
                )}
                </div>
            </div>
            )}
        </div>
    </div>
    );
};

export default TextStats
