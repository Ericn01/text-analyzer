import mammoth from 'mammoth';

const convertToHTML = async () => {
    mammoth.convertToHtml({path: "file_path.docx"})
    .then(result => {
        const html = result.value; // The generated HTML
        const messages = result.messages; // Any warnings or errors
        console.log(html);
    })
    .catch(error => {
        console.error(error);
    });
}
