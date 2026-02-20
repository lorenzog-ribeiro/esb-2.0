/**
 * Partial: Rodape padrao dos emails do ESB.
 *
 * Posts relacionados sao injetados dinamicamente via ContentService,
 * eliminando URLs hardcoded do WordPress.
 *
 * @param relatedPosts - Lista de posts a exibir no rodape (max 3 recomendado)
 */

export interface RelatedPost {
  title: string;
  url: string;
  excerpt?: string;
}

export function renderEmailFooter(relatedPosts: RelatedPost[] = []): string {
  const postsHtml =
    relatedPosts.length > 0
      ? `
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
      <h3 style="font-size:15px;color:#374151;font-family:sans-serif;margin:0 0 16px;">
        Posts Relacionados
      </h3>
      <ul style="list-style:none;padding:0;margin:0;">
        ${relatedPosts
          .map(
            (post) => `
          <li style="margin-bottom:12px;">
            <a
              href="${post.url}"
              style="color:#1B3A6B;font-family:sans-serif;font-size:14px;text-decoration:none;font-weight:600;"
            >
              ${post.title}
            </a>
            ${
              post.excerpt
                ? `<p style="color:#6b7280;font-size:13px;margin:4px 0 0;font-family:sans-serif;">${post.excerpt}</p>`
                : ''
            }
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>
  `
      : '';

  return `
    ${postsHtml}
    <div style="text-align:center;padding:24px 0 8px;border-top:1px solid #e5e7eb;margin-top:32px;">
      <p style="font-size:12px;color:#9ca3af;font-family:sans-serif;margin:0 0 4px;">
        Educando Seu Bolso — Educacao Financeira para todos
      </p>
      <p style="font-size:12px;color:#9ca3af;font-family:sans-serif;margin:0;">
        Este e um email automatico. Por favor, nao responda.
      </p>
    </div>
  `.trim();
}
