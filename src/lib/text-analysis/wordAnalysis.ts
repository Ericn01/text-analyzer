import { SentenceLengthTrends, PartsOfSpeech, WordFrequencyData, WordLengthDistribution } from "../../../types/visualAnalytics";
import nlp from "compromise";
import { isStopWord } from "../utils/stopword";
import { getWords } from "../utils/textUtils";

export const analyzeWordFrequency = (text : string) : WordFrequencyData => {
    const words = getWords(text);

    const wordCount = new Map<string, number>();

    for (const word of words) {
        if (word.length > 2 && !isStopWord(word)) {
            wordCount.set(word, (wordCount.get(word) || 0) + 1)
        }
    }

    // Convert to array and sort by frequency (descending)
    const sortedWords = Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Get top 8


    // Compute the total amount of full, non stop words in the text
    const totalWords = words.filter(word => word.length > 2 && !isStopWord(word)).length;

    // Format results
    const top_words = sortedWords.map(([word, count]) => ({
        word,
        count,
        percentage: Number(((count / totalWords) * 100).toFixed(2))
    }));

    const chart_data = sortedWords.map(([word, count]) => ({
        label: word,
        value: count
    }));

    return { 
            top_words: top_words as WordFrequencyData['top_words'], 
            chart_data: chart_data as WordFrequencyData['chart_data'] 
        }
}

export const getWordLengthDistribution = (text: string) : WordLengthDistribution => {
    const words = getWords(text);

    const wordLengths = new Map<string, number>();

    const setWordLength = (lengthRange : string) => wordLengths.set(lengthRange, (wordLengths.get(lengthRange) || 0) + 1)

    for (const word of words) {
        const len = word.length;
        if (len > 0 && len < 4){
            setWordLength("1-3");
        } else if (len < 7){
            setWordLength("4-6");
        } else if (len < 10){
            setWordLength("7-9");
        }  else if (len < 13){
            setWordLength("10-12");
        } else if (len > 13){
            setWordLength("13+");
        }
    }

    const wordLengthsArray =  Array.from(wordLengths.entries());

    const buckets = wordLengthsArray.map(([length, count]) => (
        {
        length,
        count,
        percentage: Number(((count / words.length) * 100).toFixed(2))
    }));

    const chart_data = wordLengthsArray.map(([length, count]) => (
        {
        label: `${length} chars`,
        value: count
        }
    ));

    return { 
        buckets: buckets as WordLengthDistribution['buckets'], 
        chart_data: chart_data as WordLengthDistribution['chart_data'] 
    }
}


export const getSentenceLengthTrends = (paragraphs: string[][]): SentenceLengthTrends => {
    const data_points: SentenceLengthTrends["data_points"] = [];

    paragraphs.forEach((sentences, pIndex) => {
        sentences.forEach((sentence, sIndex) => {
        const length = sentence.split(/\s+/).filter(w => w.length > 0).length;
        data_points.push({
            sentence: sIndex + 1,
            length,
            paragraph: pIndex + 1
        });
        });
    });

    const chart_data = data_points.map((d, idx) => ({ x: idx + 1, y: d.length }));
    const average_length = parseFloat(
        (data_points.reduce((sum, d) => sum + d.length, 0) / data_points.length).toFixed(1)
    );

    return { 
            data_points: data_points as SentenceLengthTrends['data_points'], 
            chart_data: chart_data as SentenceLengthTrends['chart_data'], 
            average_length: average_length as SentenceLengthTrends['average_length'] 
        };
}

export const getPartsOfSpeechBreakdown = (text: string): PartsOfSpeech => {
    const doc = nlp(text);
    const totalWords = doc.wordCount();

    const categories = {
        nouns: doc.nouns().length,
        verbs: doc.verbs().length,
        adjectives: doc.adjectives().length,
        adverbs: doc.adverbs().length,
        prepositions: doc.prepositions().length,
        pronouns: doc.pronouns().length,
        conjunctions: doc.conjunctions().length,
        articles: doc.match('#Determiner').length
    };

    const totalTagged = Object.values(categories).reduce((a, b) => a + b, 0);
    const other = totalWords - totalTagged;

    const colorMap: Record<string, string> = {
        nouns: "#FF6B6B",
        verbs: "#4ECDC4",
        adjectives: "#45B7D1",
        adverbs: "#96CEB4",
        other: "#FFEAA7"
    };

    const breakdown = Object.fromEntries(
        Object.entries(categories).map(([key, count]) => [
        key,
            {
                count,
                percentage: parseFloat(((count / totalWords) * 100).toFixed(1)),
            },
        ])
    );

    const chart_data = [
        ...(['nouns', 'verbs', 'adjectives', 'adverbs'] as const).map(label => ({
        label: label[0].toUpperCase() + label.slice(1),
        value: breakdown[label].percentage,
        color: colorMap[label],
        })),
        {
        label: 'Other',
        value: parseFloat(((other / totalWords) * 100).toFixed(1)),
        color: colorMap.other,
        },
    ];

    return {
        breakdown: breakdown as PartsOfSpeech['breakdown'],
        chart_data: chart_data as PartsOfSpeech['chart_data']
    };
}
