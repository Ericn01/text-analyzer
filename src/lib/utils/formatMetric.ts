/**
 * Takes a metric in a "snake_case" format, and converts it to a more readable "Snake case"
 * @param key the metric name
 * @returns the converted metric name
 */
export const formatMetricName = (key: string) => {
        return key.replaceAll("_", " ")
                .replace(/^./, str => str.toUpperCase())
                .trim();
};