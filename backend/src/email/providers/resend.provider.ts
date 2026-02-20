import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailProvider } from '../interfaces/email-provider.interface';

@Injectable()
export class ResendProvider implements EmailProvider {
  private readonly logger = new Logger(ResendProvider.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not defined. Email sending will fail.');
    }
    this.resend = new Resend(apiKey || 're_missing_key');
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const maskedTo = to.replace(/(.{1,2})(.*)(@.*)/, '$1***$3');
    
    if (!this.configService.get<string>('RESEND_API_KEY')) {
        this.logger.error('Cannot send email: RESEND_API_KEY is missing');
        return;
    }

    try {
      // Use a default sender that works with Resend's free tier or verified domain
      // If environment variable is set, use it, otherwise default to 'onboarding@resend.dev' for safety/dev
      // But for production requirement, it should be a verified domain.
      // I'll assume 'simuladores@educandoseubolso.com' is the goal, but user needs to verify it.
      // For now, let's use the one from requirements or a sensible default.
      const from = this.configService.get<string>('EMAIL_FROM') || 'Educando Seu Bolso <nao-responda@educandoseubolso.com>';
      
      const data = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (data.error) {
        const msg = data.error.message || '';
        if (msg.includes('domain is not verified') || msg.includes('dominio')) {
          this.logger.warn(
            `Email não enviado (domínio não verificado no Resend): ${maskedTo}. ` +
            `Verifique em https://resend.com/domains`,
          );
          return;
        }
        this.logger.error(`Failed to send email to ${maskedTo}: ${msg}`);
        throw new Error(data.error.message);
      }

      this.logger.log(`Email sent successfully to ${maskedTo}, id: ${data.data?.id}`);
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('domain is not verified') || msg.includes('dominio') || msg.includes('not verified')) {
        this.logger.warn(
          `Email não enviado (domínio não verificado): ${maskedTo}. ` +
          `Configure RESEND_API_KEY e verifique o domínio em https://resend.com/domains`,
        );
        return;
      }
      this.logger.error(`Error sending email to ${maskedTo}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
