/**
 * Partial: Cabecalho padrao dos emails do ESB.
 * Usado pelo Master Template.
 */
export function renderEmailHeader(simulationType: string): string {
  return `
    <div style="background:#1B3A6B;padding:28px 24px;text-align:center;border-radius:8px 8px 0 0;">
      <img
        src="https://educandoseubolso.com.br/wp-content/themes/educandoseubolso/img/logo-esb-branco.png"
        alt="Educando Seu Bolso"
        width="160"
        style="display:block;margin:0 auto 12px;"
      />
      <h1 style="color:#ffffff;font-size:20px;margin:0;font-family:sans-serif;">
        Resultado da Simulacao
      </h1>
      <p style="color:#a8c6f0;font-size:14px;margin:6px 0 0;font-family:sans-serif;">
        ${simulationType.replace(/_/g, ' ')}
      </p>
    </div>
  `.trim();
}
