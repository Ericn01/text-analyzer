import { FileProcessingError } from "./errorProcessing";
import { parseHTMLDocument } from "./htmlParser";
import fs from 'fs/promises';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto'; // Add this import


export const processFileContent = async (filePath: string, fileType: string) => {
    try {
        switch (fileType) {
            case 'text/html':
            case 'text/plain':
                const content = await fs.readFile(filePath, 'utf8');
                return parseHTMLDocument(content);

            case 'application/pdf':
                throw new FileProcessingError('PDF analysis not implemented yet', fileType);

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                throw new FileProcessingError('DOCX analysis not implemented yet', fileType);

            default:
                throw new FileProcessingError(`Unsupported file type: ${fileType}`, fileType);
        }
    } catch (error) {
        if (error instanceof FileProcessingError) {
            throw error;
        }
        throw new FileProcessingError(`Failed to process file: ${error.message}`, fileType);
    }
};

// Separate file processing logic
export const createTempFile = async (file: File): Promise<string> => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = path.join(process.cwd(), 'tmp');
    const tempFilePath = path.join(tempDir, `${randomUUID()}-${file.name}`);
    
    try {
        await fs.mkdir(tempDir, { recursive: true });
        await writeFile(tempFilePath, buffer);
        return tempFilePath;
    } catch (error) {
        throw new FileProcessingError(`Failed to create temp file: ${error.message}`, file.type);
    }
};


// Validation function
export const validateFileUpload = (file: File) => {
    const validTypes = [
        'text/html',
        'text/plain', 
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.type)) {
        return { 
            isValid: false, 
            error: `Unsupported file type: ${file.type}. Supported types: HTML, TXT, PDF, DOCX` 
        };
    }
    
    if (file.size > config.maxFileSize) {
        return { 
            isValid: false, 
            error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB (max: ${Math.round(config.maxFileSize / 1024 / 1024)}MB)` 
        };
    }
    
    // Basic filename validation
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        return {
            isValid: false,
            error: 'Invalid filename characters detected'
        };
    }
    
    return { isValid: true };
};

// Safe cleanup function
export const safeCleanup = async (filePath: string): Promise<void> => {
    try {
        await unlink(filePath);
    } catch (cleanupError) {
        console.error('Failed to clean up temp file:', filePath, cleanupError);
    }
};

// Add configuration for service URLs
export const config = {
    nlpServiceUrl: process.env.NLP_SERVICE_URL || "http://localhost:8000/analyze",
    tempDir: process.env.TEMP_DIR || path.join(process.cwd(), 'tmp'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'), // 30s default
};