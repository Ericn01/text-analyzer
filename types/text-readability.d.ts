declare module 'text-readability' {
    export function fleschReadingEase(text: string): number;
    export function fleschKincaidGrade(text: string): number;
    export function smogIndex(text: string): number;
}