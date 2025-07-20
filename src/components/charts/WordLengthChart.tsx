import { createBarOptions, chartColors } from "@/lib/utils/chartStyles";
import { ChartContainer } from "../analytics/VisualAnalytics";
import { WordLengthDistribution } from "@/types/visualAnalytics";
import { Bar } from "react-chartjs-2";

/* Word Length Distribution: Histogram */
export const WordLengthChart = ({ wordLengthData }: {wordLengthData: WordLengthDistribution} ) => {
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