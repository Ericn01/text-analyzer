
import { randomUUID } from 'crypto';
import { AnalyticsSummary, DocumentInfo } from '../../../types/basicAnalytics';
import { SectionHeader } from './Results';


const convertUploadDate = (uploadDate : Date) : string => {
    const today = new Date();
    const daysAgo = Math.floor((today.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysAgo === 0 ? " (Today)" : daysAgo === 1 ? " (Yesterday)" : ` ${daysAgo} days ago`;
}

type ExecutiveSummaryType = {
    summary: AnalyticsSummary,
    document: DocumentInfo
}

const ExecutiveSummary = ({summary, document}: ExecutiveSummaryType) => {
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
                {statCards.map(([label, value]) => (
                <StatCard
                    key={randomUUID()}
                    value={value as number}
                    label={labelConversion(label)}
                />
                ))}
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-5">
                {insightCards.map(([label, value]) => (
                <InsightCard
                    key={randomUUID()}
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
                                            .map( w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');


type StatCardType = {
    value: number,
    label: string
}

const StatCard = ({value, label} : StatCardType) => {
    return (
        <div className="text-white p-6 rounded-lg text-center bg-linear-120 from-[#667eea] from-0% to-[#764ba2]">
            <div className="text-5xl font-bold mb-1">
                {label === 'Sentiment Score' ?  `${(value * 100).toFixed(0)}%` : value.toLocaleString()}
            </div>
            <div className="text-sm opacity-90">
                {label}
            </div>
        </div>
    )
}

type InsightCard = {
    value: string | string[],
    label: string
}

const InsightCard = ({value,label}: InsightCard) => {
    const iconMapping : {[key : string] : string} = {
        'Writing Style': '📊',
        'Key Topics': '🎯',
        'Complexity': '💡'
    };

    return (
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-5">
            <div className="bg-white border-2 border-[#e0e6ed] rounded-lg p-5 text-center">
                <div className="text-3xl"> {iconMapping[label] || '📄'}</div>
                <h4 className='text-lg font-bold text-black'> {label} </h4>
                <p className='text-md/3'> {Array.isArray(value) ? value.join(", ") : value} </p>
            </div>
        </div>
    )
}

const DocOverview = ({filename, uploaded_at, size_bytes, category} : DocumentInfo) => {
    const convertSize = (fileSize : number) : string => {
        const SIZE_LIMIT = 10 * 1024 * 1024; // 10mb
        let convertedSize = "";
        if (fileSize < 1024){ // Display in bytes
            convertedSize = `${fileSize}B`;
        } else if (fileSize < Math.pow(1024, 2)) { // Display in KB
            convertedSize = `${fileSize/ 1024}KB`;
        } else if (fileSize < SIZE_LIMIT){
            convertedSize = `${fileSize / Math.pow(1024, 2)}MB`;
        } else {
            console.error("This shouldn't be possible");
        }
        return convertedSize;
    }
    return (
        <div className="bg-[#f8f9ff] text-[#333] border-l-5 border-[#667eea] p-5 rounded-md mb-5">
            <span> <strong className='text-md'> Document: </strong> {filename}</span> •
            <span> <strong className='text-md'> Uploaded: </strong> {convertUploadDate(new Date(uploaded_at))} </span> •
            <span><strong className='text-md'> Type: </strong> {category}</span> •
            <span><strong className='text-md'> Size: </strong> {convertSize(size_bytes)} </span>
        </div>
    )
}

export default ExecutiveSummary;