import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";

export default function DragDropFileHandler() {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
        // Handle file upload here
        console.log("Dropped file:", file);
        }
    };

    const validateFile = (file: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const maxSize = 5 * 1024 * 1024;
        return validTypes.includes(file.type) && file.size <= maxSize;
    };

    const handleBrowseClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className={`w-full max-w-2xl mx-auto px-6 py-16 border-2 border-dashed rounded-2xl transition-colors duration-300
                ${isDragging ? 'border-blue-400 bg-blue-100/30' : 'border-white/30 bg-white/10'}
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
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && validateFile(file)) {
                            console.log("Selected file:", file);
                        } else{
                            console.error("File failed to upload")
                        }
                    }}
                />
            </div>
        </div>
    );
}
