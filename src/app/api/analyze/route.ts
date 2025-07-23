// app/api/analyze/route.ts (Modern App Router API Route)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import AnalyzeText from '@/lib/text-analysis/textAnalysis';

export async function POST(request: NextRequest) {
    try {
        // Get form data from request
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileExtension = file.type;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Create temporary file path
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempDir = path.join(process.cwd(), 'tmp');
        const tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);

        // Ensure temp directory exists
        await fs.mkdir(tempDir, { recursive: true });

        // Write file to temporary location
        await writeFile(tempFilePath, buffer);

        let content = '';

        try {
        const startTime = Date.now();
        
        // Process file based on type
        switch (fileExtension) {
            case '.html':
            case '.txt':
                content = await fs.readFile(tempFilePath, 'utf8');
                break;
            
            case '.pdf':
                // Will have to implement using a few libraries
                throw new Error('PDF analysis not implemented yet');
            
            case '.docx':
                // For DOCX processing, use mammoth
                throw new Error('DOCX analysis not implemented yet');
            
            default:
                throw new Error('Unsupported file type');
        }

        // Analyze the document 
        const analysis = await analyzeDocument(content, fileExtension);

        // Clean up temporary file
        await unlink(tempFilePath);

        // Generate unique ID for this analysis
        const analysisId = crypto.randomUUID(); // More secure than Date.now()

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            processingTimeMs: Date.now() - startTime,
            analysisId,
            analysis,
            filename: file.name,
            fileSize: file.size,
        });

        } catch (analysisError) {
        // Clean up file even if analysis fails
        try {
            await unlink(tempFilePath);
        } catch (cleanupError) {
            console.error('Failed to clean up temp file:', cleanupError);
        }
        throw analysisError;
        }

    } catch (error) {
        console.error('File upload/analysis error:', error);
        
        return NextResponse.json(
        {
            error: 'Analysis failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
        );
    }
}

const getDocumentMetadata = async (file : File) => {
    return {
        filename: file.name,
        originalName: file.name,
        type: file.type,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        category: "" // Will have to figure out how to retrieve this info
    }
}

// Helper function for document analysis
async function analyzeDocument(content: string, fileType: string) {
  // Implement your document analysis logic here
  // This is just a placeholder
  return {
    wordCount: content.split(/\s+/).length,
    characterCount: content.length,
    fileType,
    summary: 'Document analysis complete'
  };
}

export async function GET() {
    return NextResponse.json(
        { error: 'GET method not supported for file upload' },
        { status: 405 }
    );
}