import { JSDOM } from 'jsdom';
import nlp from 'compromise'
import { Readability } from '@mozilla/readability';
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

    // Remove unwanted elements from the HTML document 
    document.querySelectorAll(unwantedSelectors.join(", ")).forEach(el => el.remove());

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
    try{
        const articleContent = new Readability(document).parse();

        if (!articleContent) return fallbackExtraction(document);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = articleContent.content;
        // Extract paragraphs from cleaned content
        const paragraphs = Array.from(tempDiv.querySelectorAll("p, li, blockquote, td, th, figcaption, pre"))
        .map(el => el.textContent?.trim() ?? '')
        .filter(text => text.length > 10);
        
        const paragraphSentences: string[][] = [];
        const fullTextParts: string[] = [];
        
        paragraphs.forEach(paragraphText => {
            const doc = nlp(paragraphText);
            const sentences = doc.sentences().out('array') as string[];
            
            if (sentences.length > 0) {
                const trimmedSentences = sentences
                .map(s => s.trim())
                .filter(s => s.length > 3);
                
                if (trimmedSentences.length > 0) {
                paragraphSentences.push(trimmedSentences);
                fullTextParts.push(trimmedSentences.join(' '));
                }
            }
        });

        return {
            paragraphSentences,
            fullText: fullTextParts.join(" "),
        };
    } catch (error : any){
        console.warn('Readability extraction failed, falling back: ', error); 
        return fallbackExtraction(document)
    }
};

// Simpler extraction logic
function fallbackExtraction(document: Document): {
    paragraphSentences: string[][];
    fullText: string;
} {
    const contentBlocks = Array.from(document.querySelectorAll("p, li, blockquote, td, th, figcaption, pre"));
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
    
    return {
        paragraphSentences,
        fullText: fullTextParts.join(' ')
    };
}

// List of HTML selectors which do not provide desirable content
const unwantedSelectors = [
    'script', 'style', 'noscript', 'iframe',
    'nav', 'header', 'footer', 'aside',
    '.sidebar', '.navigation', '.menu',
    '.ads', '.advertisement', '.social-share',
    '.comments', '.related-posts',
    '[class*="ad-"]', '[id*="ad-"]',
    '.popup', '.modal', '.overlay',
    '.breadcrumb', '.pagination'
];