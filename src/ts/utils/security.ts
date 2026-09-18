export function escapeHTML(str: string | null | undefined): string {
    if (!str) return '';
    const entityMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    };
    return str.replace(/[&<>'"]/g, tag => entityMap[tag] ?? tag);
}

export function sanitizeGithubUrl(urlStr: string | null | undefined, fallback: string): string {
    if (!urlStr) return fallback;
    try {
        const parsed = new URL(urlStr);
        if (parsed.protocol === 'https:' && parsed.hostname === 'github.com') {
            return encodeURI(parsed.href);
        }
    } catch {
        // Fallback on invalid URL
    }
    return fallback;
}
