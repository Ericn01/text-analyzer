import { JSDOM } from 'jsdom';



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
    const structure = extractStructure(document);

    // Extract the text content from the DOM
    const textContent = extractCleanText(document)

} 


/**
 * Extracts structural elements from the HTML document
 */
const extractStructure = (document: Document) => {
    return {
        headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        lists: document.querySelectorAll('ul, ol, dl').length,
        bold_instances: document.querySelectorAll('b, strong').length,
        italic_instances: document.querySelectorAll('i, em').length,
        links: document.querySelectorAll('a[href]').length,
        images: document.querySelectorAll('img').length,
        tables: document.querySelectorAll('table').length,
    }
}

const extractCleanText = (document: Document) => {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, noscript');
    scripts.forEach(el => el.remove());

    // Get text content from body, or entire document if no body
    const textContent = document.body?.textContent || document.textContent || '';

    // Clean up whitespace and normalize
    return textContent
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
}