import { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { UploadState } from "../../../types/fileUpload";
import { useFileUpload } from "@/context/FileUploadContext";

export default function DragDropFileHandler() {
    const defaultUploadState : UploadState = {
        status: 'idle',
        progress: 0,
        error: null,
        fileName: null
    }

    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>(defaultUploadState);

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { setFile } = useFileUpload(); // file upload context

    const resetUploadState = () => setUploadState({...defaultUploadState});

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
            setFile(file);
            router.push(`/analyzing`);
        }
    };

    const validateFile = (file: File) => {
        const validTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            'text/plain',
            'text/html',
            'text/markdown'
        ];

        const maxSize = 10 * 1024 * 1024; // 10MB
        
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= maxSize;

        if (!isValidType) {
            setUploadState(prev => ({
                ...prev,
                status: 'error',
                error: 'File must be PDF, DOCX, TXT, Markdown or HTML format'
            }));
            return false;
        } 

        if (!isValidSize) {
            setUploadState(prev => ({
                ...prev,
                status: 'error',
                error: `File size must be under ${Math.round(maxSize / 1024 / 1024)}MB (current: ${Math.round(file.size / 1024 / 1024)}MB)`
            }));
            return false;
        }
        return true;
    };

    const handleBrowseClick = () => {
        if (uploadState.status === 'uploading') return;
        inputRef.current?.click();
    };

    const handleRetry = () => {
        resetUploadState();
    };

    const getStatusIcon = () => {
        switch (uploadState.status) {
            case 'uploading':
                return <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-16 w-16 text-green-400" />;
            case 'error':
                return <AlertCircle className="h-16 w-16 text-red-400" />;
            default:
                return <UploadCloud className={`h-16 w-16 ${isDragging ? "text-blue-300 animate-bounce" : "text-white/70"}`} />;
        }
    }

    const getStatusText = () => {
        switch (uploadState.status) {
            case 'uploading':
                return `Uploading ${uploadState.fileName}...`;
            case 'success':
                return 'Upload successful! Redirecting...';
            case 'error':
                return 'Upload failed';
            default:
                return isDragging ? "Drop your file here" : "Drag & drop your document or click to upload";
        }
    };

    const isDisabled = uploadState.status === 'uploading' || uploadState.status === 'success';

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <div
                className={`px-6 py-16 border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    isDragging 
                        ? 'border-blue-400 bg-blue-100/30 scale-[1.02]' 
                        : uploadState.status === 'error'
                        ? 'border-red-400 bg-red-100/10'
                        : uploadState.status === 'success'
                        ? 'border-green-400 bg-green-100/10'
                        : 'border-white/30 bg-white/10'
                } ${
                    isDisabled ? 'pointer-events-none' : ''
                }`}
                onDragOver={(e) => {
                    if (isDisabled) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                }}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center text-white gap-6">
                    {getStatusIcon()}
                    
                    <div className="text-center space-y-2">
                        <p className="text-xl font-semibold">
                            {getStatusText()}
                        </p>
                        
                        {uploadState.status === 'uploading' && (
                            <div className="w-64 bg-white/20 rounded-full h-2 mx-auto">
                                <div 
                                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadState.progress}%` }}
                                />
                            </div>
                        )}

                        {uploadState.status === 'idle' && (
                            <p className="text-sm text-white/60">
                                Supports PDF, DOCX, TXT, Markdown and HTML files up to 10MB
                            </p>
                        )}
                    </div>

                    {uploadState.status === 'idle' && (
                        <button
                            onClick={handleBrowseClick}
                            className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 font-medium"
                        >
                            Browse Files
                        </button>
                    )}

                    {uploadState.status === 'error' && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        hidden
                        accept=".pdf,.docx,.txt,.html,.md"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && validateFile(file)) {
                                setFile(file);
                                router.push(`/analyzing`);
                            }
                            // Clear the input so the same file can be uploaded again
                            e.target.value = '';
                        }}
                    />
                </div>
            </div>

            {/* Error display */}
            {uploadState.error && (
                <div className="bg-red-900/20 border border-red-400/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-red-400 font-medium">Error</p>
                        <p className="text-red-300 text-sm mt-1">{uploadState.error}</p>
                    </div>
                    <button
                        onClick={() => setUploadState(prev => ({ ...prev, error: null }))}
                        className="text-red-400 hover:text-red-300 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* File info display during upload */}
            {uploadState.fileName && uploadState.status === 'uploading' && (
                <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-white/70" />
                    <div className="flex-1">
                        <p className="text-white font-medium text-sm">{uploadState.fileName}</p>
                        <p className="text-white/60 text-xs">Processing document...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
