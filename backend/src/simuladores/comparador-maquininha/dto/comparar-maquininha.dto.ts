import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
} from 'class-validator';

/**
 * DTO para comparação lado a lado de maquininhas
 * Versão simplificada focada em comparação direta
 * Mínimo 2, máximo 3 maquininhas
 */
export class CompararMaquininhaDto {
  @ApiProperty({
    description: 'IDs das maquininhas a comparar (mínimo 2, máximo 3)',
    example: [1, 2, 3],
    type: [Number],
    minItems: 2,
    maxItems: 3,
  })
  @IsArray()
  @ArrayMinSize(2, {
    message: 'É necessário selecionar pelo menos 2 maquininhas para comparar',
  })
  @ArrayMaxSize(3, {
    message: 'Máximo de 3 maquininhas para comparar',
  })
  @IsInt({ each: true })
  @Type(() => Number)
  maquininhas_ids: number[];

  @ApiProperty({
    description: 'Nome do solicitante',
    example: 'João Silva',
  })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Email do solicitante',
    example: 'joao@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Opt-in to receive simulation results via email',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  email_opt_in_simulation: boolean;

  @ApiProperty({
    description: 'Opt-in to receive marketing content',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  email_opt_in_content?: boolean;

  @ApiProperty({
    description: 'Indica se o usuário permite compartilhar seus dados',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  compartilharDados?: boolean;

  @ApiProperty({
    description: 'Origem da simulação (para rastreamento)',
    example: 'web',
    required: false,
  })
  @IsOptional()
  @IsString()
  origem?: string;
}
