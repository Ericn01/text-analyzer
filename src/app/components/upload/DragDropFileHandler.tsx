'use client';

import { Upload, FileText } from "lucide-react";
import { useState, useRef, DragEvent, ChangeEvent } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]

type Message = {
    message: string;
    error: boolean;
}

const DragDropFileHandler = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<Message>({message: '', error: false}); // Message, error?

    const setDefaults = (e : DragEvent<HTMLDivElement>, dragActive : boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(dragActive);
    }

    const fileSelectLogic = (file : File | undefined) => {
        if (file && validateFile(file)) {
            setFile(file);
            setMessage({message: `Successfully Uploaded: ${file.name}`, error: false})
        }
    }

    const validateFile = (file: File) : boolean => {
        if (!ALLOWED_TYPES.includes(file.type)){
            setMessage({message: 'Invalid file type. Please upload a PDF, TXT, or DOCX file', error: true});
            return false;
        }
        if (file.size > MAX_FILE_SIZE){
            setMessage({message: 'File is too large. Max size is 10MB.', error: true});
            return false;
        }
        return true;
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        setDefaults(e, false);
        const droppedFile = e.dataTransfer.files[0];
        fileSelectLogic(droppedFile);
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        setDefaults(e, false);
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        setDefaults(e, true);
    };
    // Programatically clicks the box
    const handleSelectBoxClick = () => {
        fileInputRef?.current?.click();
    }

    const handleFileSelect = (e : ChangeEvent<HTMLInputElement> ) => {
        const selectedFile = e.target.files?.[0];
        fileSelectLogic(selectedFile);
    }

    return (
        <div>
            {/* Drag and drop region */}
                <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleSelectBoxClick}
                className="bg-white border-[3px] border-dashed border-[#667eea] rounded-[20px] px-10 py-15 w-full max-w-[600px] cursor-pointer transition-all duration-300 ease-in-out hover:border-[#764ba2] hover:bg-[#f8f9ff] hover:-translate-y-0.5">

                    {dragActive ? 
                            <Upload size={72} className="text-[#667eea] mb-4 mx-auto" /> 
                        
                        : (
                        <>
                            <FileText size={72} className="text-[#667eea] mb-4 mx-auto" />
                            <div className="text-[1.3rem] text-[#333] mb-2">Drop your document here or click to browse</div>
                            <div className="text-[#666] text-[0.9rem] font-semibold">Maximum file size: 10MB</div>
                            <input 
                                id="fileInput" 
                                type="file" 
                                accept=".pdf,.docx,.txt" 
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                        </>
                    )}
                </div>
                {message && message.error ? <p className="text-red-500 mt-3 font-bold"> {message.message} </p> : 
                                            <p className="text-green-500 mt-3 font-bold"> {message.message} </p>}
        </div>
    )
}

export default DragDropFileHandler;