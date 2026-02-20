/**
 * real-estate-ranking.controller.ts
 *
 * Controller REST para o Ranking de Imoveis.
 * Endpoint: GET /rankings/real-estate
 */

import { Controller, Get, Query } from '@nestjs/common';
import { RealEstateRankingService } from './real-estate-ranking.service';
import { RealEstateRankingRequestDto } from './dto/ranking-request.dto';
import { RealEstateRankingResponseDto } from './dto/ranking-response.dto';

@Controller('rankings/real-estate')
export class RealEstateRankingController {
  constructor(private readonly service: RealEstateRankingService) {}

  /**
   * GET /rankings/real-estate
   *
   * Retorna o ranking de financiamento imobiliario ordenado por menor
   * prestacao inicial. Filtragens opcionais via query params.
   *
   * @param query - Filtros opcionais: modalidade, limite
   * @returns Lista ranqueada de opcoes de financiamento imobiliario
   */
  @Get()
  getRanking(
    @Query() query: RealEstateRankingRequestDto,
  ): RealEstateRankingResponseDto {
    return this.service.getRanking(query);
  }
}
