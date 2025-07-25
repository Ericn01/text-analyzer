import { SentenceLengthTrends } from "../../../types/visualAnalytics";
import { XYDataPoint } from "../../../types/coreAnalytics";
import { useMemo } from "react";
import { createLineOptions } from "@/lib/utils/chartStyles";
import { ChartContainer } from "../analytics/VisualAnalytics";
import { Line } from "react-chartjs-2";

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