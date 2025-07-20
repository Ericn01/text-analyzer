import readability from 'automated-readability'
import { ReadabilityMetrics } from "@/types/basicAnalytics";

type PayloadTextContent = {
    type: "paragraph" | "sentence";
    text: string;
};

type ReadabilityProps = {
    textBlocks: PayloadTextContent[];
};

const calculateReadability = ({textBlocks} : ReadabilityProps) : ReadabilityMetrics => {
    const textCombined = textBlocks.map( (payloadText) => payloadText.text).join(". ");
    const metrics = readability(textCombined);

    return {
        flesch_reading_ease: {
            score: Math.round(metrics.fleschReadingEase * 10) / 10,
            description: getFleschDescription(metrics.fleschReadingEase),
            percentage: Math.round(metrics.fleschReadingEase)
        },
        flesch_kincaid_grade: {
            score: Math.round(metrics.fleschKincaidGradeLevel * 10) / 10,
            description: getGradeDescription(metrics.fleschKincaidGradeLevel),
            percentage: Math.round((metrics.fleschKincaidGradeLevel / 12) * 100)
        },
        smog_index: {
            score: Math.round(metrics.smogIndex * 10) / 10,
            description: getGradeDescription(metrics.smogIndex),
            percentage: Math.round((metrics.smogIndex / 12) * 100)
        }
    }
}

/**
 * Gets description for Flesch Reading Ease score
 */
function getFleschDescription(score: number): string {
    if (score >= 90) return "Very easy to read";
    if (score >= 80) return "Easy to read";
    if (score >= 70) return "Fairly easy to read";
    if (score >= 60) return "Standard";
    if (score >= 50) return "Fairly difficult to read";
    if (score >= 30) return "Difficult to read";
    return "Very difficult to read";
}

/**
 * Gets description for grade level scores
 */
function getGradeDescription(grade: number): string {
    const roundedGrade = Math.round(grade);
    if (roundedGrade <= 0) return "Error in calculation";
    if (roundedGrade <= 6) return `${roundedGrade}th grade level`;
    if (roundedGrade === 7) return "7th grade level";
    if (roundedGrade === 8) return "8th to 9th grade level";
    if (roundedGrade === 9) return "9th grade level";
    if (roundedGrade === 10) return "10th grade level";
    if (roundedGrade === 11) return "11th grade level";
    if (roundedGrade === 12) return "12th grade level";
    if (roundedGrade <= 16) return "College level";
    return "Graduate level";
}

