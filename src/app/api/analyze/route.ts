// app/api/analyze/route.ts (Modern App Router API Route)
import { NextRequest, NextResponse } from 'next/server';
import AnalyzeText from '@/lib/text-analysis/textAnalysis';
import { randomUUID } from 'crypto';
import getNLPAnalysis from '@/lib/file-processing/nlpAnalysisRequest';
import { FileProcessingError, NLPServiceError } from '@/lib/file-processing/errorProcessing';
import { createTempFile, 
        processFileContent, 
        validateFileUpload, 
        safeCleanup, 
        config } 
from '@/lib/file-processing/processFileContent';


export async function POST(request: NextRequest) {
    // set temporary file path as null for now
    let tempFilePath: string | null = null;
    const startTime = Date.now()

    try {
        // Get form data from request
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded', code: 'MISSING_FILE'},
                { status: 400}
            );
        }

        const validation = validateFileUpload(file);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error, code: 'INVALID_FILE'},
                { status: 400}
            );
        }

        tempFilePath = await createTempFile(file);

        // Processing/parsing file content (depending on the file type)
        const parsedDocument = processFileContent(tempFilePath, file.type);

        // Get document metadata 
        const metadata = getDocumentMetadata(file)

    
        // Perform basic analysis
        const basicAnalysisData = await AnalyzeText(parsedDocument);

        // Extract full document text for NLP analysis
        const fullText = parsedDocument.textData.fullText;
        
        // Perform NLP analysis
        const nlpAnalysisData = await getNLPAnalysis({
            nlpAnalysisUrl: config.nlpServiceUrl,
            fullText
        });

        console.log(`BASIC ANALYSIS:\n${"=".repeat(20)}\n`, basicAnalysisData);
        console.log(`\nNLP ANALYSIS:\n${"=".repeat(20)}\n`, nlpAnalysisData);

        // Remove temporary files
        await safeCleanup(tempFilePath);
        tempFilePath = null;

        // Now we generate a random ID for this analysis - to be stored on DB later.
        const analysisId = randomUUID();
            
        return NextResponse.json({
            success: true,
            metadata: metadata,
            timestamp: new Date().toISOString(),
            processingTimeMs: Date.now() - startTime,
            analysisId,
            basicAnalysisData,
            nlpAnalysisData,
            filename: file.name,
            fileSize: file.size,
        });
            
        } catch (error) {
            if (tempFilePath){
                await safeCleanup(tempFilePath);
            }
            console.error('File upload/analysis error:', error);
            
            // Return the message based off the type of error
            returnErrorType(error);
    }
}

// Metadata extraction
const getDocumentMetadata = (file: File) => {
    return {
        filename: file.name,
        originalName: file.name,
        type: file.type,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        category: getFileCategory(file.type),
    };
}

const getFileCategory = (mimeType: string): string => {
    switch (mimeType) {
        case 'text/html':
            return 'Web Document';
        case 'text/plain':
            return 'Text Document';
        case 'application/pdf':
            return 'PDF Document';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'Word Document';
        default:
            return 'Unknown';
    }
};

const returnErrorType = (error : any) => {
    // Return appropriate error response based on error type
        if (error instanceof FileProcessingError) {
            return NextResponse.json(
                { 
                    error: error.message, 
                    code: 'FILE_PROCESSING_ERROR', 
                    fileType: error.fileType 
                },
                { status: 422 }
            );
        }
        
        if (error instanceof NLPServiceError) {
            return NextResponse.json(
                { 
                    error: 'NLP analysis failed', 
                    code: 'NLP_SERVICE_ERROR', 
                    details: error.message,
                    statusCode: error.statusCode
                },
                { status: 503 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                error: 'Analysis failed',
                code: 'INTERNAL_ERROR',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
}