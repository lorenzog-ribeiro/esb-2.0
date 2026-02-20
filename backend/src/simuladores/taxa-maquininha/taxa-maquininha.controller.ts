import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TaxaMaquininhaService } from './taxa-maquininha.service';
import { SimularTaxaMaquininhaDto } from './dto/simular-taxa-maquininha.dto';
import { ResultadoTaxaMaquininhaDto } from './dto/resultado-taxa-maquininha.dto';
import { SEGMENTOS } from './data/segmentos.data';

@ApiTags('Taxa Maquininha')
@Controller('simuladores/taxa-maquininha')
export class TaxaMaquininhaController {
  private readonly logger = new Logger(TaxaMaquininhaController.name);

  constructor(private readonly taxaMaquininhaService: TaxaMaquininhaService) {}

  @Get('segmentos')
  @ApiOperation({
    summary: 'Listar segmentos/setores de atuação',
    description: 'Retorna a lista de segmentos disponíveis para seleção no simulador',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de segmentos',
    schema: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'number' }, nome: { type: 'string' } } },
    },
  })
  listarSegmentos(): { id: number; nome: string }[] {
    return SEGMENTOS;
  }

  @Post('simular')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Simular taxas de maquininhas de cartão',
    description: `
      Calcula e compara os custos mensais de diversas maquininhas de cartão com base no perfil de vendas informado.

      **Migrado do Django (gerentesonhos/apps/maquininhas)**

      ## Como Funciona

      O simulador calcula o **custo total mensal** para cada maquininha considerando:

      ### 1. Taxas sobre Transações (MDR)
      - **Débito**: Taxa percentual sobre vendas no débito
      - **Crédito à vista**: Taxa percentual sobre vendas no crédito à vista
      - **Crédito parcelado**: Taxa que varia conforme número de parcelas

      ### 2. Modelos de Cobrança

      Existem 4 modelos principais:

      **a) Antecipação por Juros Simples**
      - Taxa cresce linearmente: base + (taxa_adicional × parcelas)
      - Exemplo: 3% base + 0,5% por parcela = 6% em 6x

      **b) Antecipação por Juros Compostos**
      - Taxa cresce exponencialmente: (1 + taxa)^n
      - Usado quando a empresa antecipa automaticamente

      **c) Faixa de Faturamento** (3 tipos)
      - **Tipo 1 - Preço Fixo**: Faturou R$ 5k-15k = paga R$ 50/mês fixo
      - **Tipo 2 - Taxa por Faixa**: Faturou R$ 5k-15k = taxa de 2,5%
      - **Tipo 3 - Taxa Adicional**: Faturou R$ 5k-15k = 2% base + 0,3%/parcela

      **d) Taxa Padrão**
      - Taxa fixa por tipo de transação
      - Pode ter taxa adicional por parcela ou taxas específicas por número de parcelas

      ### 3. Custos da Máquina
      - **Compra**: Amortizado pela garantia (geralmente 1-3 anos)
      - **Aluguel/Mensalidade**: Pode ser condicional (isento acima de certo faturamento)

      ### 4. Filtros Disponíveis
      - **sem_mensalidade**: Apenas maquininhas sem taxa mensal
      - **wifi**: Com conexão Wi-Fi
      - **pf/pj**: Tipo de pessoa atendida
      - **aceita_cartao_tarja**: Aceita tarja magnética
      - **imprime_recibo**: Tem impressora
      - **aceita_vale_refeicao**: Aceita cartões de alimentação
      - **n_exige_smartphone**: Funciona sem celular
      - **quer_antecipar**: Permite antecipação de recebíveis
      - **ecommerce**: Possui opção para vendas online

      ## Cálculo do Custo Mensal

      \`\`\`
      CUSTO TOTAL MENSAL =
        (débito_vendas × taxa_débito) +
        (crédito_vista_vendas × taxa_crédito_vista) +
        (crédito_parcelado_vendas × taxa_parcelado_calculada) +
        (preço_máquina / (garantia_anos × 12)) +
        mensalidade_ou_taxa_condicional
      \`\`\`

      ## Ordenação dos Resultados

      Os resultados são ordenados por **menor custo mensal**, permitindo identificar rapidamente a opção mais econômica para o perfil de vendas informado.

      ## Dias de Repasse

      Cada maquininha tem prazos diferentes para repasse do dinheiro:
      - **Débito**: Geralmente 1 dia útil
      - **Crédito à vista**: 14 a 30 dias
      - **Crédito parcelado**: 30+ dias ou após cada parcela

      ## Precisão dos Cálculos

      Utiliza **Decimal.js com 19 dígitos de precisão** para garantir exatidão nos cálculos financeiros, idêntico ao Python Decimal usado no sistema legado.

      ## Premissas

      - Taxas baseadas em dados reais das empresas
      - Considera apenas maquininhas ativas
      - Planos devem estar ativos e compatíveis com o número de parcelas
      - Segmentos específicos (se informado) filtram planos disponíveis
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Simulação calculada com sucesso',
    type: ResultadoTaxaMaquininhaDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
          example: [
            'venda_debito must not be less than 0',
            'numero_parcelas must not be less than 2',
            'numero_parcelas must not be greater than 12',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async simular(
    @Body() dto: SimularTaxaMaquininhaDto,
  ): Promise<ResultadoTaxaMaquininhaDto> {
    try {
      this.logger.log(
        `Received card machine fee simulation request from ${dto.email}`,
      );
      this.logger.debug(`Input: ${JSON.stringify(dto)}`);

      const result = await this.taxaMaquininhaService.simular(dto);

      this.logger.log(
        `Card machine simulation completed successfully. Total machines: ${result.total}, Best option: ${result.melhor_opcao.nome} (R$ ${result.melhor_opcao.valor_mensal.toFixed(2)}/mês)`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        'Error calculating card machine fee simulation',
        error.stack,
      );
      throw error;
    }
  }
}
