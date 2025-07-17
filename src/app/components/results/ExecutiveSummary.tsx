
import { DocumentInfo, AnalyticsSummary } from '../../types/basicAnalytics';

const ExecutiveSummary = ({} : AnalyticsSummary) => {
    return (
        <div id="summary" className="mb-10">
            <SectionHeader sectionName="Executive Summary" />
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-5 mb-8">

            </div>
        </div>
    )
}


const StatCard = (value : number, label : string) => {
    return (
        <div className="text-white p-6 rounded-lg text-center bg-linear-120 from-[#667eea] from-0% to-[#764ba2]">
            <div className="text-2xl font-bold mb-1">
                {value}
            </div>
            <div className="text-sm opacity-90">
                {label}
            </div>
        </div>
    )
}

const DocOverview = ({filename, uploaded_at, size_bytes, category} : DocumentInfo) => {
    const convertSize = () : string => {
        const SIZE_LIMIT = 10 * 1024 * 1024; // 10mb
        let convertedSize = "";
        if (size_bytes < 1024){ // Display in bytes
            convertedSize = `${size_bytes}B`;
        } else if (size_bytes < Math.pow(1024, 2)) { // Display in KB
            convertedSize = `${size_bytes / 1024}KB`;
        } else if (size_bytes < SIZE_LIMIT){
            convertedSize = `${size_bytes / Math.pow(1024, 2)}`;
        } else {
            console.error("This shouldn't be possible");
        }
        return convertedSize;
    }
    return (
        <div className="bg-[#f8f9ff] border-l-2-[#667eea] p-5 rounded-md mb-5">
            <span> <strong> Document: </strong> {filename}</span> •
            <span> <strong> Uploaded: </strong> {uploaded_at} </span> •
            <span><strong>Type: </strong> {category}</span> •
            <span><strong>Size: </strong> {size_bytes} </span>
        </div>
    )
}
