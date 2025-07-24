import { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadState {
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
    error: string | null;
    fileName: string | null;
}

interface ErrorResponse {
    error: string;
    code: string;
    details?: string;
    fileType?: string;
    statusCode?: number;
}

export default function DragDropFileHandler() {
    const defaultUploadState : UploadState = {
        status: 'idle',
        progress: 0,
        error: null,
        fileName: null
    }

    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>(defaultUploadState);

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const resetUploadState = () => setUploadState({...defaultUploadState});

    const handleUpload = async (file: File) => {
        // Resetting any previous error
        resetUploadState();

        // Navigate to analyzing page immediately
        router.push(`/analyzing?fileName=${encodeURIComponent(file.name)}`);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData, 
            });

            if (!response.ok){
                console.error('Upload failed: ', response.status);
            }
        }
        catch (err) {
            console.error("Upload error: ", err);
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
            handleUpload(file)
        }
    };

    const validateFile = (file: File) => {
        const validTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            'text/plain',
            'text/html'];

        const maxSize = 10 * 1024 * 1024; // 10MB
        
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= maxSize;


        if (!isValidType) {
            setUploadState(prev => ({
                ...prev,
                status: 'error',
                error: 'File must be PDF, DOCX, TXT, or HTML format'
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

    const getStatusData = () => {
        switch(uploadState.status){
            case 'uploading':
                return <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-16 w-16 text-green-400" />;
            case 'error':
                return <AlertCircle className="h-16 w-16 text-red-400" />;
            default:
                return <UploadCloud className={`h-16 w-16 ${isDragging ? "text-blue-300 animate-bounce" : "text-white/70"}`} />;
        }
    };



    return (
        <div
            className={`w-full max-w-2xl mx-auto px-6 py-16 border-2 border-dashed rounded-2xl transition-colors duration-300
                ${isDragging ? 'border-blue-400 bg-blue-100/30' : 'border-white/30 bg-white/10'}
                ${isUploading ? 'pointer-events-none opacity-75' : ''}
            `}
            onDragOver={(e) => {
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
            <div className="flex flex-col items-center justify-center text-white gap-4">
                <UploadCloud className={`h-13 w-13 ${isDragging ? "text-blue-300 animate-bounce" : "text-white/70"}`} />
                <p className="text-xl font-semibold">
                    {isDragging ? "Drop your file here" : "Drag & drop your document or click to upload"}
                </p>
                <button
                    onClick={handleBrowseClick}
                    className="mt-4 px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-600 transition cursor-pointer"
                    >
                    Browse Files
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept=".pdf,.docx,.txt,.html"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && validateFile(file)) {
                            handleUpload(file);
                        } 
                    }}
                />
                {error && (
                    <div className="text-red-400 text-sm font-bold mt-2 p-2 bg-red-900/20 rounded-md">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
