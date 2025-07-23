// app/api/analyze/route.ts (Modern App Router API Route)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto'; // Add this import
import AnalyzeText from '@/lib/text-analysis/textAnalysis';
import { parseHTMLDocument } from '@/lib/file-processing/htmlParser';

export async function POST(request: NextRequest) {
    try {
        // Get form data from request
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Use MIME type for file type detection
        const fileType = file.type;
        
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
        let parsedDocument;
        
        try {
            const startTime = Date.now();
            
            // Process file based on MIME type
            switch (fileType) {
                case 'text/html':
                case 'text/plain':
                    content = await fs.readFile(tempFilePath, 'utf8');
                    parsedDocument = parseHTMLDocument(content);
                    break;

                case 'application/pdf':
                    // Will have to implement using a few libraries
                    throw new Error('PDF analysis not implemented yet');
    
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    // For DOCX processing, use mammoth
                    throw new Error('DOCX analysis not implemented yet');

                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }
            
            // Get document metadata (removed async since it's not needed)
            const metadata = getDocumentMetadata(file);
            
            // Analyze the document
            const analysis = await AnalyzeText(parsedDocument);
            
            // Clean up temporary file
            await unlink(tempFilePath);
            
            // Generate unique ID for this analysis
            const analysisId = randomUUID(); // Now properly imported
            
            return NextResponse.json({
                success: true,
                metadata: metadata,
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

// Removed async since no async operations are performed
const getDocumentMetadata = (file: File) => {
    return {
        filename: file.name,
        originalName: file.name,
        type: file.type,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        category: "" // Will have to figure out how to retrieve this info
    };
}