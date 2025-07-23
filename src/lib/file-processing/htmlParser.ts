import { JSDOM } from 'jsdom';
import { extractStructureHTML } from '../text-analysis/extractStructure';

/**
 * Analyzes HTML content to extract document structure and readability metrics
 * @param htmlContent - The HTML string to analyze
 * @returns Complete document analysis
 */
export const parseHTMLDocument = (htmlContent : string) => {
    // Begin by creating the DOM from the HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extract structure metrics
    const structure = extractStructureHTML(document);

    // Extract the text content from the DOM for analysis
    const textData = extractTextData(document)

    return {textData, structure}
} 

export const extractTextData = (document: Document): {
    paragraphSentences: string[][];
    fullText: string;
} => {
    // Remove non-content elements
    document.querySelectorAll('script, style, noscript, iframe, nav, header, footer, aside').forEach(el => el.remove());

    const contentBlocks = Array.from(document.querySelectorAll('p, div, section, article, li, blockquote'));
    const paragraphSentences: string[][] = [];
    const fullTextParts: string[] = [];

    contentBlocks.forEach(el => {
        const text = el.textContent?.trim() ?? '';
        if (text && text.length > 10) { 
            const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
            const trimmed = sentences.map(s => s.trim());
            paragraphSentences.push(trimmed);
            fullTextParts.push(trimmed.join(' '));
        }
    });

    // Fallback: if no blocks detected, pull raw text from <body>
    if (paragraphSentences.length === 0) {
        const bodyText = document.body?.textContent?.trim() ?? '';
        if (bodyText) {
            const sentences = bodyText.match(/[^.!?]+[.!?]+/g) ?? [bodyText];
            const trimmed = sentences.map(s => s.trim());
            paragraphSentences.push(trimmed);
            fullTextParts.push(trimmed.join(' '));
        }
    }

    return {
        paragraphSentences,
        fullText: fullTextParts.join(" "),
    };
};




