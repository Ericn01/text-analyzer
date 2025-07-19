// This file will contain reusable chart styles and components

// Color palettes for consistent theming
export const chartColors = {
    primary: {
        blue: { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(37, 99, 235, 1)' },
        green: { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgba(5, 150, 105, 1)' },
        purple: { bg: 'rgba(139, 92, 246, 0.7)', border: 'rgba(124, 58, 237, 1)' },
        orange: { bg: 'rgba(245, 158, 11, 0.7)', border: 'rgba(217, 119, 6, 1)' },
        red: { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(220, 38, 38, 1)' },
    },
    multiColor: {
        backgrounds: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        ],
        borders: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        ],
    },
    structure: {
        backgrounds: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
        borders: ['#2563EB', '#059669', '#7C3AED', '#D97706'],
    }
};

// Typography and spacing constants
export const chartTheme = {
    fonts: {
        title: { size: 14, weight: 'bold' as const },
        axis: { size: 12, weight: 'bold' as const },
        tick: { size: 11 },
        legend: { size: 12 },
    },
    colors: {
        text: '#474151',
        textSecondary: '#6B7280',
        grid: '#f3f4f6',
        background: '#fff',
        border: '#e5e7eb',
    },
    spacing: {
        padding: { bottom: 5 },
    }
};

// Base chart options that all charts will inherit
const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
        display: false,
        },
        tooltip: {
        backgroundColor: chartTheme.colors.background,
        titleColor: chartTheme.colors.text,
        bodyColor: chartTheme.colors.text,
        borderColor: chartTheme.colors.border,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        },
    },
    scales: {
        x: {
        grid: {
            display: false, // Clean look by default
        },
        ticks: {
            color: chartTheme.colors.textSecondary,
            font: chartTheme.fonts.tick,
        },
        },
        y: {
        beginAtZero: true,
        grid: {
            color: chartTheme.colors.grid,
            lineWidth: 1,
        },
        ticks: {
            color: chartTheme.colors.textSecondary,
            font: chartTheme.fonts.tick,
        },
        },
    },
    animation: {
        duration: 800,
        easing: 'easeInOutQuart' as const,
    },
};


// Chart-specific option creators
export const createBarOptions = (title?: string, xLabel?: string, yLabel?: string) => ({
    ...baseChartOptions,
    plugins: {
        ...baseChartOptions.plugins,
        title: title ? {
        display: true,
        text: title,
        font: chartTheme.fonts.title,
        color: chartTheme.colors.text,
        padding: chartTheme.spacing.padding,
        } : { display: false },
    },
    scales: {
        ...baseChartOptions.scales,
        x: {
        ...baseChartOptions.scales.x,
        title: xLabel ? {
            display: true,
            text: xLabel,
            color: chartTheme.colors.textSecondary,
            font: chartTheme.fonts.axis,
        } : { display: false },
        },
        y: {
        ...baseChartOptions.scales.y,
        title: yLabel ? {
            display: true,
            text: yLabel,
            color: chartTheme.colors.textSecondary,
            font: chartTheme.fonts.axis,
        } : { display: false },
        },
    },
});

export const createLineOptions = (title?: string, xLabel?: string, yLabel?: string) => ({
    ...baseChartOptions,
    elements: {
        line: {
        tension: 0.3, // Smooth curves
        },
        point: {
        radius: 4,
        hoverRadius: 6,
        },
    },
    plugins: {
        ...baseChartOptions.plugins,
        title: title ? {
        display: true,
        text: title,
        font: chartTheme.fonts.title,
        color: chartTheme.colors.text,
        padding: chartTheme.spacing.padding,
        } : { display: false },
    },
    scales: {
        ...baseChartOptions.scales,
        x: {
        ...baseChartOptions.scales.x,
        grid: { display: true, color: chartTheme.colors.grid }, // Show grid for line charts
        title: xLabel ? {
            display: true,
            text: xLabel,
            color: chartTheme.colors.textSecondary,
            font: chartTheme.fonts.axis,
        } : { display: false },
        },
        y: {
        ...baseChartOptions.scales.y,
        title: yLabel ? {
            display: true,
            text: yLabel,
            color: chartTheme.colors.textSecondary,
            font: chartTheme.fonts.axis,
        } : { display: false },
        },
    },
});

export const createPieOptions = (title?: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
            font: chartTheme.fonts.legend,
            color: chartTheme.colors.text,
            padding: 20,
        },
        },
        title: title ? {
        display: true,
        text: title,
        font: chartTheme.fonts.title,
        color: chartTheme.colors.text,
        padding: chartTheme.spacing.padding,
        } : { display: false },
        tooltip: {
        backgroundColor: chartTheme.colors.background,
        titleColor: chartTheme.colors.text,
        bodyColor: chartTheme.colors.text,
        borderColor: chartTheme.colors.border,
        borderWidth: 1,
        cornerRadius: 6,
        },
    },
    animation: {
        duration: 800,
        easing: 'easeInOutQuart' as const,
    },
});
