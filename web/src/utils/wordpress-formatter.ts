export function formatWordPressContent(htmlContent: string): string {
    if (!htmlContent) return '';

    return htmlContent
        // Remove WordPress shortcodes like [caption], [gallery], etc.
        .replace(/\[([^\]]+)\]/g, '')

        // Remove inline styles that might break your design
        .replace(/style="[^"]*"/g, '')

        // Remove WordPress-specific classes that might conflict
        .replace(/class="wp-[^"]*"/g, '')

        // Clean up extra whitespace and line breaks
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
}

export function stripHtmlTags(htmlContent: string): string {
    if (!htmlContent) return '';

    return htmlContent
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular space
        .replace(/&amp;/g, '&')  // Replace &amp; with &
        .replace(/&lt;/g, '<')   // Replace &lt; with <
        .replace(/&gt;/g, '>')   // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .replace(/&#039;/g, "'") // Replace &#039; with '
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .trim();
}

export function createExcerpt(content: string, maxLength: number = 150): string {
    const plainText = stripHtmlTags(content);

    if (plainText.length <= maxLength) {
        return plainText;
    }

    // Find the last complete word before the max length
    const truncated = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    return lastSpaceIndex > 0
        ? truncated.substring(0, lastSpaceIndex) + '...'
        : truncated + '...';
}

export function formatWordPressExcerpt(excerpt: string): string {
    if (!excerpt) return '';

    return excerpt
        // Remove WordPress's default [...] or [&hellip;]
        .replace(/\[&hellip;\]/g, '')
        .replace(/\[\.\.\.\]/g, '')
        // Remove common WordPress excerpt artifacts
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '')
        .replace(/&hellip;/g, '...')
        // Clean up and format
        .replace(/\s+/g, ' ')
        .trim();
}

/** Limpa HTML de excerpt para exibição (preserva tags, remove artefatos WP) */
export function formatExcerptHtml(html: string): string {
    if (!html) return '';

    return html
        .replace(/\[&hellip;\]/g, '')
        .replace(/\[\.\.\.\]/g, '')
        .replace(/&hellip;/g, '...')
        .replace(/\sstyle="[^"]*"/g, '')
        .trim();
}

export function calculateReadingTime(content: string, wordsPerMinute: number = 200): string {
    const plainText = stripHtmlTags(content);
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    return `${minutes} min leitura`;
}

export function formatPostDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });
}

/** Formato DD/MM/YYYY consistente entre server e client (evita hydration mismatch) */
export function formatPostDateShort(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

export function formatFullPostContent(content: string): string {
    if (!content) return '';

    return content
        // Remove comentários de blocos Gutenberg
        .replace(/<!--\s*\/?wp:[^>]+-->/g, '')
        // Remove shortcodes [caption], [gallery], etc.
        .replace(/\[([^\]]+)\]/g, '')
        // Remove estilos inline que podem conflitar
        .replace(/\sstyle="[^"]*"/g, '')
        // Remove classes WordPress que conflitam (mantém HTML semântico)
        .replace(/\sclass="wp-block-[^"]*"/g, '')
        .replace(/\sclass="has-[^"]*"/g, '')
        // Normalizar espaçamento entre blocos
        .replace(/<\/p>\s*<p/g, '</p>\n\n<p')
        .replace(/<\/h[1-6]>\s*<p/g, (m) => m.replace(/\s+/, '\n\n'))
        .replace(/<\/blockquote>\s*<p/g, '</blockquote>\n\n<p')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
}
