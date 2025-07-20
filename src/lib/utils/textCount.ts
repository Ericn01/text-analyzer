const isEmpty = (text: string): boolean => {
    return !text || text.trim().length === 0
}

/**
 * Counts words in text
 */
export const countWords = (text: string): number => {
    if (isEmpty(text)) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Counts sentences in text
 */
export const countSentences = (text: string): number => {
    if (isEmpty(text)) return 0;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    return sentences.length;
}