/**
 * email.module.ts
 *
 * Modulo de email do ESB 2.0.
 *
 * Importa ContentModule para injecao de posts relacionados no rodape
 * dos emails de simulacao (sem URLs hardcoded do WordPress).
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { ResendProvider } from './providers/resend.provider';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [ConfigModule, ContentModule],
  providers: [
    EmailService,
    {
      provide: EMAIL_PROVIDER,
      useClass: ResendProvider,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
