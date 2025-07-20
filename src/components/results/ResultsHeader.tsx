const ResultsHeader = () => {
    return (
        <header className="bg-white drop-shadow-xl py-5 mb-6">
            <div className="container max-w-[1200px] mx-auto p-5">
                <nav className="flex justify-between items-center">
                    <h1 className="text-xl md:text-3xl text-[#333] font-black"> TextAnalyzer Results</h1>
                    <ul className="flex gap-5">
                        <li className="text-gray-600 md:text-lg py-2 px-4 rounded-lg transition delay-75 duration-300 ease hover:bg-[#667eea] hover:text-white hover:cursor-pointer"> Analysis </li>
                        <li className="text-gray-600 md:text-lg py-2 px-4 rounded-lg transition delay-75 duration-300 ease hover:bg-[#667eea] hover:text-white hover:cursor-pointer"> Export </li>
                        <li className="text-gray-600 md:text-lg py-2 px-4 rounded-lg transition delay-75 duration-300 ease hover:bg-[#667eea] hover:text-white hover:cursor-pointer"> New Analysis</li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default ResultsHeader;