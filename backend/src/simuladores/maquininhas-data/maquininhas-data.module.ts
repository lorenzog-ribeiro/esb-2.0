import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { MaquininhasDatabaseService } from './maquininhas-database.service';

/**
 * Módulo compartilhado de dados de maquininhas.
 * Usa exclusivamente DATABASE_URL via Prisma.
 * Importado por taxa-maquininha e comparador-maquininha.
 */
@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [MaquininhasDatabaseService],
  exports: [MaquininhasDatabaseService],
})
export class MaquininhasDataModule {}
