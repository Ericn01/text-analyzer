import LandingPage from "./components/LandingPage";
import Results from "./components/results/Results";
import { CircleQuestionMark } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-gradient-to-br from-[#667eea] to-[#764ba2] min-h-[100vh] text-[#333]">
      <LandingPage />
      <Results />
    </main>
  );
}
