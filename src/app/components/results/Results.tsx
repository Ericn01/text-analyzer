import { promises as fs} from 'fs';
import path from 'path';
import { ReactElement } from 'react';
import { AnalyticsSummary } from '../../types/basicAnalytics';
import Error from 'next/error';



type SectionHeaderProps = {
    sectionName: string
}

const SectionHeader = ({ sectionName } : SectionHeaderProps) : ReactElement => {
    return (
        <div className="flex justify-between align-center mb-5 pb-4 border-b-2-[#e0e6ed]">
            <h2 className="text-2xl text-[#333] font-bold"> {sectionName} </h2>
        </div>
    )
}





const BasicAnalytics =  () => {

}

const ResultsBody = () => {
    return (
        <article className="max-w-[1200px] mx-auto p-5">
            <ResultsSidebar />

            <div className="bg-white rounded-lg p-7 shadow-lg">
                {/* Summary Section */}

                {/* Basic Analytics (Accordion) */}
            </div>
        </article>
    )
}


export default async function Results (resultData : {} | null) {
    const filePath = path.join(`${process.cwd()}`, 'app', 'exampleResponse.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { summary, basic_analytics, visual_analytics, advanced_features } = JSON.parse(fileContent);

    return (
        <section className="bg-[#f5f7fa] min-h-[100vh]">
            <ResultsHeader />

        </section>
    )
}