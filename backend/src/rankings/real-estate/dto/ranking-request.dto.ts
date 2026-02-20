/**
 * DTO de request para o Ranking de Imoveis.
 * Filtros opcionais para refinar a exibicao do ranking.
 */

import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RealEstateRankingRequestDto {
  @IsOptional()
  @IsString()
  modalidade?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limite?: number;
}
