import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EconomicRatesModule } from './shared/economic-rates/economic-rates.module';
import { PrismaModule } from './prisma/prisma.module';
import { SimuladoresModule } from './simuladores/simuladores.module';
import { RankingsModule } from './rankings/rankings.module';
import { BlogModule } from './blog/blog.module';
import { EmailModule } from './email/email.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EconomicRatesModule,
    PrismaModule,
    SimuladoresModule,
    RankingsModule,
    BlogModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
