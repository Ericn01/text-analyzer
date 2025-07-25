import { FileProcessingError } from "./errorProcessing";
import { parseHTMLDocument } from "./htmlParser";
import fs from 'fs/promises';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto'; // Add this import
import convertDocxToHTML from "./docxParser";


export const processFileContent = async (filePath: string, fileType: string) => {
    try {
        switch (fileType) {
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                const buffer = await fs.readFile(filePath);
                const htmlContent = await convertDocxToHTML(buffer);
                return parseHTMLDocument(htmlContent.value);

            case 'text/html':
            case 'text/plain':
                const content = await fs.readFile(filePath, 'utf8');
                return parseHTMLDocument(content);

            case 'application/pdf':
                throw new FileProcessingError('PDF analysis not implemented yet', fileType);

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