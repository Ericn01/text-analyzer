const ResultsHeader = () => {
    return (
        <header className="bg-white sticky drop-shadow-2xl py-4 px-1 mb-8">

            <div className="container max-w-[1200px] mx-auto p-5"></div>

            <nav className="flex justify-between items-center">
                <h1 className="text-2xl text-[#333] font-black"> TextAnalyzer Results</h1>
                <ul className="flex gap-5">
                    <li className="text-black py-2 px-4 rounded-lg transition delay-75 duration-300 ease hover:bg-[#667eea] hover:text-white"> Analysis </li>
                    <li className="text-black py-2 px-4 rounded-lg transition delay-75 duration-300 ease hover:bg-[#667eea] hover:text-white"> Export </li>
                    <li className="text-black py-2 px-4 rounded-lg transition delay-75 duration-300 ease hover:bg-[#667eea] hover:text-white"> New Analysis</li>
                </ul>
            </nav>
        </header>
    )
}