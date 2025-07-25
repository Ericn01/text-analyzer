import { createBarOptions } from "@/lib/utils/chartStyles";
import { formatMetricName } from "@/lib/utils/formatMetric";
import { ReadabilityMetric, ReadabilityMetrics } from "../../../types/basicAnalytics";
import { Bar } from "react-chartjs-2";

const ReadabilityChart = ({ readabilityData }: { readabilityData: ReadabilityMetrics }) => {
  // Prepare data for horizontal bar chart
    const chartData = {
        labels: Object.keys(readabilityData).map(key => formatMetricName(key, true)),
        datasets: [{
        label: 'Reading Difficulty (%)',
        data: Object.values(readabilityData).map(metric => metric.percentage),
        backgroundColor: Object.values(readabilityData).map(metric => {
            const percentage = metric.percentage;
            if (percentage >= 80) return 'rgba(34, 197, 94, 0.8)'; // Green
            if (percentage >= 60) return 'rgba(234, 179, 8, 0.8)'; // Yellow
            return 'rgba(239, 68, 68, 0.8)'; // Red
        }),
        borderColor: Object.values(readabilityData).map(metric => {
            const percentage = metric.percentage;
            if (percentage >= 80) return 'rgb(34, 197, 94)'; // Green
            if (percentage >= 60) return 'rgb(234, 179, 8)'; // Yellow
            return 'rgb(239, 68, 68)'; // Red
        }),
        borderWidth: 1,
        }]
    };

    // Create horizontal bar chart options
    const chartOptions = {
        ...createBarOptions('Reading Difficulty Comparison', 'Difficulty Score (%)', 'Readability Metrics'),
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            ...createBarOptions().plugins,
        title: {
            display: true,
            text: 'Reading Difficulty Scores Comparison',
        },
        legend: {
            display: false, // Hide legend since we only have one dataset
        },
        tooltip: {
            callbacks: {
            afterLabel: (context: any) => {
                const metricName = Object.keys(readabilityData)[context.dataIndex];
                const metric = readabilityData[metricName] as ReadabilityMetric;
                return [
                `Score: ${metric.score}`,
                `Description: ${metric.description}`
                ];
            }
            }
        }
        },
        scales: {
        x: {
            beginAtZero: true,
            max: 100,
            title: {
            display: true,
            text: 'Difficulty Score (%)',
            },
            ticks: {
            callback: function(value: any) {
                return value + '%';
            }
            }
        },
        y: {
            title: {
            display: true,
            text: 'Readability Metrics',
            }
        }
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div style={{ height: '400px' }}>
                <Bar data={chartData} options={chartOptions} />
            </div>
            
            {/* Legend/Summary below chart */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>High Difficulty (0-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Medium Difficulty (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Low Difficulty (80-100%)</span>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ReadabilityChart;