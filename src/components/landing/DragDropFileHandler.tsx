import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DragDropFileHandler() {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUpload = async (file: File) => {
        // Move to the waiting page
        router.push("/analyzing");
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData, 
            });

            const result = await response.json();
            console.log(result)
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
        const maxSize = 10 * 1024 * 1024;
        
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= maxSize;

        if (!isValidType) {
            setError('File must be of type PDF, DOCX, TXT, or HTML');
            return false;
        } 
        if (!isValidSize) {
            setError('File size must be below 10MB')
            return false;
        }
        return true;
    };

    const handleBrowseClick = () => {
        inputRef.current?.click();
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
