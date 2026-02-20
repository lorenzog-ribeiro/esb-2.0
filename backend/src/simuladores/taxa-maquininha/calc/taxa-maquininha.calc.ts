import Decimal from 'decimal.js';
import {
  Maquininha,
  Plano,
  ResultadoMaquininha,
  FiltrosMaquininha,
} from '../interfaces/maquininha.interface';
import { ModeloCobranca, TipoFaixa } from '../enums/modelo-cobranca.enum';

/**
 * Configurar precisão decimal para cálculos financeiros
 * Migrated from: decimal.getcontext().prec = 19
 */
Decimal.set({ precision: 19, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calcula antecipação utilizando juros simples
 * Migrated from: calculos.py::calcular_antecipacao
 *
 * @param val_credito_p - Valor a ser parcelado
 * @param num_parcelas - Número de parcelas
 * @param plano - Plano com as taxas
 * @returns Valor da taxa em centavos (multiplicado por 100)
 */
export function calcularAntecipacao(
  val_credito_p: number,
  num_parcelas: number,
  plano: Plano,
): number {
  try {
    // Taxas já vêm em decimal (0.0399 para 3,99%) do MaquininhasDatabaseService
    const taxa_desc_credito = new Decimal(plano.taxa_desconto_credito_vista);
    const taxa_adicional_parc = new Decimal(plano.taxa_adicional_parcela);

    // taxa_atual = taxa_desc_credito + (taxa_adicional_parc * (num_parcelas - 1))
    const taxa_atual = taxa_desc_credito.plus(
      taxa_adicional_parc.times(num_parcelas - 1),
    );

    // total_taxa_ant = val_credito_p * (1 - taxa_atual)
    const total_taxa_ant = new Decimal(val_credito_p).times(
      new Decimal(1).minus(taxa_atual),
    );

    // val_credito_parcelado = val_credito_p - total_taxa_ant (fee em centavos)
    const val_credito_parcelado = new Decimal(val_credito_p).minus(
      total_taxa_ant,
    );

    // Retorna taxa em centavos (val_credito_p já vem em centavos)
    return val_credito_parcelado.toNumber();
  } catch (error) {
    throw new Error(`Erro ao calcular antecipação simples: ${error.message}`);
  }
}

/**
 * Calcula antecipação utilizando juros compostos
 * Migrated from: calculos.py::calcular_antecipacao_composto
 *
 * @param val_credito_p - Valor a ser parcelado
 * @param num_parcelas - Número de parcelas
 * @param plano - Plano com as taxas
 * @returns Valor da taxa em centavos (multiplicado por 100)
 */
export function calcularAntecipacaoComposto(
  val_credito_p: number,
  num_parcelas: number,
  plano: Plano,
): number {
  try {
    // Taxas já vêm em decimal (0.0399 para 3,99%) do MaquininhasDatabaseService
    const taxa_desc_credito = new Decimal(plano.taxa_desconto_credito_vista);
    const taxa_adic_parcela = new Decimal(plano.taxa_adicional_parcela);
    const valor_parcela = new Decimal(val_credito_p).div(num_parcelas);

    // parcela_liq_taxa_desc = valor_parcela * (1 - taxa_desc_credito)
    const parcela_liq_taxa_desc = valor_parcela.times(
      new Decimal(1).minus(taxa_desc_credito),
    );

    // total_liq_desc = parcela_liq_taxa_desc * num_parcelas
    const total_liq_desc = parcela_liq_taxa_desc.times(num_parcelas);

    // resto_liq_desc = val_credito_p - total_liq_desc
    const resto_liq_desc = new Decimal(val_credito_p).minus(total_liq_desc);

    // Primeira parcela (i = 0, tx_ant = 0)
    let total_acumulado_tx_ant = parcela_liq_taxa_desc.times(1); // (1 - 0)

    // aux = 1 + taxa_adic_parcela (equivalente a 100% + taxa)
    const aux = new Decimal(1).plus(taxa_adic_parcela);

    // Loop de 1 até num_parcelas - 1
    for (let i = 1; i < num_parcelas; i++) {
      // potencia = (1 + taxa)^i
      const potencia = aux.pow(i);

      // tx_ant = potencia - 1
      const tx_ant = potencia.minus(1);

      // taxa_pronta = 1 - tx_ant
      const taxa_pronta = new Decimal(1).minus(tx_ant);

      // resultado_tx_ant = parcela_liq_taxa_desc * taxa_pronta
      const resultado_tx_ant = parcela_liq_taxa_desc.times(taxa_pronta);

      // Acumula
      total_acumulado_tx_ant = total_acumulado_tx_ant.plus(resultado_tx_ant);
    }

    // total_tx_ant = total_liq_desc - total_acumulado_tx_ant
    const total_tx_ant = total_liq_desc.minus(total_acumulado_tx_ant);

    // valor_credito_parc = total_tx_ant + resto_liq_desc (fee em centavos)
    const valor_credito_parc = total_tx_ant.plus(resto_liq_desc);

    // Retorna taxa em centavos (val_credito_p já vem em centavos)
    return valor_credito_parc.toNumber();
  } catch (error) {
    throw new Error(`Erro ao calcular antecipação composta: ${error.message}`);
  }
}

/**
 * Verifica se a maquininha passa pelos filtros configurados
 * Migrated from: calculos.py::in_filter
 *
 * @param maq - Maquininha a ser verificada
 * @param filtros - Filtros aplicados (ou null se sem filtros)
 * @returns true se passa pelos filtros, false caso contrário
 */
export function inFilter(
  maq: Maquininha,
  filtros: FiltrosMaquininha | null,
): boolean {
  try {
    if (filtros === null) {
      return true;
    }

    const {
      mensalidade,
      tarja,
      fio,
      PF,
      PJ,
      imprime_recibo,
      wifi,
      quero_antecipar,
      precisa_de_telefone,
      vale_refeicao,
      opcao_ecommerce,
    } = filtros;

    // Sem mensalidade
    if (mensalidade && (maq.valor_mensalidade > 0 || ehPlanoControle(maq))) {
      if (maq.sem_mensalidade !== true) {
        return false;
      }
    }

    // Realiza e-commerce
    if (opcao_ecommerce && !maq.opcao_ecommerce) {
      return false;
    }

    // Aceita tarja
    if (tarja && !maq.tarja) {
      return false;
    }

    // Sem fio
    if (fio && maq.fio) {
      return false;
    }

    // Vende para PJ
    if (PJ && !maq.PJ) {
      return false;
    }

    // Conexão Wi-Fi
    let maq_wifi = false;
    for (const tipo of maq.tipo_conexao) {
      if (tipo.nome === 'Wi-Fi') {
        maq_wifi = true;
        break;
      }
    }
    if (wifi && !maq_wifi) {
      return false;
    }

    // Vende para PF
    if (PF && !maq.PF) {
      return false;
    }

    // Imprime recibo
    if (imprime_recibo && !maq.imprime_recibo) {
      return false;
    }

    // Não precisa de telefone
    if (precisa_de_telefone && maq.precisa_de_telefone) {
      return false;
    }

    // Aceita vale refeição
    if (vale_refeicao && !maq.vale_refeicao) {
      return false;
    }

    return true;
  } catch (error) {
    throw new Error(`Erro ao aplicar filtros: ${error.message}`);
  }
}

/**
 * Verifica se algum plano da maquininha é do tipo "controle"
 * (grupo = 5)
 * Migrated from: utils.py::eh_plano_controle
 */
function ehPlanoControle(maq: Maquininha): boolean {
  return maq.planos.some((plano) => plano.grupo === 5);
}

/**
 * Calcula o custo de todas as maquininhas com base nos valores informados
 * Migrated from: calculos.py::calcular_maq
 *
 * @param val_credito - Valor de venda no crédito à vista
 * @param val_debito - Valor de venda no débito
 * @param val_credito_p - Valor de venda no crédito parcelado
 * @param num_parcelas - Número de parcelas
 * @param setor - ID do setor/segmento (ou null)
 * @param filtros - Filtros de busca (ou null)
 * @param maquinas - Lista de maquininhas a calcular
 * @returns Lista de resultados ordenados por avaliação (decrescente)
 */
export function calcularMaq(
  val_credito: number,
  val_debito: number,
  val_credito_p: number,
  num_parcelas: number,
  setor: number | null,
  filtros: FiltrosMaquininha | null,
  maquinas: Maquininha[],
): ResultadoMaquininha[] {
  try {
    const retorno: ResultadoMaquininha[] = [];

    for (const maq of maquinas) {
      // Verifica se a maquininha passa pelos filtros
      if (!inFilter(maq, filtros)) {
        continue;
      }

      // Filtra planos por antecipação
      let todos_planos: Plano[];
      if (filtros?.quero_antecipar) {
        todos_planos = maq.planos.filter((p) => p.antecipado === true);
      } else {
        todos_planos = maq.planos; // Todos os planos
      }

      for (const plano of todos_planos) {
        // Verifica se plano está ativo
        if (!plano.ativo) {
          continue;
        }

        // Verifica se maquininha aceita o número de parcelas
        if (maq.possibilidade_parcelamento < num_parcelas) {
          continue;
        }

        // Verifica se o plano está no setor informado
        let no_setor = true;
        if (plano.segmentos && plano.segmentos.length > 0) {
          if (setor !== null) {
            const segmentoEncontrado = plano.segmentos.find(
              (seg) => seg.id === setor && seg.ativo,
            );
            if (!segmentoEncontrado) {
              no_setor = false;
            }
          } else {
            // Se não informou setor mas o plano tem restrição, pula
            no_setor = false;
          }
        }

        if (!no_setor) {
          continue;
        }

        // Inicializa variáveis de cálculo
        let plano_viavel = true;
        let total_mensal_geral = 0;
        const modelo_cobranca = plano.modelo_cobranca === ModeloCobranca.FAIXA;

        // Verifica se há débito ou se o plano tem taxa de débito
        if (
          val_debito === 0 &&
          !modelo_cobranca &&
          plano.taxa_desconto_debito === 0
        ) {
          continue;
        }

        const valores_juros = plano.taxas || [];
        let valor_debito = 0;
        let valor_credito = 0;
        let valor_credito_parc = 0;

        // Cálculos padrão (sem faixa)
        if (!modelo_cobranca) {
          valor_credito = new Decimal(val_credito)
            .times(plano.taxa_desconto_credito_vista)
            .toNumber();
          valor_debito = new Decimal(val_debito)
            .times(plano.taxa_desconto_debito)
            .toNumber();
        }

        // ========== MODELOS DE COBRANÇA ==========

        if (
          plano.modelo_cobranca === ModeloCobranca.ANTECIPACAO_JUROS_SIMPLES
        ) {
          // Modelo 1: Antecipação por Juros Simples
          valor_credito_parc = calcularAntecipacao(
            val_credito_p,
            num_parcelas,
            plano,
          );
        } else if (
          plano.modelo_cobranca === ModeloCobranca.ANTECIPACAO_JUROS_COMPOSTOS
        ) {
          // Modelo 2: Antecipação por Juros Compostos
          valor_credito_parc = calcularAntecipacaoComposto(
            val_credito_p,
            num_parcelas,
            plano,
          );
        } else if (modelo_cobranca) {
          // Modelo 3: Faixa de Faturamento
          const resultado = calcularPorFaixa(
            plano,
            val_credito,
            val_debito,
            val_credito_p,
            num_parcelas,
          );

          if (resultado.plano_viavel) {
            valor_debito = resultado.valor_debito;
            valor_credito = resultado.valor_credito;
            valor_credito_parc = resultado.valor_credito_parc;
            total_mensal_geral = resultado.total_mensal_geral;
          } else {
            plano_viavel = false;
          }
        } else {
          // Modelo 4: Taxa padrão (com taxa_adicional_parcela ou taxas por parcela)
          if (valores_juros.length <= 1) {
            // Usa taxa_adicional_parcela
            let taxa_base = plano.taxa_desconto_credito_vista;

            // Se informou a taxa da primeira parcela, usa como base
            if (valores_juros.length === 1) {
              taxa_base = valores_juros[0].taxa;
            }

            const taxa_parcela =
              taxa_base + (num_parcelas - 1) * plano.taxa_adicional_parcela;
            valor_credito_parc = val_credito_p * taxa_parcela;
          } else {
            // Usa a taxa específica da parcela
            const taxaParcela = valores_juros.find(
              (t) => t.parcela === num_parcelas,
            );
            if (taxaParcela) {
              valor_credito_parc = val_credito_p * taxaParcela.taxa;
            } else {
              // Se não encontrou taxa para essa parcela, pula
              continue;
            }
          }
        }

        if (!plano_viavel) {
          continue;
        }

        // ========== CÁLCULO DO CUSTO TOTAL MENSAL ==========

        const subtotal = valor_debito + valor_credito + valor_credito_parc;
        const total_mensal_juros = new Decimal(subtotal).div(100).toNumber();

        // Valor total informado pelo usuário
        const venda_mensal_cliente = val_credito + val_debito + val_credito_p;

        // Custo da compra da máquina (amortizado)
        let total_mensal_compra_maq = 0;
        let valor_leitor = maq.valor_leitor;
        let valor_selo: number | string = '';

        if (maq.valor_promocional && maq.valor_promocional > 0) {
          valor_leitor = maq.valor_promocional;
          valor_selo = Math.round(
            (maq.valor_promocional / maq.valor_leitor - 1) * -100,
          );
        }

        if (valor_leitor > 0) {
          if (maq.garantia && maq.garantia !== 0 && maq.garantia < 100) {
            total_mensal_compra_maq = valor_leitor / (maq.garantia * 12);
          } else {
            total_mensal_compra_maq = valor_leitor / 12;
          }
        }

        // Custo de aluguel/mensalidade
        let total_mensal_aluguel_maq = 0;

        if (maq.taxa_condicional) {
          // Taxa condicional sobre faturamento mínimo
          if (
            maq.minimo_sem_taxa &&
            venda_mensal_cliente < maq.minimo_sem_taxa
          ) {
            total_mensal_aluguel_maq =
              (maq.minimo_sem_taxa - venda_mensal_cliente) *
              ((maq.taxa || 0) / 100);
          }
        } else {
          // Mensalidade condicional
          if (maq.valor_mensalidade > 0 && maq.minimo_sem_mensalidade) {
            if (
              maq.mensalidade_condicional &&
              venda_mensal_cliente >= maq.minimo_sem_mensalidade
            ) {
              total_mensal_aluguel_maq = 0;
            } else {
              total_mensal_aluguel_maq = maq.valor_mensalidade;
            }
          }
        }

        // Total geral (se não foi calculado por faixa)
        if (total_mensal_geral === 0) {
          total_mensal_geral =
            total_mensal_juros +
            total_mensal_compra_maq +
            total_mensal_aluguel_maq;
        }

        // Só adiciona se o custo mensal for significativo e plano viável
        if (total_mensal_geral > 1 && plano_viavel) {
          let val_mensalidade = maq.valor_mensalidade;

          // Se é plano controle, pega o valor da primeira faixa
          if (plano.grupo === 5) {
            if (
              maq.sem_mensalidade !== true &&
              plano.faixa_faturamento &&
              plano.faixa_faturamento.length > 0
            ) {
              val_mensalidade = plano.faixa_faturamento[0].valor;
            }
          }

          const resultado: ResultadoMaquininha = {
            nome: `${maq.nome} ${plano.nome}`,
            id_maq: maq.id,
            empresa: maq.empresa.nome,
            empresa_cnpj: maq.empresa.cnpj,
            logo: maq.empresa.logo,
            imagem_maquina: maq.imagem,
            valor_mensal: total_mensal_geral,
            valor_selo: valor_selo,
            cupom: maq.cupom,
            dias_debito: plano.dias_repasse_debito,
            tipo_dias_credito: plano.tipo_dias_credito.tipo,
            dias_credito: plano.dias_repasse_credito,
            co_cartao: plano.id,
            observacao: maq.observacao,
            dias_credito_parcelado: plano.dias_repasse_credito_parc,
            tipo_recebimento_parcelado: plano.tipo_recebimento_parcelado,
            valor_mensalidade: val_mensalidade,
            valor_transacao: maq.valor_transacao,
            afiliacao_a_banco: maq.afiliacao_a_banco,
            chip: maq.chip,
            tarja: maq.tarja,
            tipo_conexoes: maq.tipo_conexao,
            opcao_ecommerce: maq.opcao_ecommerce,
            forma_recebimento: maq.forma_recebimento,
            taxas_transparentes: maq.taxas_transparentes,
            vale_refeicao: maq.vale_refeicao,
            NFC: maq.NFC,
            PF: maq.PF,
            PJ: maq.PJ,
            precisa_de_telefone: maq.precisa_de_telefone,
            fio: maq.fio,
            imprime_recibo: maq.imprime_recibo,
            garantia: maq.garantia,
            possivel_antecipacao: maq.possivel_antecipacao,
            antecipado: plano.antecipado,
            bandeiras: maq.bandeiras,
            avaliacao: plano.avaliacao,
            data_atualizacao: maq.atualizado_em.toLocaleDateString('pt-BR'),
            url_avaliacao: maq.url_avaliacao,
            cruzamentos: [], // Será preenchido pelo service se necessário
            tem_parceria: maq.empresa.parceiro,
            site: plano.url,
            possibilidade_parcelamento: maq.possibilidade_parcelamento,
          };

          retorno.push(resultado);
        }
      } // end for plano
    } // end for maquina

    if (retorno.length === 0) {
      throw new Error(
        'Nenhuma maquininha encontrada com os critérios informados',
      );
    }

    // Ordena por avaliação (decrescente) - igual ao Django
    retorno.sort((a, b) => b.avaliacao - a.avaliacao);

    return retorno;
  } catch (error) {
    throw new Error(`Erro ao calcular maquininhas: ${error.message}`);
  }
}

/**
 * Calcula valores para planos com faixa de faturamento
 * Implementa os 3 tipos de faixa (PRECO, TAXA, TAXA_ADICIONAL)
 */
function calcularPorFaixa(
  plano: Plano,
  val_credito: number,
  val_debito: number,
  val_credito_p: number,
  num_parcelas: number,
): {
  plano_viavel: boolean;
  valor_debito: number;
  valor_credito: number;
  valor_credito_parc: number;
  total_mensal_geral: number;
} {
  const faixas = plano.faixa_faturamento || [];
  const soma = new Decimal(val_credito)
    .plus(val_debito)
    .plus(val_credito_p)
    .toNumber();

  let valor_debito = 0;
  let valor_credito = 0;
  let valor_credito_parc = 0;
  let total_mensal_geral = 0;
  let plano_viavel = true;
  let i = 0;
  let faixa_encontrada = false;

  // TIPO FAIXA == PREÇO (1)
  if (plano.tipo_faixa === TipoFaixa.PRECO) {
    for (const faixa of faixas) {
      if (faixa.minimo <= soma && soma <= faixa.maximo) {
        total_mensal_geral = faixa.valor;
        faixa_encontrada = true;
        break;
      }
      i++;
    }

    // Faturamento superior a todas as faixas
    if (!faixa_encontrada && i === faixas.length) {
      const ultima_faixa = faixas[faixas.length - 1];
      if (ultima_faixa && ultima_faixa.minimo <= soma) {
        const excedente = soma - ultima_faixa.maximo;
        total_mensal_geral =
          ultima_faixa.valor +
          new Decimal(plano.taxa_valor_excedente)
            .div(100)
            .times(excedente)
            .toNumber();
      } else {
        plano_viavel = false;
      }
    } else if (!faixa_encontrada) {
      plano_viavel = false;
    }
  }
  // TIPO FAIXA == TAXA (2)
  else if (plano.tipo_faixa === TipoFaixa.TAXA) {
    for (const faixa of faixas) {
      if (faixa.minimo <= soma && soma <= faixa.maximo) {
        let taxa_credito_parc = faixa.taxa_credito_p;
        if (num_parcelas > 6) {
          taxa_credito_parc = faixa.taxa_credito_p2;
        }

        valor_credito = new Decimal(val_credito)
          .times(faixa.taxa_credito)
          .toNumber();
        valor_debito = new Decimal(val_debito).times(faixa.valor).toNumber();
        valor_credito_parc = new Decimal(val_credito_p)
          .times(taxa_credito_parc)
          .toNumber();

        faixa_encontrada = true;
        break;
      }
      i++;
    }

    // Faturamento superior a todas as faixas
    if (!faixa_encontrada && i === faixas.length) {
      const ultima_faixa = faixas[faixas.length - 1];
      if (ultima_faixa && ultima_faixa.minimo <= soma) {
        let taxa_credito_parc = ultima_faixa.taxa_credito_p;
        if (num_parcelas > 6) {
          taxa_credito_parc = ultima_faixa.taxa_credito_p2;
        }

        valor_credito = new Decimal(val_credito)
          .times(ultima_faixa.taxa_credito)
          .toNumber();
        valor_debito = new Decimal(val_debito)
          .times(ultima_faixa.valor)
          .toNumber();
        valor_credito_parc = new Decimal(val_credito_p)
          .times(taxa_credito_parc)
          .toNumber();
      } else {
        plano_viavel = false;
      }
    } else if (!faixa_encontrada) {
      plano_viavel = false;
    }
  }
  // TIPO FAIXA == TAXA ADICIONAL (3)
  else {
    for (const faixa of faixas) {
      if (faixa.minimo <= soma && soma <= faixa.maximo) {
        const taxa_credito_parc_base = faixa.taxa_credito_p;

        valor_credito = new Decimal(val_credito)
          .times(faixa.taxa_credito)
          .toNumber();
        valor_debito = new Decimal(val_debito).times(faixa.valor).toNumber();

        // Calcula taxa acumulada por parcela
        let parcela_atual = 1;
        let taxa_atual = taxa_credito_parc_base;

        while (parcela_atual < num_parcelas) {
          taxa_atual += plano.taxa_adicional_parcela;
          parcela_atual++;
        }

        valor_credito_parc = taxa_atual * val_credito_p;
        faixa_encontrada = true;
        break;
      }
      i++;
    }

    // Faturamento superior a todas as faixas
    if (!faixa_encontrada && i === faixas.length) {
      const ultima_faixa = faixas[faixas.length - 1];
      if (ultima_faixa && ultima_faixa.minimo <= soma) {
        const taxa_credito_parc_base = ultima_faixa.taxa_credito_p;

        valor_credito = new Decimal(val_credito)
          .times(ultima_faixa.taxa_credito)
          .toNumber();
        valor_debito = new Decimal(val_debito)
          .times(ultima_faixa.valor)
          .toNumber();

        let parcela_atual = 1;
        let taxa_atual = taxa_credito_parc_base;

        while (parcela_atual < num_parcelas) {
          taxa_atual += plano.taxa_adicional_parcela;
          parcela_atual++;
        }

        valor_credito_parc = taxa_atual * val_credito_p;
      } else {
        plano_viavel = false;
      }
    } else if (!faixa_encontrada) {
      plano_viavel = false;
    }
  }

  return {
    plano_viavel,
    valor_debito,
    valor_credito,
    valor_credito_parc,
    total_mensal_geral,
  };
}

/**
 * Arredonda para 2 casas decimais
 */
export function arredondar2Decimais(valor: number): number {
  return Math.round(valor * 100) / 100;
}
