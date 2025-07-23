import {
    fleschReadingEase,
    fleschKincaidGrade,
    smogIndex
} from 'text-readability';
import { ReadabilityMetrics } from "@/types/basicAnalytics";

const calculateReadability = (text: string) : ReadabilityMetrics => {
    const fre = fleschReadingEase(text);
    const fk = fleschKincaidGrade(text);
    const smog = smogIndex(text);

    return {
        flesch_reading_ease: {
            score: Math.round(fre * 10) / 10,
            description: getFleschDescription(fre),
            percentage: Math.round(fre)
        },
        flesch_kincaid_grade: {
            score: Math.round(fk * 10) / 10,
            description: getGradeDescription(fk),
            percentage: Math.round((fk / 12) * 100)
        },
        smog_index: {
            score: Math.round(smog * 10) / 10,
            description: getGradeDescription(smog),
            percentage: Math.round((smog / 12) * 100)
        }
    };
};

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


export default calculateReadability;
