import { FileText } from "lucide-react";

const LandingPage = () => {
    return (
        <section className="flex flex-col justify-center items-center min-h-screen text-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className="max-w-[1200px] p-5">
                <h1 className="text-white text-5xl mb-4 font-bold">TextAnalyzer</h1>
                <p className="text-white/90 text-xl mb-12">Upload your document for comprehensive text analysis and insights</p>
                
                <div className="bg-white border-[3px] border-dashed border-[#667eea] rounded-[20px] px-10 py-15 w-full max-w-[600px] cursor-pointer transition-all duration-300 ease-in-out hover:border-[#764ba2] hover:bg-[#f8f9ff] hover:-translate-y-0.5">
                    <FileText size={72} className="text-[#667eea] mb-4 mx-auto" />
                    <div className="text-[1.3rem] text-[#333] mb-2">Drop your document here or click to browse</div>
                    <div className="text-[#666] text-[0.9rem] font-semibold">Maximum file size: 10MB</div>
                    <input 
                        id="fileInput" 
                        type="file" 
                        accept=".pdf,.docx,.txt" 
                        className="hidden"
                    />
                </div>
                
                {/* Supported Formats Tags */}
                <div className="flex mt-8 justify-center gap-[15px]">
                    <div className="bg-white/20 text-white py-2 px-4 rounded-[20px] text-[0.9rem]">PDF</div>
                    <div className="bg-white/20 text-white py-2 px-4 rounded-[20px] text-[0.9rem]">DOCX</div>
                    <div className="bg-white/20 text-white py-2 px-4 rounded-[20px] text-[0.9rem]">TXT</div>
                </div>
                
                {/* Progress Steps */}
                <div className="flex mt-12 items-center gap-8">
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="bg-white/30 w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold">1</div>
                        <span>Upload</span>
                    </div>
                    <div className="text-white/60 text-xl">→</div>
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="bg-white/30 w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold">2</div>
                        <span>Analyze</span>
                    </div>
                    <div className="text-white/60 text-xl">→</div>
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="bg-white/30 w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold">3</div>
                        <span>Results</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LandingPage;