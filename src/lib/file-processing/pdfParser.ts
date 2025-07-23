import pdfjsLib from 'pdfjs-dist';
import { extractStructurePDF } from '../text-analysis/extractStructure';

const parsePDF = async (file: File) => {
    const rawData = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: rawData }).promise;

    const structureData = await extractStructurePDF(pdf)

    return structureData;
};

module.exports = { parsePDF };
