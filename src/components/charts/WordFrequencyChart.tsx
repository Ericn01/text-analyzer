import { createBarOptions, chartColors } from "@/lib/utils/chartStyles";
import { ChartContainer } from "../analytics/VisualAnalytics";
import { WordFrequencyData } from "../../../types/visualAnalytics";
import { Bar } from "react-chartjs-2";

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