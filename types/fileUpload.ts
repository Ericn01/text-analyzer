
export interface AnalysisState {
    status: 'waiting_for_file' | 'processing' | 'completed' | 'error';
    progress: number;
    currentStep: string;
    error: string | null;
    result: any | null;
}

// Data presented during each step of the file analysis
export interface AnalysisStep {
    name: string;
    description: string;
    weight: number; // percentage of completion (estimate)
}

// File upload state 
export interface UploadState {
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
    error: string | null;
    fileName: string | null;
}


// Generic interface for receiving errors (HTTP and client-side)
export interface ErrorResponse {
    error: string;
    code: string;
    details?: string;
    fileType?: string;
    statusCode?: number;
}