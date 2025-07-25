import { OverviewMetrics } from "../../../types/basicAnalytics";

const isEmpty = (text: string): boolean => {
  return !text || text.trim().length === 0;
}

/**
 * Counts characters in text (excluding whitespace)
 */
export const countCharacters = (text: string): number => {
  if (isEmpty(text)) return 0;
  return text.replace(/\s/g, '').length; // Use replace instead of replaceAll for better compatibility
}

/**
 * Counts total characters including whitespace
 */
export const countTotalCharacters = (text: string): number => {
  return isEmpty(text) ? 0 : text.length;
}

/**
 * Counts words in text
 */
export const countWords = (text: string): number => {
  if (isEmpty(text)) return 0;
  return getWords(text).length;
}

/**
 * Counts sentences in text 
 */
export const countSentences = (text: string): number => {
    if (isEmpty(text)) return 0;
    
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && /[a-zA-Z]/.test(s)); // Ensure sentence has letters
    
    return sentences.length;
}


export const countParagraphs = (paragraphs: string[][]): number => {
  return paragraphs.filter(p => p.length > 0).length; // Filter out empty paragraphs
}

export const getReadingTimeMinutes = (text: string): number => {
    const AVG_READING_SPEED_WPM = 200;
    const wordCount = countWords(text);
    return Math.ceil(wordCount / AVG_READING_SPEED_WPM); // Round up to nearest minute
}

export const getWords = (text: string): string[] => {
    if (isEmpty(text)) return [];
    
    const words = text.toLowerCase().match(/\b[a-zA-Z](?:[a-zA-Z'-]*[a-zA-Z])?\b/g);
    return words ?? [];
}

export const getUniqueWords = (text: string): Set<string> => {
    const words = getWords(text);
    return new Set(words);
};

/**
 * Fixed average words per sentence calculation
 */
export const getAverageWordsPerSentence = (paragraphs: string[][]): number => {
    let totalWords = 0;
    let totalSentences = 0;
    
    paragraphs.forEach(sentences => {
        sentences.forEach(sentence => {
        if (sentence.trim().length > 0) {
            totalWords += countWords(sentence);
            totalSentences += 1;
        }
        });
    });
    
    return totalSentences > 0 ? totalWords / totalSentences : 0;
}


/**
 * Basic overview 
 */
export const getBasicOverview = (paragraphSentences: string[][], text: string): OverviewMetrics => {
    const totalWords = countWords(text);
    const uniqueWords = getUniqueWords(text).size;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(paragraphSentences);
    const characters = countTotalCharacters(text); // Include whitespace for total count
    const avgWordsPerSentence = sentences > 0 ? totalWords / sentences : 0;
    const lexicalDiversity = totalWords > 0 ? uniqueWords / totalWords : 0;
    
    return {
        total_words: totalWords,
        unique_words: uniqueWords,
        sentences: sentences,
        paragraphs: paragraphs,
        characters: characters,
        average_words_per_sentence: Math.round(avgWordsPerSentence * 100) / 100, // Round to 2 decimal places
        lexical_diversity: Math.round(lexicalDiversity * 1000) / 1000 // Round to 3 decimal places
    };
}