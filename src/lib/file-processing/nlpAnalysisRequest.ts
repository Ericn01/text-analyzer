import { NLPServiceError } from '@/lib/file-processing/errorProcessing';
import { config } from './processFileContent';
import { AdvancedFeatures } from '../../../types/advancedAnalytics';

type NLPReqestProps = {
    nlpAnalysisUrl: string,
    fullText: string
}

export const getNLPAnalysis = async ({nlpAnalysisUrl, fullText}: NLPReqestProps) : Promise<AdvancedFeatures> => {
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
const isValidNLPResponse = (response: any): response is AdvancedFeatures => {
    return (
        response &&
        typeof response === 'object' &&
        'sentiment_analysis' in response &&
        'keyword_extraction' in response &&
        'topic_modeling' in response &&
        'language_patterns' in response &&
        'readability_prediction' in response
    );
};


