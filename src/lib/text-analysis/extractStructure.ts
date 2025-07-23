import { StructureMetrics } from "../../../types/basicAnalytics"

/**
 * Extracts structural elements from the HTML document
 */
export const extractStructureHTML = (document: Document) : StructureMetrics => {
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

export const extractStructurePDF = async (pdf: any) => {
    const structureData = {
        headings: 0,
        lists: 0,
        bold_instances: 0,
        italic_instances: 0,
        links: 0,
        images: 0,
        tables: 0, // Not supported -> Hard to extract from PDFs
    };

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        content.items.forEach((item: any) => {
            const str = item.str?.trim() ?? '';
            if (!str) return;

            // Font size estimation using transform matrix
            const transform = item.transform;
            const fontSize = transform ? Math.hypot(transform[0], transform[1]) : 0;

            const fontName = item.fontName?.toLowerCase() ?? '';

            // Headings: Large font size or all caps
            if (fontSize > 16 || (str.length > 15 && str === str.toUpperCase())) {
                structureData.headings++;
            }

            // Lists: Bullet, dash, or asterisk with content
            if (/^[\u2022\-*+]\s/.test(str) && str.length > 5) {
                structureData.lists++;
            }

            // Bold: font name or possible larger font size than average
            if (fontName.includes('bold')) {
                structureData.bold_instances++;
            }

            // Italic: font name check (very approximate)
            if (fontName.includes('italic') || fontName.includes('oblique')) {
                structureData.italic_instances++;
            }
        });

        // Extract links via annotations
        const annotations = await page.getAnnotations();
        annotations.forEach((ann: any) => {
            if (ann.url) structureData.links++;
        });

        // Extract image occurrences from operator list
        const ops = await page.getOperatorList();
        const imageOps = ops.fnArray.filter((fn: number) =>
            [pdfjsLib.OPS.paintImageXObject, pdfjsLib.OPS.paintJpegXObject].includes(fn)
        );
        structureData.images += imageOps.length;
    }

    return structureData;
};
