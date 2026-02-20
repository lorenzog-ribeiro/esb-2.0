/**
 * Partial: Secao de dados (entrada ou saida) de uma simulacao.
 * Renderiza um mapa de chave/valor com formatacao consistente.
 */

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function renderDataSection(
  title: string,
  data: Record<string, unknown>,
): string {
  if (!data || Object.keys(data).length === 0) return '';

  const rows = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([key, value]) => {
      const label = escapeHtml(humanizeKey(key));
      const displayValue =
        typeof value === 'object'
          ? escapeHtml(JSON.stringify(value))
          : escapeHtml(value);
      return `
        <tr>
          <td style="padding:8px 12px;color:#6b7280;font-size:13px;font-family:sans-serif;white-space:nowrap;vertical-align:top;">
            ${label}
          </td>
          <td style="padding:8px 12px;color:#111827;font-size:13px;font-family:sans-serif;vertical-align:top;">
            ${displayValue}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="margin-bottom:24px;">
      <h3 style="font-size:14px;color:#1B3A6B;font-family:sans-serif;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">
        ${escapeHtml(title)}
      </h3>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:6px;overflow:hidden;">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `.trim();
}
