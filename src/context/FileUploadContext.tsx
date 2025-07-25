"use client";
import { createContext, useContext, useState } from 'react';

const FileUploadContext = createContext<{
    file: File | null;
    setFile: (file: File) => void;
}>({ file: null, setFile: () => {} });

export const FileUploadProvider = ({ children }: { children: React.ReactNode }) => {
    const [file, setFile] = useState<File | null>(null);
    return (
        <FileUploadContext.Provider value={{ file, setFile }}>
            {children}
        </FileUploadContext.Provider>
    );
};

export const useFileUpload = () => useContext(FileUploadContext);
