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
import { VisualAnalytics, WordFrequencyData, SentenceLengthTrends, PartsOfSpeech } from '@/app/types/visualAnalytics';
import { StructureMetrics } from '@/app/types/basicAnalytics';
import { Bar, Chart, Line, Pie } from 'react-chartjs-2';
import { SectionHeader } from './Results';
import { formatMetricName } from '@/utils/formatMetric';
import { createBarOptions, createLineOptions, createPieOptions, chartColors } from '@/utils/chartStyles';
import { useMemo } from 'react';
import { XYDataPoint } from '@/app/types/coreAnalytics';

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

/* Top 20 words: Bar Chart */
export const WordFrequencyChart = ({ wordFrequencyData }: { wordFrequencyData: WordFrequencyData }) => {
    const options = createBarOptions(
        '',
        'Words',
        'Count'
    );

    const data = {
        labels: wordFrequencyData.top_words.map(item => item.word),
        datasets: [{
        label: 'Word Frequency',
        data: wordFrequencyData.top_words.map(item => item.count),
        backgroundColor: chartColors.multiColor.backgrounds,
        borderColor: chartColors.multiColor.borders,
        borderWidth: 1,
        }],
    };

    return (
        <ChartContainer chartTitle="Word Frequency Chart">
            <Bar options={options} data={data} />
        </ChartContainer>
    );
};

// This chart will only exist in BasicAnalytics, but fits best here.

