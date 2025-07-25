import { ErrorResponse } from "../../../types/fileUpload";

export const getErrorMessage = (errorResponse: ErrorResponse): string => {
    switch (errorResponse.code) {
        case 'MISSING_FILE':
            return 'No file was selected. Please choose a file to upload.';
        case 'INVALID_FILE':
            return errorResponse.error;
        case 'FILE_PROCESSING_ERROR':
            return `Cannot process ${errorResponse.fileType} files: ${errorResponse.error}`;
        case 'NLP_SERVICE_ERROR':
            return 'Our analysis service is temporarily unavailable. Please try again later.';
        case 'INTERNAL_ERROR':
            return 'An unexpected error occurred. Please try again.';
        default:
            return errorResponse.error || 'Analysis failed';
    }
};