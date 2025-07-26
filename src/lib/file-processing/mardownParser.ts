import MarkdownIt from "markdown-it";

export const parseMarkdownAsHTML = (markdown: string) => {
    const md = MarkdownIt();
    const htmlContent = md.render(markdown);
    return htmlContent;
};
