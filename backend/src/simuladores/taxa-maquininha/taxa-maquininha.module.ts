import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaxaMaquininhaController } from './taxa-maquininha.controller';
import { TaxaMaquininhaService } from './taxa-maquininha.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../email/email.module';
import { MaquininhasDataModule } from '../maquininhas-data/maquininhas-data.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    ConfigModule,
    MaquininhasDataModule,
  ],
  controllers: [TaxaMaquininhaController],
  providers: [TaxaMaquininhaService],
  exports: [TaxaMaquininhaService],
})
export class TaxaMaquininhaModule {}
