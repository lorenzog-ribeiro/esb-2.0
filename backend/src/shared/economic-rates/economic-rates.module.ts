import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EconomicRatesService } from './economic-rates.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [EconomicRatesService],
  exports: [EconomicRatesService],
})
export class EconomicRatesModule {}
