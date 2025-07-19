"use client";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend,
} from 'chart.js';
import { VisualAnalytics, WordFrequencyData } from '@/app/types/visualAnalytics';
import { StructureMetrics } from '@/app/types/basicAnalytics';
import { Bar, Chart } from 'react-chartjs-2';
import { SectionHeader } from './Results';
import { formatMetricName } from '@/utils/formatMetric';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/* Top 20 words: Bar Chart */
export const WordFrequencyChart = ({ wordFrequencyData }: { wordFrequencyData: WordFrequencyData }) => {
    const wordFrequencyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: 'Word Frequency Chart',
            font: {
            size: 16,
            weight: 'bold' as const
            }
        },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                display: true,
                text: "Count"
                }
            },
            x: {
                title: {
                display: true,
                text: "Words"
                }
            }
        }
    };

    const data = { // Added const keyword
        labels: wordFrequencyData.top_words.map(item => item.word),
        datasets: [{
        label: 'Word Frequency',
        data: wordFrequencyData.top_words.map(item => item.count), // Fixed: used wordFrequencyData instead of WordFrequencyData
        backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
        }],
    };

    return (
        <ChartContainer>
            <ChartTitle chartTitle="Word Frequency" />
            <div className="flex-1 w-full">
                <Bar options={wordFrequencyOptions} data={data} />
            </div>
        </ChartContainer>
    );
};

// This chart will only exist in BasicAnalytics, but fits best here.
export const StructureChart = ({ structureData } : {structureData : StructureMetrics}) => {
    const chartData = {
        labels: Object.keys(structureData).map(key => formatMetricName(key)),
        datasets: [{
            label: 'Count',
            data: Object.values(structureData),
            backgroundColor: [
                '#3B82F6', // Blue for headings
                '#10B981', // Green for lists  
                '#8B5CF6', // Purple for links
                '#F59E0B'  // Orange for images
            ],
            borderColor: [
                '#2563EB',
                '#059669', 
                '#7C3AED',
                '#D97706'
            ],
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
        }]
    }

    const structureChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 6,
                displayColors: false,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6'
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 12
                    },
                    stepSize: 1
                }
            }
        },
    };

    return (
        <ChartContainer>
            <ChartTitle chartTitle="Document Structure Elements" />
            <div className="flex-1 w-full">
                <Bar options={structureChartOptions} data={chartData} />
            </div>
        </ChartContainer>
    )
}

/* Word Length Distribution: Histogram */
const WordLengthChart = ({ wordLengthData }: { wordLengthData: any }) => {
    const histogramOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: 'Word Length Distribution',
            font: {
            size: 16,
            weight: 'bold' as const
            }
        },
        },
        scales: {
        y: {
            beginAtZero: true,
            title: {
            display: true,
            text: "Number of Words"
            }
        },
        x: {
            title: {
            display: true,
            text: "Word Length Range"
            }
        }
        }
    };

    const data = {
        labels: wordLengthData.chart_data.map((item: any) => item.label),
        datasets: [{
        label: 'Word Count by Length',
        data: wordLengthData.chart_data.map((item: any) => item.value),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
        }],
    };

    return (
        <ChartContainer>
            <ChartTitle chartTitle="Word Length Distribution" />
            <div className="flex-1 w-full">
                <Bar options={histogramOptions} data={data} />
            </div>
        </ChartContainer>
    );
};

/* Chart Title */
const ChartTitle = ({ chartTitle }: { chartTitle: string }) => (
<h3 className="text-lg font-bold mb-3 text-black/70">{chartTitle}</h3>
);

/* Chart Container */
const ChartContainer = ({ children }: { children: React.ReactNode }) => (
<div className="bg-[#f8f9ff] rounded-lg p-5 h-[400px] flex flex-col">
    {children}
</div>
);

const ChartsGrid= ({
    word_frequency,
    word_length_distribution,
    sentence_length_trends,
    parts_of_speech
}: VisualAnalytics) => {
    return (
        <section className='mb-10'>
        <SectionHeader sectionName='Visual Analytics' />
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-5">
            <WordFrequencyChart wordFrequencyData={word_frequency} />
            <WordLengthChart wordLengthData={word_length_distribution} />
        </div>
        </section>
    );
};

export default ChartsGrid;