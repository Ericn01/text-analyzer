import { Line } from "react-chartjs-2";
import { TopicEvolution } from "../../../types/advancedAnalytics";
import { chartColors, createLineOptions } from "@/lib/utils/chartStyles";

const EvolutionChart = ({ data }: { data: TopicEvolution[] }) => {
  const topics = [...new Set(data.map(d => d.topic))];
  
  const datasets = topics.map((topic, idx) => {
    const topicData = data.filter(d => d.topic === topic);
    return {
      label: topic,
      data: topicData.map(d => ({
        x: d.paragraph_range,
        y: d.intensity * 100
      })),
      borderColor: chartColors.multiColor.borders[idx % chartColors.multiColor.borders.length],
      backgroundColor: chartColors.multiColor.backgrounds[idx % chartColors.multiColor.backgrounds.length],
      tension: 0.4,
      fill: false,
      pointRadius: 6,
      pointHoverRadius: 8,
    };
  });

  // Get base options first
  const baseOptions = createLineOptions('Topic Evolution Across Document', 'Paragraph Range', 'Intensity (%)');
  
  const chartOptions = {
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        ...baseOptions.plugins.tooltip,
        backgroundColor: 'white',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}% intensity`;
          }
        }
      }
    },
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales.x,
        type: 'category' as const,
        grid: { 
          ...baseOptions.scales.x.grid,
          color: '#f3f4f6' 
        }
      },
      y: {
        ...baseOptions.scales.y,
        beginAtZero: true,
        max: 100,
        grid: { 
          ...baseOptions.scales.y.grid,
          color: '#f3f4f6' 
        },
        ticks: {
          ...baseOptions.scales.y.ticks,
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <Line options={chartOptions} data={{ datasets }} />
    </div>
  );
};

export default EvolutionChart;