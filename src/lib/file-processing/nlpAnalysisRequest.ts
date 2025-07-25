import { SentimentAnalysis, KeywordExtraction, TopicModeling, LanguagePatterns } from '../../../../types/advancedAnalytics';
import { NLPServiceError } from '@/lib/file-processing/errorProcessing';
import { config } from './processFileContent';

type NLPReqestProps = {
    nlpAnalysisUrl: string,
    fullText: string
}

// Move to types folder later
interface NLPResponse {
    sentiment_analysis: SentimentAnalysis,
    keyword_extraction: KeywordExtraction,
    topic_modeling: TopicModeling,
    language_patterns: LanguagePatterns
}

export const getNLPAnalysis = async ({nlpAnalysisUrl, fullText}: NLPReqestProps) : Promise<NLPResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout( () => controller.abort, config.requestTimeout); 

    try {
        const response = await fetch(nlpAnalysisUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({text: fullText}),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new NLPServiceError(
                `NLP service returned ${response.status}: ${errorText}`,
                response.status
            );
        }

        const nlpAnalysis = await response.json()

        if (!isValidNLPResponse(nlpAnalysis)){
            throw new NLPServiceError('Invalid response format from NLP service');
        }

        return nlpAnalysis
    } catch(error){
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new NLPServiceError('NLP service request timed out');
        }
        
        if (error instanceof NLPServiceError) {
            throw error;
        }
        
        throw new NLPServiceError(`Failed to connect to NLP service: ${error.message}`);
    }

}

// Adding this to ensure the response structure remains consistent in the future.
const isValidNLPResponse = (response: any): response is NLPResponse => {
    return (
        response &&
        typeof response === 'object' &&
        'sentiment_analysis' in response &&
        'keyword_extraction' in response &&
        'topic_modeling' in response &&
        'language_patterns' in response
    );
};


