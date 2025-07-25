import { StructureMetrics } from "../../../types/basicAnalytics";
import { getBasicOverview } from "../utils/textUtils";
// Controller function for the Node.js part of the analysis
import calculateReadability from "./readibilityScores";
import { analyzeWordFrequency, getPartsOfSpeechBreakdown, getSentenceLengthTrends, getWordLengthDistribution } from "./wordAnalysis";


type AnalyzeTextProps = {
    structure: StructureMetrics,
    textData: {
        paragraphSentences: string[][],
        fullText: string
    }
}

const analyzeText = async ({structure, textData} : AnalyzeTextProps) => {
    const {paragraphSentences, fullText} = textData;

    // Overview extraction 
    const overview = getBasicOverview(paragraphSentences, fullText);
    // Reading level extraction
    const readability = calculateReadability(fullText);

    // Chart data extraction 
    const word_frequency = analyzeWordFrequency(fullText);
    const word_length_distribution = getWordLengthDistribution(fullText)
    const sentence_length_trends = getSentenceLengthTrends(paragraphSentences);
    const parts_of_speech = getPartsOfSpeechBreakdown(fullText);

    return {
        "basic_analytics": {
            overview,
            structure,
            readability
        },
        "visual_analytics": {
            word_frequency,
            word_length_distribution,
            sentence_length_trends,
            parts_of_speech
        }
    }
}
export default analyzeText;