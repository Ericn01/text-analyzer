import rs from 'text-readability';
import { ReadabilityMetrics } from "../../../types/basicAnalytics";

const calculateReadability = (text: string) : ReadabilityMetrics => {
    const fre = rs.fleschReadingEase(text);
    const fk = rs.fleschKincaidGrade(text);
    const smog = rs.smogIndex(text);
    const automatedReadability = Math.min(rs.automatedReadabilityIndex(text), 14);
    const daleChall = rs.daleChallReadabilityScore(text); // Based off unfamiliar words
    
    // Lower percentage means more difficult in these scores
    return {
        flesch_reading_ease: {
            score: Math.round(fre * 10) / 10,
            description: getFleschDescription(fre),
            percentage: Math.round(fre)
        },
        flesch_kincaid_grade: {
            score: Math.round(fk * 10) / 10,
            description: getGradeDescription(fk),
            percentage: getPercentage(18, 0, fk) // Could theoretically go beyond 16
        },
        smog_index: {
            score: Math.round(smog * 10) / 10,
            description: getGradeDescription(smog),
            percentage: getPercentage(18, 3, smog)
        }, 
        automated_readability_index: {
            score: Math.round(automatedReadability * 10) / 10,
            description: getAutomatedReadabilityDescription(automatedReadability),
            percentage: getPercentage(14, 1, automatedReadability)
        }, 
        dale_chall_formula: {
            score: Math.round(daleChall * 10) / 10,
            description: getDaleChallReadabilityDescription(daleChall),
            percentage: getPercentage(10, 4.9, daleChall)
        }
    };
};

const getPercentage = (maxScore : number, minScore: number, actualScore: number) => 
    Math.max(0, Math.min(100, (maxScore - actualScore) / (maxScore - minScore) * 100));

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

function getDaleChallReadabilityDescription(score: number): string {
    if (score <= 4.9) {
        return "Easily understood by an average 4th grader";
    } else if (score <= 5.9) {
        return "Fifth to sixth grade reading level";
    } else if (score <= 6.9) {
        return "Seventh to eighth grade reading level";
    } else if (score <= 7.9) {
        return "Ninth to tenth grade reading level";
    } else if (score <= 8.9) {
        return "Eleventh to twelfth grade reading level";
    } else if (score <= 9.9) {
        return "College student reading level";
    } else {
        return "College graduate reading level";
    }
}

/**
 * Gets description for grade level scores
 */
function getAutomatedReadabilityDescription(grade: number): string {
    const roundedGrade = Math.round(grade);
    const suffix = "reading level";
    let description = "";

    switch (roundedGrade) {
        case 1:
            description = "Kindergarten ";
            break;
        case 2:
            description = "First grade ";
            break;
        case 3:
            description = "Second grade ";
            break;
        case 4:
            description = "Third grade ";
            break;
        case 5:
            description = "Fourth grade ";
            break;
        case 6:
            description = "Fifth grade ";
            break;
        case 7:
            description = "Sixth grade ";
            break;
        case 8:
            description = "Seventh grade ";
            break;
        case 9:
            description = "Eighth grade ";
            break;
        case 10:
            description = "Ninth grade ";
            break;
        case 11:
            description = "Tenth grade ";
            break;
        case 12:
            description = "Eleventh grade ";
            break;
        case 13:
            description = "Twelfth grade ";
            break;
        case 14:
            description = "College student ";
            break;
        default:
            return "Invalid score";
    }

    return description + suffix;
}


export default calculateReadability;

