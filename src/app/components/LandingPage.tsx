import DragDropFileHandler from "./upload/DragDropFileHandler";

const LandingPage = () => {
    return (
        <section className="flex flex-col justify-center items-center min-h-screen text-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className="max-w-[1200px] p-5">
                <h1 className="text-white text-5xl mb-4 font-bold">TextAnalyzer</h1>
                <p className="text-white/90 text-xl mb-12">Upload your document for comprehensive text analysis and insights</p>

                <DragDropFileHandler />

                {/* Supported Formats Tags */}
                <div className="flex mt-8 justify-center gap-[15px]">
                    <div className="bg-white/20 text-white py-2 px-4 rounded-[20px] text-[0.9rem]">PDF</div>
                    <div className="bg-white/20 text-white py-2 px-4 rounded-[20px] text-[0.9rem]">DOCX</div>
                    <div className="bg-white/20 text-white py-2 px-4 rounded-[20px] text-[0.9rem]">TXT</div>
                </div>

                {/* Progress Steps */}
                <div className="flex mt-12 justify-center items-center gap-8">
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="bg-white/30 w-[32px] h-[32px] rounded-full flex items-center justify-center font-black">1</div>
                        <span>Upload</span>
                    </div>
                    <div className="text-white/60 text-xl">→</div>
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="bg-white/30 w-[32px] h-[32px] rounded-full flex items-center justify-center font-black">2</div>
                        <span>Analyze</span>
                    </div>
                    <div className="text-white/60 text-xl">→</div>
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="bg-white/30 w-[32px] h-[32px] rounded-full flex items-center justify-center font-black">3</div>
                        <span>Results</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LandingPage;