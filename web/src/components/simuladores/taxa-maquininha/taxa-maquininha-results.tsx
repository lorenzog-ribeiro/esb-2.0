'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type {
  TaxaMaquininhaOutput,
  MaquininhaCalculada,
} from '@/lib/schemas/taxa-maquininha.schema';
import {
  Trophy,
  CreditCard,
  Calendar,
  ExternalLink,
  Wifi,
  Printer,
  Building2,
  Star,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface TaxaMaquininhaResultsProps {
  resultado: TaxaMaquininhaOutput;
}

const ITEMS_PER_PAGE = 5;

export function TaxaMaquininhaResults({ resultado }: TaxaMaquininhaResultsProps) {
  const { maquininhas, total, melhor_opcao, input_data } = resultado;
  const [exibidas, setExibidas] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setExibidas(ITEMS_PER_PAGE);
  }, [total]);

  const maquininhasVisiveis = maquininhas.slice(0, exibidas);
  const haMais = exibidas < maquininhas.length;

  const carregarMais = () => {
    setExibidas((prev) => Math.min(prev + ITEMS_PER_PAGE, maquininhas.length));
  };

  return (
    <div className="space-y-6">
      {/* Resumo da Simulação */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Resultado da Simulação
          </CardTitle>
          <CardDescription>
            Encontramos {total} maquininha{total !== 1 ? 's' : ''} que atende{total !== 1 ? 'm' : ''} aos seus critérios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Venda Total Mensal</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(
                  input_data.venda_debito +
                    input_data.venda_credito_vista +
                    input_data.venda_credito_parcelado,
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Melhor Opção</p>
              <p className="text-2xl font-bold text-primary">
                {melhor_opcao.nome}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo Mensal Estimado</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(melhor_opcao.valor_mensal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Maquininhas */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Comparação de Maquininhas
        </h2>
        <p className="text-sm text-gray-600">
          Exibindo {maquininhasVisiveis.length} de {total} maquininhas
        </p>

        {maquininhasVisiveis.map((maq, index) => (
          <MaquininhaCard
            key={`${maq.id_maq}-${maq.co_cartao}-${index}`}
            maquininha={maq}
            isMelhorOpcao={index === 0}
            ranking={index + 1}
          />
        ))}

        {haMais && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={carregarMais}
              className="gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Carregar mais opções
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface MaquininhaCardProps {
  maquininha: MaquininhaCalculada;
  isMelhorOpcao: boolean;
  ranking: number;
}

function MaquininhaCard({
  maquininha,
  isMelhorOpcao,
  ranking,
}: MaquininhaCardProps) {
  const {
    nome,
    empresa,
    logo,
    imagem_maquina,
    valor_mensal,
    valor_mensalidade,
    dias_debito,
    dias_credito,
    dias_credito_parcelado,
    tipo_recebimento_parcelado,
    avaliacao,
    chip,
    tarja,
    NFC,
    wifi,
    imprime_recibo,
    precisa_de_telefone,
    vale_refeicao,
    opcao_ecommerce,
    bandeiras,
    site,
    cupom,
    observacao,
  } = maquininha;

  return (
    <Card className={isMelhorOpcao ? 'border-primary/50 shadow-lg' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          {/* Logo e imagem da maquininha */}
          <div className="flex shrink-0 gap-3">
            {logo && (
              <div className="relative h-12 w-16 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt={`Logo ${empresa}`}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            )}
            {imagem_maquina && (
              <div className="relative h-16 w-20 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagem_maquina}
                  alt={nome}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isMelhorOpcao && (
                <Badge variant="default" className="bg-primary">
                  <Trophy className="h-3 w-3 mr-1" />
                  Melhor Opção
                </Badge>
              )}
              <Badge variant="outline">#{ranking}</Badge>
            </div>
            <CardTitle className="text-xl">{nome}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              {empresa}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(valor_mensal)}
            </p>
            <p className="text-sm text-gray-600">por mês</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Avaliação */}
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold">{avaliacao.toFixed(1)}</span>
          <span className="text-sm text-gray-600">de 10</span>
        </div>

        <Separator />

        {/* Custos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mensalidade</p>
            <p className="font-semibold">
              {valor_mensalidade === 0
                ? 'Grátis'
                : new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(valor_mensalidade)}
            </p>
          </div>
        </div>

        <Separator />

        {/* Prazos de Repasse */}
        <div>
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Prazos de Repasse
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Débito</p>
              <p className="font-semibold">{dias_debito}d</p>
            </div>
            <div>
              <p className="text-gray-600">Crédito</p>
              <p className="font-semibold">{dias_credito}d</p>
            </div>
            <div>
              <p className="text-gray-600">Parcelado</p>
              <p className="font-semibold">
                {tipo_recebimento_parcelado ? 'Após parcelas' : `${dias_credito_parcelado}d`}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Características */}
        <div>
          <p className="text-sm font-semibold mb-2">Características</p>
          <div className="flex flex-wrap gap-2">
            {chip && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Chip
              </Badge>
            )}
            {tarja && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Tarja
              </Badge>
            )}
            {NFC && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                NFC/Aproximação
              </Badge>
            )}
            {wifi && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Wi-Fi
              </Badge>
            )}
            {imprime_recibo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Printer className="h-3 w-3" />
                Imprime Recibo
              </Badge>
            )}
            {!precisa_de_telefone && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Não exige celular
              </Badge>
            )}
            {vale_refeicao && (
              <Badge variant="secondary">Vale Refeição</Badge>
            )}
            {opcao_ecommerce && (
              <Badge variant="secondary">E-commerce</Badge>
            )}
          </div>
        </div>

        {/* Bandeiras Aceitas */}
        {bandeiras && bandeiras.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-semibold mb-2">Bandeiras Aceitas</p>
              <div className="flex flex-wrap gap-2">
                {bandeiras.map((bandeira, idx) => (
                  <Badge key={idx} variant="outline">
                    {bandeira.nome}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Observações */}
        {observacao && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-gray-600">{observacao}</p>
            </div>
          </>
        )}

        {/* Cupom e Link */}
        <div className="flex gap-2">
          {cupom && (
            <Badge variant="default" className="bg-green-600">
              Cupom: {cupom}
            </Badge>
          )}
          {site && (
            <Button asChild variant="default" className="flex-1">
              <a href={site} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Contratar
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
