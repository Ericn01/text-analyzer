import mammoth from 'mammoth';

// Not a 100% conversion: images have custom extraction, and tables have simple support. 
const convertDocxToHTML = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({buffer}, {
        convertImage: mammoth.images.imgElement(element => 
            element.read("base64").then(imageBuffer => ({
                src: `data:${element.contentType};base64,${imageBuffer}`
            }))
        )
    });
    return result;
}

export default convertDocxToHTML;
