// ExecutiveSummary.tsx - Fixed version
import { AnalyticsSummary, DocumentInfo } from '../../../types/basicAnalytics';
import { SectionHeader } from './Results';

const convertUploadDate = (uploadDate: string): string => {
    const today = new Date();
    const uploadDateObj = new Date(uploadDate); // Convert string to Date
    const daysAgo = Math.floor((today.getTime() - uploadDateObj.getTime()) / (1000 * 60 * 60 * 24));

    return daysAgo === 0 ? " (Today)" : daysAgo === 1 ? " (Yesterday)" : ` (${daysAgo} days ago)`;
}

type ExecutiveSummaryType = {
    summary: AnalyticsSummary,
    document: DocumentInfo
}

const ExecutiveSummary = ({ summary, document }: ExecutiveSummaryType) => {
    const statCardLabels = ['total_words', 'reading_time_minutes', 'sentiment_score', 'reading_level'];
    
    const statCards = Object.entries(summary).filter(([label]) =>
        statCardLabels.includes(label)
    );

    const insightCards = Object.entries(summary).filter(([label]) =>
        !statCardLabels.includes(label)
    );

    return (
        <div id="summary" className="mb-10">
            <SectionHeader sectionName="Executive Summary" />
            <DocOverview {...document} />

            {/* Stat Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-5 mb-8">
                {statCards.map(([label, value], index) => (
                    <StatCard
                        key={`stat-${label}-${index}`} // Use deterministic key
                        value={value as number}
                        label={labelConversion(label)}
                    />
                ))}
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-5">
                {insightCards.map(([label, value], index) => (
                    <InsightCard
                        key={`insight-${label}-${index}`} // Use deterministic key
                        value={value as string | string[]}
                        label={labelConversion(label)}
                    />
                ))}
            </div>
        </div>
    )
}

const labelConversion = (label: string) => label.replaceAll("_", ' ')
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

type StatCardType = {
    value: number,
    label: string
}

const StatCard = ({ value, label }: StatCardType) => {
    const formatValue = () => {
        if (label === 'Sentiment Score') {
            return `${(value * 100).toFixed(0)}%`;
        }
        if (label === 'Reading Level') {
            return value.toFixed(1);
        }
        return value.toLocaleString();
    };

    return (
        <div className="text-white p-6 rounded-lg text-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className="text-5xl font-bold mb-1">
                {formatValue()}
            </div>
            <div className="text-sm opacity-90">
                {label}
            </div>
        </div>
    )
}

type InsightCardType = {
    value: string | string[],
    label: string
}

const InsightCard = ({ value, label }: InsightCardType) => {
    const iconMapping: { [key: string]: string } = {
        'Writing Style': '📊',
        'Key Topics': '🎯',
        'Complexity Level': '💡'
    };

    return (
        <div className="bg-white border-2 border-[#e0e6ed] rounded-lg p-5 text-center">
            <div className="text-3xl mb-2"> {iconMapping[label] || '📄'}</div>
            <h4 className='text-lg font-bold text-black mb-2'> {label} </h4>
            <p className='text-md text-gray-600'> 
                {Array.isArray(value) ? value.join(", ") : value} 
            </p>
        </div>
    )
}

// Fixed to match your new interface structure
const DocOverview = ({ filename, original_name, size_bytes, uploaded_at, category }: DocumentInfo) => {
    const convertSize = (fileSize: number): string => {
        if (fileSize < 1024) { // Display in bytes
            return `${fileSize}B`;
        } else if (fileSize < Math.pow(1024, 2)) { // Display in KB
            return `${(fileSize / 1024).toFixed(1)}KB`;
        } else { // Display in MB
            return `${(fileSize / Math.pow(1024, 2)).toFixed(1)}MB`;
        }
    }

    return (
        <div className="bg-[#f8f9ff] text-[#333] border-l-4 border-[#667eea] p-5 rounded-md mb-5">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <span>
                    <strong className='text-md'>Document: </strong>
                    {original_name || filename}
                </span>
                <span>
                    <strong className='text-md'>Uploaded: </strong>
                    {convertUploadDate(uploaded_at)}
                </span>
                <span>
                    <strong className='text-md'>Type: </strong>
                    {category}
                </span>
                <span>
                    <strong className='text-md'>Size: </strong>
                    {convertSize(size_bytes)}
                </span>
            </div>
        </div>
    )
}

export default ExecutiveSummary;