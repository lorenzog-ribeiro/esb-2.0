import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink, Trophy } from 'lucide-react';
import { CardMachineRankingItem } from '@/lib/schemas/rankings/card-machines-ranking.schema';
import { Logo } from './Logo';

interface RankingTableProps {
  items: CardMachineRankingItem[];
}

/**
 * Reusable ranking table component
 *
 * Displays ranked items in a responsive table format
 * Highlights the best option (rank 1)
 */
export function RankingTable({ items }: RankingTableProps) {
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-accent hover:bg-accent/90 text-accent-foreground';
    if (rank === 2) return 'bg-muted hover:bg-muted/80 text-foreground';
    if (rank === 3) return 'bg-accent/80 hover:bg-accent/90 text-accent-foreground';
    return 'bg-muted hover:bg-muted/80 text-foreground';
  };

  return (
    <div className="space-y-3">
      {/* Mobile: cards (evita overflow em 320px) */}
      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const hasPromo =
            item.pricing.preco_promocional !== null &&
            item.pricing.preco_promocional < item.pricing.preco;
          return (
            <Card
              key={item.id}
              className={
                item.isBestOption
                  ? 'border-accent bg-accent/10 dark:bg-accent/20'
                  : 'border-border/60'
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.isBestOption && (
                        <Trophy className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <Badge className={getRankBadgeColor(item.rank)}>
                        {item.rank}º
                      </Badge>
                      {item.isBestOption && (
                        <Badge variant="outline" className="text-xs border-accent">
                          Melhor Opção
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 min-w-0">
                      <Logo
                        src={item.logo}
                        alt={item.empresa}
                        className="h-6 w-auto"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.empresa}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {hasPromo ? (
                      <div>
                        <div className="text-xs line-through text-muted-foreground">
                          R$ {item.pricing.preco.toFixed(2)}
                        </div>
                        <div className="font-semibold text-primary">
                          R$ {item.pricing.preco_promocional!.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-semibold">
                        {item.pricing.preco === 0
                          ? 'Grátis'
                          : `R$ ${item.pricing.preco.toFixed(2)}`}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.pricing.mensalidade === 0
                        ? 'Sem mensalidade'
                        : `Mensal: R$ ${item.pricing.mensalidade.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-xs text-muted-foreground">Débito</div>
                    <div className="font-medium">
                      {item.planos.length > 0 ? item.planos[0].taxa_debito : '-'}
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-xs text-muted-foreground">Crédito</div>
                    <div className="font-medium">
                      {item.planos.length > 0
                        ? item.planos[0].taxa_credito_vista
                        : '-'}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  className={
                    item.isBestOption ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full'
                  }
                  variant={item.isBestOption ? 'default' : 'outline'}
                  asChild
                >
                  <a href={item.url_contratacao} target="_blank" rel="noopener noreferrer">
                    Contratar
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop/tablet: tabela com scroll interno */}
      <div className="hidden md:block rounded-lg border">
        <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Posição</TableHead>
            <TableHead>Maquininha</TableHead>
            <TableHead className="hidden md:table-cell">Empresa</TableHead>
            <TableHead className="hidden lg:table-cell">
              Características
            </TableHead>
            <TableHead>Preço</TableHead>
            <TableHead className="hidden md:table-cell">Mensalidade</TableHead>
            <TableHead className="hidden lg:table-cell">
              Taxa Débito
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Taxa Crédito
            </TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const hasPromo =
              item.pricing.preco_promocional !== null &&
              item.pricing.preco_promocional < item.pricing.preco;

            return (
              <TableRow
                key={item.id}
                className={
                  item.isBestOption
                    ? 'bg-accent/10 dark:bg-accent/20 hover:bg-accent/20'
                    : ''
                }
              >
                {/* Rank */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.isBestOption && (
                      <Trophy className="h-4 w-4 text-primary" />
                    )}
                    <Badge className={getRankBadgeColor(item.rank)}>
                      {item.rank}º
                    </Badge>
                  </div>
                </TableCell>

                {/* Machine Name */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Logo
                      src={item.logo}
                      alt={item.empresa}
                      className="h-6 w-auto object-contain hidden sm:block"
                    />
                    <div>
                      <div className="font-semibold text-foreground">{item.name}</div>
                      {item.isBestOption && (
                        <Badge
                          variant="outline"
                          className="text-xs mt-1 border-accent text-accent-foreground"
                        >
                          Melhor Opção
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Company */}
                <TableCell className="hidden md:table-cell">
                  {item.empresa}
                </TableCell>

                {/* Features */}
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {item.features.nfc && (
                      <Badge variant="secondary" className="text-xs bg-accent/10 text-foreground border border-accent/30">
                        NFC
                      </Badge>
                    )}
                    {item.features.imprime_recibo && (
                      <Badge variant="secondary" className="text-xs bg-accent/10 text-foreground border border-accent/30">
                        Recibo
                      </Badge>
                    )}
                    {item.features.permite_antecipacao && (
                      <Badge variant="secondary" className="text-xs bg-accent/10 text-foreground border border-accent/30">
                        Antecipação
                      </Badge>
                    )}
                    {item.features.vale_refeicao && (
                      <Badge variant="secondary" className="text-xs bg-accent/10 text-foreground border border-accent/30">
                        VR
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Price */}
                <TableCell>
                  {hasPromo ? (
                    <div>
                      <div className="text-xs line-through text-muted-foreground">
                        R$ {item.pricing.preco.toFixed(2)}
                      </div>
                      <div className="font-semibold text-primary">
                        R$ {item.pricing.preco_promocional!.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="font-medium">
                      {item.pricing.preco === 0
                        ? 'Grátis'
                        : `R$ ${item.pricing.preco.toFixed(2)}`}
                    </div>
                  )}
                </TableCell>

                {/* Monthly Fee */}
                <TableCell className="hidden md:table-cell">
                  {item.pricing.mensalidade === 0 ? (
                    <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                      R$ 0,00
                    </Badge>
                  ) : (
                    `R$ ${item.pricing.mensalidade.toFixed(2)}`
                  )}
                </TableCell>

                {/* Debit Rate */}
                <TableCell className="hidden lg:table-cell">
                  {item.planos.length > 0 ? item.planos[0].taxa_debito : '-'}
                </TableCell>

                {/* Credit Rate */}
                <TableCell className="hidden lg:table-cell">
                  {item.planos.length > 0
                    ? item.planos[0].taxa_credito_vista
                    : '-'}
                </TableCell>

                {/* Action */}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={item.isBestOption ? 'default' : 'outline'}
                    className={
                      item.isBestOption
                        ? 'bg-green-600 hover:bg-green-700'
                        : ''
                    }
                    asChild
                  >
                    <a
                      href={item.url_contratacao}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="hidden sm:inline">Contratar</span>
                      <ExternalLink className="h-4 w-4 sm:ml-2" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
