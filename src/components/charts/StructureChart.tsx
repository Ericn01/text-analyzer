import { createBarOptions, chartColors } from "@/lib/utils/chartStyles";
import { StructureMetrics } from "@/types/basicAnalytics";
import { ChartContainer } from "../analytics/VisualAnalytics";
import { formatMetricName } from "@/lib/utils/formatMetric";
import { Bar } from "react-chartjs-2";

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