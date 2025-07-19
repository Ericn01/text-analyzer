// Analysis waiting page. For now it's just a spinner. Will add a progress bar eventually
const AnalyzingState = () => {
    return (
        <section id="analyzingState" className="flex flex-col text-center py-13 px-5 text-white bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className=
            "w-12 h-12 border-4 border-white/30 border-t-4 border-t-white rounded-full mt-0 mx-auto mb-5 animate-spin  "></div>
            <h2 className="text-3xl font-bold"> Analyzing your document... </h2>
            <p>This may take a few moments depending on the document size</p>
        </section>
    )
}

export default AnalyzingState;