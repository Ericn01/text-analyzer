"use client";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend,
LineElement,
PointElement,
ArcElement,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { VisualAnalytics } from '@/types/visualAnalytics';
import { WordFrequencyChart} from '../charts/WordFrequencyChart';
import { WordLengthChart } from '../charts/WordLengthChart';
import { SentenceLengthTrendChart } from '../charts/SentenceLengthTrendChart';
import { GrammarBreakdownChart } from '../charts/GrammarBreakdownChart';
import { SectionHeader } from './Results';


ChartJS.register(
    annotationPlugin,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend, 
);

/* Chart Title */
export const ChartTitle = ({ chartTitle }: { chartTitle: string }) => (
<h3 className="text-lg font-bold mb-4 text-black/70">{chartTitle}</h3>
);

/* Chart Container */
export const ChartContainer = ({ chartTitle, children }: { chartTitle : string, children: React.ReactElement }) => (
<div className="bg-[#f8f9ff] rounded-lg p-5 h-[400px] flex flex-col">
    <ChartTitle chartTitle={chartTitle} />
    <div className='flex-1 w-full'>
        {children}
    </div>
</div>
);



const ChartsGrid= ({
    wordFrequency,
    wordLengthDistribution,
    sentenceLengthTrends,
    partsOfSpeech
}: VisualAnalytics) => {    
    return (
        <section id="charts" className='mb-10'>
            <SectionHeader sectionName='Visual Analytics' />
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-5">
                <WordFrequencyChart wordFrequencyData={wordFrequency} />
                <WordLengthChart wordLengthData={wordLengthDistribution} />
                <SentenceLengthTrendChart sentenceLengthData={sentenceLengthTrends}/>
                <GrammarBreakdownChart grammarData={partsOfSpeech} />
            </div>
        </section>
    );
};

export default ChartsGrid;