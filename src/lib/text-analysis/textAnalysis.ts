import { StructureMetrics } from "../../../types/basicAnalytics";
// Controller function for the Node.js part of the analysis
import calculateReadability from "./readibilityScores";
import { analyzeWordFrequency, getPartsOfSpeechBreakdown, getSentenceLengthTrends } from "./wordAnalysis";
import { SentimentAnalysis, KeywordExtraction, TopicModeling, LanguagePatterns } from "../../../types/advancedAnalytics";


type AnalyzeTextProps = {
    structure: StructureMetrics,
    textData: {
        paragraphSentences: string[][],
        fullText: string
    }
}

const AnalyzeText = async ({structure, textData} : AnalyzeTextProps) => {
    const {paragraphSentences, fullText} = textData;
    
    // Dependent on the type of document for parsing
    const structureData = structure;
    // Reading level extraction
    const readability = calculateReadability(fullText);

    // Chart data extraction 
    const wordFrequency = analyzeWordFrequency(fullText);
    const sentenceLengthTrends = getSentenceLengthTrends(paragraphSentences);
    const partsOfSpeech = getPartsOfSpeechBreakdown(fullText);

    return {
        "basic_analytics": {
            structure,
            readability
        },
        "visual_analytics": {
            wordFrequency,
            // have to add word length distri
            sentenceLengthTrends,
            partsOfSpeech
        }
    }
}

interface NLPResponse {
    sentiment_analysis: SentimentAnalysis,
    keyword_extraction: KeywordExtraction,
    topic_modeling: TopicModeling,
    language_patterns: LanguagePatterns
}

const nlpAnalysis = async (requestPath: string) : Promise<NLPResponse> => {
    const request = await fetch(requestPath);
    if (!request.ok){
        throw new Error("Could not retrieve data from API.")
    }
    const nlpAnalysis = await request.json();
    return nlpAnalysis;
}

export default AnalyzeText;