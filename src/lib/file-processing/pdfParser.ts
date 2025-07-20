import fs from 'fs'
import path from 'path'
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const parsePDF = async (filePath : string) => {
    const rawData = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data: rawData }).promise;

    const structureData = {
        headings: 0,
        lists: 0,
        bold_instances: 0,
        italic_instances: 0,
        links: 0,
        images: 0,
        tables: 0,
        footnotes: 0,
        rawText: ''
    };

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(' ');
            structureData.rawText += pageText + '\n';

            // Structural heuristics (can improve with better logic)
            content.items.forEach(item => {
            const str = item.str.trim();
            const fontName = item.fontName || '';
            const transform = item.transform;

            if (/^#+\s/.test(str) || str.length > 20 && str === str.toUpperCase()) structureData.headings++;
            if (/^\•|[-*+]\s/.test(str)) structureData.lists++;
            if (fontName.toLowerCase().includes('bold')) structureData.bold_instances++;
            if (fontName.toLowerCase().includes('italic')) structureData.italic_instances++;
        });

        const annotations = await page.getAnnotations();
        annotations.forEach(ann => {
        if (ann.url) structureData.links++;
        });

        if (page.commonObjs._objs) {
        const imagesOnPage = Object.values(page.commonObjs._objs).filter(obj => obj && obj.data && obj.data.kind === 'image');
        structureData.images += imagesOnPage.length;
        }
    }

    // TODO: Add heuristics for tables and footnotes
    return structureData;
};

module.exports = { parsePDF };
