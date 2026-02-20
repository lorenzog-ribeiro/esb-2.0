import { Module } from '@nestjs/common';
import { ComparadorMaquininhaController } from './comparador-maquininha.controller';
import { ComparadorMaquininhaService } from './comparador-maquininha.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../email/email.module';
import { MaquininhasDataModule } from '../maquininhas-data/maquininhas-data.module';

@Module({
  imports: [PrismaModule, EmailModule, MaquininhasDataModule],
  controllers: [ComparadorMaquininhaController],
  providers: [ComparadorMaquininhaService],
  exports: [ComparadorMaquininhaService],
})
export class ComparadorMaquininhaModule {}
