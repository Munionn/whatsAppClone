export function parseHtmlError(html: string): string {
    const match = html.match(/<pre.*?>(.*?)<\/pre>/is);
    if (match && match[1]) {
        // Replace <br> tags with newlines and strip HTML
        return match[1].replace(/<br\s*\/?>/gi, '\n').trim();
    }
    return 'An unknown error occurred';
}