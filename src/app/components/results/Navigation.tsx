import Link from "next/link";

const Navigation = () => {
    return (
        <div className="mb-5 md:mb-0 bg-white rounded-xl p-5 shadow-xl md:sticky top-5 h-fit">
            <h3 className="mb-4 text-[#333] text-2xl font-bold">Quick Navigation</h3>
            <ul className="ml-5">
                <li className="mb-2 text-[#666] px-3 py-2 rounded-md transition duration-300 hover:bg-[#667eea] hover:text-white hover:text-shadow-sm"> 
                    <Link href="#summary"> Executive Summary </Link>
                </li>
                <li className="mb-2 text-[#666] px-3 py-2 rounded-md transition duration-300 hover:bg-[#667eea] hover:text-white hover:text-shadow-sm">
                    <Link href="#basic" > Basic Analytics </Link>
                </li>
                <li className="mb-2 text-[#666] px-3 py-2 rounded-md transition duration-300 hover:bg-[#667eea] hover:text-white hover:text-shadow-sm">
                    <Link href="#charts" > Visual Analytics </Link>
                </li>
                <li className="mb-2 text-[#666] px-3 py-2 rounded-md transition duration-300 hover:bg-[#667eea] hover:text-white hover:text-shadow-sm">
                    <Link href="#advanced" > Advanced Features </Link>
                </li>
            </ul>
        </div>
    )
}

export default Navigation;