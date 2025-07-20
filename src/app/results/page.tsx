import Results from "@/components/results/Results";
import LandingPage from "../../components/LandingPage";
import AnalyzingPage from "../analyzing/page";

export default function ResultsPage() {
    return (
        <main className="min-h-screen bg-white px-6 py-10">
            <Results />
            {/* FOR TESTING ONLY: REMOVE LATER */}
            {/*<AnalyzingPage />
            <LandingPage /> */}
        </main>
    );
}
