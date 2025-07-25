// app/api/analyze/route.ts (Modern App Router API Route)
import { NextRequest, NextResponse } from 'next/server';
import analyzeText from '@/lib/text-analysis/textAnalysis';
import { randomUUID } from 'crypto';
import { getNLPAnalysis } from '@/lib/file-processing/nlpAnalysisRequest';
import { FileProcessingError, NLPServiceError } from '@/lib/file-processing/errorProcessing';
import { createTempFile, 
        processFileContent, 
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

        tempFilePath = await createTempFile(file);

        // Processing/parsing file content (depending on the file type)
        const parsedDocument = await processFileContent(tempFilePath, file.type);

        // Get document basic doc information (metadata) 
        const documentInfo = getDocumentInfo(file)

        // Perform basic analysis
        const {basic_analytics, visual_analytics} = await analyzeText(parsedDocument);

        // Extract full document text for NLP analysis
        const fullText = parsedDocument.textData.fullText;
        
        // Perform NLP analysis
        const nlpAnalysisData = await getNLPAnalysis({
            nlpAnalysisUrl: config.nlpServiceUrl,
            fullText
        });  

         // Calculate summary fields from existing data
        const totalWords = basic_analytics.overview.total_words;
        const readingTimeMinutes = Math.ceil(totalWords / 200); // Average reading speed
        const sentimentScore = nlpAnalysisData.sentiment_analysis.overall_sentiment.score;
        const readingLevel = basic_analytics.readability.flesch_kincaid_grade.score;
        const writingStyle = getWritingStyle(nlpAnalysisData.language_patterns.stylistic_features.formal_language_score, readingLevel)
        const keyTopics = nlpAnalysisData.topic_modeling.primary_topics
            .slice(0, 5)
            .map(topic => topic.name.replace(/^Topic \d+: /, ''));
        const complexityLevel = basic_analytics.readability.flesch_reading_ease.description;

        const summaryData =  {
            total_words: totalWords,
            reading_time_minutes: readingTimeMinutes,
            sentiment_score: sentimentScore,
            reading_level: readingLevel,
            writing_style: writingStyle,
            key_topics: keyTopics,
            complexity_level: complexityLevel
        };

        // Remove temporary files
        await safeCleanup(tempFilePath);
        tempFilePath = null;

        // Now we generate a random ID for this analysis - to be stored on DB later.
        const analysisId = randomUUID();
            
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            processing_time_ms: Date.now() - startTime,
            document: documentInfo,
            summary: summaryData,
            basic_analytics: basic_analytics,
            visual_analytics: visual_analytics,
            advanced_features: {
                sentiment_analysis: nlpAnalysisData.sentiment_analysis,
                keyword_extraction: nlpAnalysisData.keyword_extraction,
                topic_modeling: nlpAnalysisData.topic_modeling,
                language_patterns: nlpAnalysisData.language_patterns
            },
            metadata: {
                analysis_id: analysisId,
                file_info: {
                    filename: file.name,
                    file_size: file.size,
                    original_name: documentInfo.originalName,
                    upload_time: documentInfo.uploadedAt
                }
            }
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
const getDocumentInfo = (file: File) => {
    return {
        filename: file.name,
        originalName: file.name,
        type: file.type,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        category: getFileCategory(file.type),
    };
}

 // Determine writing style based on formality and complexity
const getWritingStyle = (formalScore: number, complexityScore: number): string => {
    if (formalScore > 0.7) return "Formal Academic";
    if (formalScore > 0.4) return "Professional";
    if (complexityScore > 15) return "Technical";
    if (complexityScore > 10) return "Intermediate";
    return "Conversational";
};

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