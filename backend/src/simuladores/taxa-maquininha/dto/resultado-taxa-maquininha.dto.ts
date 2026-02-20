import { ApiProperty } from '@nestjs/swagger';
import {
  TipoConexao,
  Bandeira,
  FormaRecebimento,
} from '../interfaces/maquininha.interface';

/**
 * DTO para o resultado de uma maquininha calculada
 */
export class MaquininhaCalculadaDto {
  @ApiProperty({
    description: 'Nome completo (maquininha + plano)',
    example: 'Moderninha Pro PagSeguro - Plano Básico',
  })
  nome: string;

  @ApiProperty({
    description: 'ID da maquininha',
    example: 1,
  })
  id_maq: number;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'PagSeguro',
  })
  empresa: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '08.561.701/0001-01',
  })
  empresa_cnpj: string;

  @ApiProperty({
    description: 'URL do logo da empresa',
    example: 'https://example.com/media/logos/pagseguro.png',
  })
  logo: string;

  @ApiProperty({
    description: 'URL da imagem da maquininha',
    example: 'https://example.com/media/maquininhas/moderninha-pro.png',
  })
  imagem_maquina: string;

  @ApiProperty({
    description: 'Custo mensal total (principal métrica de comparação)',
    example: 125.5,
  })
  valor_mensal: number;

  @ApiProperty({
    description: 'Valor da mensalidade (se houver)',
    example: 0,
  })
  valor_mensalidade: number;

  @ApiProperty({
    description: 'Valor por transação (se houver)',
    example: 0,
  })
  valor_transacao: number;

  @ApiProperty({
    description: 'Percentual de desconto (selo promocional)',
    example: 20,
  })
  valor_selo: number | string;

  @ApiProperty({
    description: 'Dias para repasse do débito',
    example: 1,
  })
  dias_debito: number;

  @ApiProperty({
    description: 'Dias para repasse do crédito à vista',
    example: 30,
  })
  dias_credito: number;

  @ApiProperty({
    description: 'Tipo de dias (úteis ou corridos)',
    example: 'Dias Corridos',
  })
  tipo_dias_credito: string;

  @ApiProperty({
    description: 'Dias para repasse do crédito parcelado',
    example: 30,
  })
  dias_credito_parcelado: number;

  @ApiProperty({
    description: 'Recebe após cada parcela ou tudo de uma vez',
    example: false,
  })
  tipo_recebimento_parcelado: boolean;

  @ApiProperty({
    description: 'ID do plano',
    example: 15,
  })
  co_cartao: number;

  @ApiProperty({
    description: 'URL para contratação',
    example: 'https://pagseguro.uol.com.br',
  })
  site: string;

  @ApiProperty({
    description: 'Observações sobre a maquininha',
    example: 'Aceita todas as bandeiras',
  })
  observacao: string;

  @ApiProperty({
    description: 'Código do cupom de desconto (se houver)',
    example: 'PROMO20',
    nullable: true,
  })
  cupom: string | null;

  @ApiProperty({
    description: 'Máximo de parcelas aceitas',
    example: 12,
  })
  possibilidade_parcelamento: number;

  @ApiProperty({
    description: 'Requer afiliação a banco',
    example: false,
  })
  afiliacao_a_banco: boolean;

  @ApiProperty({
    description: 'Aceita chip',
    example: true,
  })
  chip: boolean;

  @ApiProperty({
    description: 'Aceita tarja magnética',
    example: true,
  })
  tarja: boolean;

  @ApiProperty({
    description: 'Aceita NFC (aproximação)',
    example: true,
  })
  NFC: boolean;

  @ApiProperty({
    description: 'Possui conexão Wi-Fi',
    example: true,
  })
  wifi: boolean;

  @ApiProperty({
    description: 'Atende Pessoa Física',
    example: true,
  })
  PF: boolean;

  @ApiProperty({
    description: 'Atende Pessoa Jurídica',
    example: true,
  })
  PJ: boolean;

  @ApiProperty({
    description: 'Precisa de telefone/smartphone',
    example: false,
  })
  precisa_de_telefone: boolean;

  @ApiProperty({
    description: 'Possui fio',
    example: false,
  })
  fio: boolean;

  @ApiProperty({
    description: 'Imprime recibo',
    example: true,
  })
  imprime_recibo: boolean;

  @ApiProperty({
    description: 'Garantia em anos',
    example: 1,
    nullable: true,
  })
  garantia: number | null;

  @ApiProperty({
    description: 'Permite antecipação de recebíveis',
    example: true,
  })
  possivel_antecipacao: boolean;

  @ApiProperty({
    description: 'Este plano é antecipado',
    example: false,
  })
  antecipado: boolean;

  @ApiProperty({
    description: 'Possui opção de e-commerce',
    example: false,
  })
  opcao_ecommerce: boolean;

  @ApiProperty({
    description: 'Taxas transparentes',
    example: true,
  })
  taxas_transparentes: boolean;

  @ApiProperty({
    description: 'Aceita vale refeição',
    example: false,
  })
  vale_refeicao: boolean;

  @ApiProperty({
    description: 'Tipos de conexão disponíveis',
    example: [{ nome: 'Wi-Fi' }, { nome: '4G' }],
  })
  tipo_conexoes: TipoConexao[];

  @ApiProperty({
    description: 'Formas de recebimento',
    example: [{ nome: 'PIX' }, { nome: 'TED' }],
  })
  forma_recebimento: FormaRecebimento[];

  @ApiProperty({
    description: 'Bandeiras aceitas',
    example: [
      { nome: 'Visa', classeCss: 'visa' },
      { nome: 'Mastercard', classeCss: 'mastercard' },
    ],
  })
  bandeiras: Bandeira[];

  @ApiProperty({
    description: 'Avaliação do plano (0-10)',
    example: 8.5,
  })
  avaliacao: number;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '15/11/2024',
  })
  data_atualizacao: string;

  @ApiProperty({
    description: 'URL da avaliação/review',
    example: 'https://blog.gerentedesonhos.com.br/review-moderninha',
    nullable: true,
  })
  url_avaliacao: string | null;

  @ApiProperty({
    description: 'Cruzamentos/ofertas relacionadas',
    example: [],
  })
  cruzamentos: any[];

  @ApiProperty({
    description: 'Empresa é parceira',
    example: true,
  })
  tem_parceria: boolean;
}

/**
 * DTO para o resultado completo da simulação
 */
export class ResultadoTaxaMaquininhaDto {
  @ApiProperty({
    description:
      'Lista de maquininhas calculadas, ordenadas por custo mensal (menor primeiro)',
    type: [MaquininhaCalculadaDto],
  })
  maquininhas: MaquininhaCalculadaDto[];

  @ApiProperty({
    description: 'Total de maquininhas encontradas',
    example: 15,
  })
  total: number;

  @ApiProperty({
    description: 'Melhor opção (menor custo mensal)',
    type: MaquininhaCalculadaDto,
  })
  melhor_opcao: MaquininhaCalculadaDto;

  @ApiProperty({
    description: 'Dados de entrada da simulação',
    example: {
      venda_debito: 5000,
      venda_credito_vista: 3000,
      venda_credito_parcelado: 2000,
      numero_parcelas: 6,
    },
  })
  input_data: {
    venda_debito: number;
    venda_credito_vista: number;
    venda_credito_parcelado: number;
    numero_parcelas: number;
    segmento?: number;
  };
}