export const StructureChart = ({ structureData }: { structureData: StructureMetrics }) => {
    const options = {
        ...createBarOptions('Document Structure Elements'),
        scales: {
        ...createBarOptions().scales,
        y: {
            ...createBarOptions().scales.y,
            ticks: {
            ...createBarOptions().scales.y.ticks,
            stepSize: 1,
            callback: function(value: any) {
                return value.toLocaleString();
            },
            },
        },
        },
    };

    const chartData = {
            labels: Object.keys(structureData).map(key => formatMetricName(key)),
            datasets: [{
            label: 'Count',
            data: Object.values(structureData),
            backgroundColor: chartColors.structure.backgrounds,
            borderColor: chartColors.structure.borders,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    return (
        <ChartContainer chartTitle="Document Structure Elements">
            <Bar options={options} data={chartData} />
        </ChartContainer>
    );
};

/* Word Length Distribution: Histogram */
export const WordLengthChart = ({ wordLengthData }: { wordLengthData: any }) => {
    const options = {
        ...createBarOptions(
            'Word Length Distribution',
            'Word Length (Characters)',
            'Frequency (Number of Words)'
        ),
        plugins: {
            ...createBarOptions().plugins,
            tooltip: {
                ...createBarOptions().plugins.tooltip,
                callbacks: {
                title: function(context: any) {
                    return `${context[0].label} characters`;
                },
                label: function(context: any) {
                    const value = context.parsed.y;
                    const total = wordLengthData.chart_data.reduce((sum: number, item: any) => sum + item.value, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return [
                        `Count: ${value.toLocaleString()}`,
                        `Percentage: ${percentage}%`
                    ];
                }
                }
            },
        },
    };

    const data = {
        labels: wordLengthData.chart_data.map((item: any) => item.label.replace(' chars', '')),
        datasets: [{
        label: 'Word Count by Length',
        data: wordLengthData.chart_data.map((item: any) => item.value),
        backgroundColor: chartColors.primary.blue.bg,
        borderColor: chartColors.primary.blue.border,
        borderWidth: 1,
        borderSkipped: false,
        categoryPercentage: 1.0, // Touching bars for histogram look
        barPercentage: 1.0,
        }],
    };

    return (
        <ChartContainer chartTitle="Word Length Distribution">
            <Bar options={options} data={data} />
        </ChartContainer>
    );
};


interface SentenceLengthChartData {
    chartData: XYDataPoint[];
    paragraphDividers: number[];
    minMaxPoints: Array<{
        sentence: number;
        length: number;
        paragraph: number;
        globalIndex: number;
        type: 'min' | 'max';
    }>;
    showDividers: boolean;
    average_length: number;
    trend: string;
}



export const SentenceLengthTrendChart = ( {sentenceLengthData} : {sentenceLengthData : SentenceLengthTrends} ) => {

    const processdata = (data : SentenceLengthTrends) : SentenceLengthChartData => {
        const { data_points, chart_data, average_length, trend } = data;
        const MAX_PARAGRAPHS = 6

        // Check is the dataset is small (< 10 paragraphs)
        const isSmallDataset = data.chart_data.length < 10;

        if (isSmallDataset) {
            return {
                chartData: chart_data,
                paragraphDividers: [],
                minMaxPoints: [],
                showDividers: false,
                average_length,
                trend
            };
        }

        // Group data by paragraph
        const paragraphGroups: Record< number, Array<{
            sentence: number,
            length: number,
            paragraph: number;
            globalIndex: number
        }>> = {};


        data_points.forEach((point, index) => {
            if (!paragraphGroups[point.paragraph]) {
                paragraphGroups[point.paragraph] = [];
            }
            paragraphGroups[point.paragraph].push({
                ...point, 
                globalIndex: index + 1
            });
        });

        // Limit to first 6 paragraphs
        const paragraphKeys = Object.keys(paragraphGroups)
            .map(Number)
            .sort((a, b) => a - b)
            .slice(0, MAX_PARAGRAPHS);

        const minMaxPoints : Array<{
            sentence: number;
            length: number;
            paragraph: number;
            globalIndex: number;
            type: 'min' | 'max';
        }>  = [];

        paragraphKeys.forEach(paragraphNum => {
            const sentences = paragraphGroups[paragraphNum];
            const minSentence = sentences.reduce( (min, current) => current.length < min.length ? current : min);
            const maxSentence = sentences.reduce( (max, current) => current.length > max.length ? current : max);
            
            minMaxPoints.push({
                ...minSentence,
                type: 'min',
                paragraph: paragraphNum
            })

            if (minSentence.globalIndex !== maxSentence.globalIndex){
                minMaxPoints.push({
                    ...maxSentence,
                    type: 'max',
                    paragraph: paragraphNum
                })
            }
        })

        // Create paragraph dividers (x positions between paragraphs)
        const paragraphDividers: number[] = [];
        let currentIndex = 1;
        
        paragraphKeys.forEach((paragraphNum, index) => {
            const sentenceCount = paragraphGroups[paragraphNum].length;
            if (index > 0) {
                paragraphDividers.push(currentIndex - 0.5);
            }
            currentIndex += sentenceCount;
        });

        // Filter chart data to only include sentences from first 6 paragraphs
        const maxIndex = paragraphKeys.reduce((sum, paragraphNum) => 
            sum + paragraphGroups[paragraphNum].length, 0
        );

        const filteredChartData = chart_data.slice(0, maxIndex);

        return {
            chartData: filteredChartData,
            paragraphDividers,
            minMaxPoints,
            showDividers: true,
            average_length,
            trend
        };
    }   

    const sentenceChartData = useMemo(() => processdata(sentenceLengthData), [sentenceLengthData]);
    
    const baseOptions = createLineOptions(
        '',
        'Sentence Number',
        'Words'
    );
    // Adding the divider via the annotation options
    const options = {
        ...baseOptions,
        scales: {
            ...baseOptions.scales,
            x: {
                type: 'linear',
                position: 'bottom',
                min: Math.min(...sentenceChartData.chartData.map(d => d.x)) - 0.5,
                max: Math.max(...sentenceChartData.chartData.map(d => d.x)) + 0.5,
            }
        },
        plugins: {
            ...baseOptions.plugins,
            annotation: sentenceChartData.showDividers ? {
                annotations: sentenceChartData.paragraphDividers.reduce((acc, divider, index) => {
                    acc[`divider-${index}`] = {
                        type: 'line',
                        xMin: divider,
                        xMax: divider,
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        borderDash: [5, 5],
                    };
                    console.log(acc)
                    return acc;
                }, {} as Record<string, any>)
            } : undefined // Does not appear to work as of right now
        }
    };

    const chartData = {
        datasets: [{
            label: 'Sentence Length',
            data: sentenceChartData.chartData,
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            pointBackgroundColor: sentenceChartData.chartData.map((point, index) => {
                const minMaxPoint = sentenceChartData.minMaxPoints.find(p => p.globalIndex === point.x);
                if (minMaxPoint) {
                    return minMaxPoint.type === 'min' ? '#ef4444' : '#22c55e';
                }
                return '#3b82f6';
            }),
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: sentenceChartData.chartData.map((point) => {
                const minMaxPoint = sentenceChartData.minMaxPoints.find(p => p.globalIndex === point.x);
                return minMaxPoint ? 6 : 4;
            }),
            pointHoverRadius: sentenceChartData.chartData.map((point) => {
                const minMaxPoint = sentenceChartData.minMaxPoints.find(p => p.globalIndex === point.x);
                return minMaxPoint ? 8 : 6;
            }),
            fill: false,
            tension: 0.3,
        },
        {
            label: 'Average Length',
            data: sentenceChartData.chartData.map(point => ({
                x: point.x,
                y: sentenceChartData.average_length
            })),
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b',
            borderDash: [8, 4],
            pointRadius: 2,
            pointHoverRadius: 0,
            fill: false,
        }]
    }
    return (
        <ChartContainer chartTitle="Sentence Length Trends">
            <Line options={options} data={chartData} />
        </ChartContainer>
    );
}



const GrammarBreakdownChart = ({grammarData} : {grammarData : PartsOfSpeech}) => {
    const defaultOptions = createPieOptions();
    // Make it easier to use with the chart
    const processedData = useMemo(() => {
        const totalWords = Object.values(grammarData.breakdown).reduce((sum, item) => sum + item.count, 0);
        return {
            chartData: grammarData.chart_data,
            totalWords,
            mostCommon: grammarData.chart_data[0]?.label || ''
        };
    }, [grammarData]);

    const options = {
        ...defaultOptions,
        plugins: {
        ...defaultOptions.plugins,
        tooltip: {
            ...defaultOptions.plugins?.tooltip,
            callbacks: {
                label: (context: any) => {
                    const item = processedData.chartData[context.dataIndex];
                    const percentage = item.value.toFixed(1);
                    let label = item.label;
                    const wordCount = Math.round((item.value / 100) * processedData.totalWords);
                    label += `: ${percentage}% (${wordCount} words)`;
                    
                    return label;
                }
            }
        },
        legend: {
            ...defaultOptions.plugins?.legend,
            position: 'bottom' as const,
            labels: {
            ...defaultOptions.plugins?.legend?.labels,
            generateLabels: (chart: any) => {
                const data = chart.data;
                return data.labels.map((label: string, index: number) => {
                const item = processedData.chartData[index];
                const percentage = item.value.toFixed(1);
                
                return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[index],
                    strokeStyle: data.datasets[0].borderColor,
                    lineWidth: data.datasets[0].borderWidth,
                    hidden: false,
                    index: index
                };
                });
            }
            }
        }
        },
    };

    const chartData = {
        labels: processedData.chartData.map(item => item.label),
        datasets: [{
            label: 'Parts of Speech Breakdown',
            data: processedData.chartData.map(item => item.value),
            borderColor: processedData.chartData.map(() => 'rgba(255,255,255,0.5)'),
            borderWidth: 2,
            backgroundColor: grammarData.chart_data.map(item => item.color),
            hoverBorderWidth: 3
        }]
    };

    return (
        <ChartContainer chartTitle="Parts of Speech">
            <Pie options={options} data={chartData} />
        </ChartContainer>
    )
}

/* Chart Title */
const ChartTitle = ({ chartTitle }: { chartTitle: string }) => (
<h3 className="text-lg font-bold mb-4 text-black/70">{chartTitle}</h3>
);

/* Chart Container */
const ChartContainer = ({ chartTitle, children }: { chartTitle : string, children: React.ReactElement }) => (
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