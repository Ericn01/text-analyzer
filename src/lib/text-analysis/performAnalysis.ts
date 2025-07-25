import { ANALYSIS_STEPS } from "@/components/AnalyzingState";
import { getErrorMessage } from "../utils/errorMessages";

export const performAnalysis = async (
    file: File,
    setAnalysisState: any,
    setCurrentStepIndex: (i: number) => void,
    router: any
) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });
            // Calculate cumulative progress for each step
        let cumulativeProgress = 0;
        
        for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
            const step = ANALYSIS_STEPS[i];
            cumulativeProgress += step.weight;
        
            // Update current step
            setCurrentStepIndex(i);
            setAnalysisState((prev: any) => ({
                ...prev,
                currentStep: step.name,
                progress: cumulativeProgress
            }));
        
            // Wait for weighted timeout (only if not the last step)
            if (i < ANALYSIS_STEPS.length - 1) {
                const timeout = step.weight * 50;
                await new Promise((resolve) => setTimeout(resolve, timeout));
            }
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(getErrorMessage(result));
        }

        setAnalysisState((prev: any) => ({
            ...prev,
            status: 'completed',
            progress: 100,
            currentStep: 'Analysis completed!',
            result
        }));

        sessionStorage.setItem('analysisResult', JSON.stringify(result));
        setTimeout(() => router.push('/results'), 1000); // move to results page. 

    } catch (error) {
        setAnalysisState((prev: any) => ({
            ...prev,
            status: 'error',
            error: error instanceof Error ? error.message : 'Analysis failed',
            progress: 0
        }));
    }
};