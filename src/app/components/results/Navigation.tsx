import Link from "next/link";

const Navigation = () => {
    return (
        <div className="bg-white rounded-3 p-5 shadow-xl sticky top-5 h-fit">
            <h3 className="mb-4 text-[#333]"></h3>
            <ul>
                <li className="mb-2 hover:"> 
                    <Link href="#summary"> Executive Summary </Link>
                </li>
                <li className="mb-2">
                    <Link href="#basic" > Basic Analytics </Link>
                </li>
                <li className="mb-2">
                    <Link href="#charts" > Visual Analytics </Link>
                </li>
                <li className="mb-2">
                    <Link href="#advanced" > Advanced Features </Link>
                </li>
            </ul>
        </div>
    )
}

export default Navigation;