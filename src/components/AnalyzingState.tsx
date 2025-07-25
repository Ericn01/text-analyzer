"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { AnalysisState, AnalysisStep } from "../../types/fileUpload";

import { useFileUpload } from "@/context/FileUploadContext";
import { performAnalysis } from "@/lib/text-analysis/performAnalysis";

export const ANALYSIS_STEPS: AnalysisStep[] = [
    { name: 'File Processing', description: 'Reading and parsing document content', weight: 15 },
    { name: 'Basic Analysis', description: 'Performing readability and structure analysis', weight: 35 },
    { name: 'NLP Processing', description: 'Advanced language processing and sentiment analysis', weight: 40 },
    { name: 'Finalizing', description: 'Compiling results and generating insights', weight: 10 }
];

const defaultState : AnalysisState = {
    status: 'waiting_for_file',
    progress: 0,
    currentStep: 'Waiting for file upload...',
    error: null,
    result: null
};

const AnalyzingState = () => {
    const router = useRouter();
    const { file } = useFileUpload();

    const [analysisState, setAnalysisState] = useState<AnalysisState>(defaultState);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const analysisStartedRef = useRef(false);

    // Initial analysis trigger
    useEffect(() => {
        if (!analysisStartedRef.current && file) { // Ensure file exists before starting analysis
            analysisStartedRef.current = true;
            setAnalysisState(prev => ({
                ...prev,
                status: 'processing',
                currentStep: ANALYSIS_STEPS[0]?.name || 'Starting analysis...', 
                progress: 0
            }));
            // Start the actual analysis process
            performAnalysis(file, setAnalysisState, setCurrentStepIndex, router);
        }
    }, [file, router]); // Dependency on file and router

    // Effect to manage progress simulation when currentStepIndex changes
    useEffect(() => {
        if (analysisState.status === 'completed') {
            setAnalysisState(prev => ({ ...prev, progress: 100 }));
        }
    }, [analysisState.status]);

    const getProgressPercentage = () => {
        // Ensure progress is between 0 and 100
        return Math.max(0, Math.min(100, analysisState.progress));
    };

    const getStatusMessage = () => {
        switch (analysisState.status) {
        case 'waiting_for_file':
            return 'Ready to analyze your document';
        case 'processing':
            return `Analyzing ${file?.name || 'document'}: ${analysisState.currentStep}...`;
        case 'completed':
            return 'Analysis completed successfully!';
        case 'error':
            return 'Analysis failed';
        default:
            return 'Processing...';
        }
    };

    return (
        <section id="analyzingState" className="flex flex-col items-center justify-center w-full h-full py-13 px-5 text-white bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className="w-14 h-14 border-4 border-white/30 border-t-4 border-t-white rounded-full mt-0 mx-auto mb-5 animate-spin"></div>
            <h2 className="text-3xl font-bold mb-4"> Analyzing your document... </h2>
            <p className="text-lg mb-6">{getStatusMessage()}</p>
            {/* Progress Bar Container */}
            <div className="w-full max-w-md bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
                {/* Progress Bar Fill */}
                <div
                    className="bg-white h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                ></div>
            </div>
            {/* Display progress percentage text */}
            <p className="text-xl font-medium">{Math.round(getProgressPercentage())}%</p>
        </section>
    );
};

export default AnalyzingState;