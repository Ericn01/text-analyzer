import { useMemo } from "react";
import { createPieOptions } from "@/lib/utils/chartStyles";
import { PartsOfSpeech } from "@/types/visualAnalytics";
import { Pie } from "react-chartjs-2";
import { ChartContainer } from "../analytics/VisualAnalytics";

export const GrammarBreakdownChart = ({grammarData} : {grammarData : PartsOfSpeech}) => {
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