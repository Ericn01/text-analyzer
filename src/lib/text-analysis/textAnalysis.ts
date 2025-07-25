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
    const wordFrequency = analyzeWordFrequency(fullText);
    const wordLengthDistribution = getWordLengthDistribution(fullText)
    const sentenceLengthTrends = getSentenceLengthTrends(paragraphSentences);
    const partsOfSpeech = getPartsOfSpeechBreakdown(fullText);

    return {
        "basic_analytics": {
            overview,
            structure,
            readability
        },
        "visual_analytics": {
            wordFrequency,
            wordLengthDistribution,
            sentenceLengthTrends,
            partsOfSpeech
        }
    }
}
export default analyzeText;