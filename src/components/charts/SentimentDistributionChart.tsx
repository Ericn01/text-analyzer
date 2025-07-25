
import { Bar } from "react-chartjs-2";
import { createBarOptions } from "@/lib/utils/chartStyles";

const SentimentDistributionChart = ({ data }: { data: any }) => {
    
    const chartData =  {
        labels: ['Sentiment Distribution'],
        datasets: [
            {
                label: 'Positive',
                data: [data.positive.percentage],
                backgroundColor: '#10B981',
                borderWidth: 0,
            },
            {
                label: 'Neutral',
                data: [data.neutral.percentage],
                backgroundColor: '#6B7280',
                borderWidth: 0,
            },
            {
                label: 'Negative',
                data: [data.negative.percentage],
                backgroundColor: '#EF4444',
                borderWidth: 0,
            }
        ]
    }

    const chartOptions =  {
        ...createBarOptions(),
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            ...createBarOptions().scales,
            x: {
                stacked: true,
                display: false,
                max: 100
            },
            y: {
                stacked: true,
                display: false
            }
        },
        plugins: {
            ...createBarOptions().plugins,
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                label: function(context: any) {
                    const label = context.dataset.label;
                    const value = context.parsed.x;
                    const sentences = data[label.toLowerCase()].sentences;
                    return `${label}: ${value}% (${sentences} sentences)`;
                }
                }
            }
            }
        }

    return <Bar data={chartData} options={chartOptions} />;

};

export default SentimentDistributionChart;