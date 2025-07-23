/**
 * Takes a metric in a "snake_case" format, and converts it to a more readable "Snake case"
 * @param key the metric name
 * @returns the converted metric name
 */
export const formatMetricName = (key: string, allUpperCase=false) => {
        const separatedWords = key.replaceAll("_", " ")
        const metricUppercase = allUpperCase ? separatedWords.replace(/\b\w/g, str => str.toUpperCase()) : 
                        separatedWords.replace(/^./, str => str.toUpperCase());
        return metricUppercase.trim();
};