/**
 * simulation-result.template.ts
 *
 * Master Template para emails de resultado de simulacao.
 *
 * Composicao:
 *   renderEmailHeader()             — partial: cabecalho ESB
 *   renderDataSection(entrada)      — partial: dados de entrada
 *   renderDataSection(resultado)    — partial: resultados
 *   renderEmailFooter(relatedPosts) — partial: rodape + posts relacionados
 *
 * Posts relacionados sao injetados pelo EmailService via ContentService,
 * sem URLs hardcoded do WordPress.
 *
 * Referencia de design: emails legados do ESB-Bolsito-Microservices
 * (enviar_email_resultado_* em utils.py de cada app).
 */

import { SimulationEmailPayload } from '../dto/simulation-email-payload.dto';
import { renderEmailHeader } from './partials/email-header.partial';
import { renderEmailFooter, RelatedPost } from './partials/email-footer.partial';
import { renderDataSection } from './partials/simulation-data-section.partial';

/**
 * Gera o HTML completo do email de resultado de simulacao.
 *
 * @param payload      - Dados da simulacao (tipo, usuario, input, output, resumo)
 * @param relatedPosts - Posts do blog a exibir no rodape (injetados pelo ContentService)
 * @returns string com o HTML do email
 */
export function generateSimulationEmail(
  payload: SimulationEmailPayload,
  relatedPosts: RelatedPost[] = [],
): string {
  const { userName, simulationType, input, output, summary, createdAt } =
    payload;

  const dateStr = new Date(createdAt).toLocaleDateString('pt-BR');
  const safeName = userName?.trim() || 'Usuario';
  const safeSummary = summary?.trim() || '';

  const summarySection = safeSummary
    ? `
    <div style="background:#eff6ff;border-left:4px solid #1B3A6B;padding:16px;margin-bottom:24px;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:14px;color:#1e3a5f;font-family:sans-serif;">${safeSummary}</p>
    </div>
  `
    : '';

  const header = renderEmailHeader(simulationType);
  const footer = renderEmailFooter(relatedPosts);
  const inputSection = renderDataSection('Dados de Entrada', input);
  const outputSection = renderDataSection('Resultados', output);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Resultado da Simulacao — Educando Seu Bolso</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"
        >
          <!-- CABECALHO -->
          <tr>
            <td>${header}</td>
          </tr>

          <!-- CORPO -->
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="font-size:15px;color:#374151;font-family:sans-serif;margin:0 0 8px;">
                Ola, <strong>${safeName}</strong>!
              </p>
              <p style="font-size:13px;color:#6b7280;font-family:sans-serif;margin:0 0 20px;">
                Aqui esta o resultado da sua simulacao realizada em ${dateStr}.
              </p>

              ${summarySection}
              ${inputSection}
              ${outputSection}
            </td>
          </tr>

          <!-- RODAPE -->
          <tr>
            <td style="padding:0 28px 28px;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
