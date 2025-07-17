import Link from "next/link";

const Navigation = () => {
    return (
        <div className="bg-white rounded-xl p-5 shadow-xl sticky top-5 h-fit">
            <h3 className="mb-4 text-[#333] text-2xl font-bold">Quick Navigation</h3>
            <ul className="ml-5">
                <li className="mb-4 text-[#666] hover:"> 
                    <Link href="#summary"> Executive Summary </Link>
                </li>
                <li className="mb-4 text-[#666]">
                    <Link href="#basic" > Basic Analytics </Link>
                </li>
                <li className="mb-4 text-[#666]">
                    <Link href="#charts" > Visual Analytics </Link>
                </li>
                <li className="mb-4 text-[#666]">
                    <Link href="#advanced" > Advanced Features </Link>
                </li>
            </ul>
        </div>
    )
}

export default Navigation;