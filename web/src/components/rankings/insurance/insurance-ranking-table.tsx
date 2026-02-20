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
import { ExternalLink, Trophy, ShieldCheck, Star } from 'lucide-react';
import { InsuranceRankingItem } from '@/lib/schemas/rankings/insurance-ranking.schema';

interface InsuranceRankingTableProps {
  items: InsuranceRankingItem[];
}

export function InsuranceRankingTable({ items }: InsuranceRankingTableProps) {
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    if (rank === 2) return 'bg-gray-400 hover:bg-gray-500 text-white';
    if (rank === 3) return 'bg-orange-600 hover:bg-orange-700 text-white';
    return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
  };

  return (
    <div className="space-y-3">
      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
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
                    <Badge variant="secondary" className="text-xs">
                      Score {item.score.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2 min-w-0">
                    {item.logo && (
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="h-6 w-auto object-contain shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.company}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">
                    R$ {item.pricing.preco_mensal_estimado_min.toFixed(0)} - R$ {item.pricing.preco_mensal_estimado_max.toFixed(0)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Franquia: R$ {item.pricing.franquia_minima.toFixed(0)} - R$ {item.pricing.franquia_maxima.toFixed(0)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {item.coverage.cobertura_total && (
                  <Badge variant="outline" className="text-xs">
                    Cobertura total
                  </Badge>
                )}
                {item.coverage.cobertura_terceiros && (
                  <Badge variant="outline" className="text-xs">
                    Terceiros
                  </Badge>
                )}
                {item.coverage.assistencia_24h && (
                  <Badge variant="outline" className="text-xs">
                    Assistência 24h
                  </Badge>
                )}
                {item.coverage.carro_reserva && (
                  <Badge variant="outline" className="text-xs">
                    Carro reserva
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    Aprovação
                  </div>
                  <div className="font-medium">
                    {item.sinistros_aprovados_percentual}%
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    Avaliação
                  </div>
                  <div className="font-medium">{item.avaliacao_clientes.toFixed(1)}</div>
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
        ))}
      </div>

      {/* Desktop/tablet: tabela com scroll interno */}
      <div className="hidden md:block rounded-lg border">
        <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Posição</TableHead>
            <TableHead>Seguradora</TableHead>
            <TableHead className="hidden md:table-cell">Cobertura</TableHead>
            <TableHead className="hidden lg:table-cell">Serviços</TableHead>
            <TableHead>Preço Mensal</TableHead>
            <TableHead className="hidden md:table-cell">Franquia</TableHead>
            <TableHead className="hidden lg:table-cell">
              Aprovação
            </TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={
                item.isBestOption
                  ? 'bg-accent/10 dark:bg-accent/20 hover:bg-accent/20'
                  : ''
              }
            >
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

              <TableCell>
                <div className="flex items-center gap-3">
                  {item.logo && (
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="h-6 w-auto object-contain hidden sm:block"
                    />
                  )}
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.company}</div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {item.coverage.cobertura_total && (
                    <Badge variant="secondary" className="text-xs">
                      Total
                    </Badge>
                  )}
                  {item.coverage.cobertura_terceiros && (
                    <Badge variant="secondary" className="text-xs">
                      Terceiros
                    </Badge>
                  )}
                  {item.coverage.assistencia_24h && (
                    <Badge variant="secondary" className="text-xs">
                      24h
                    </Badge>
                  )}
                  {item.coverage.carro_reserva && (
                    <Badge variant="secondary" className="text-xs">
                      Carro reserva
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {item.services.app_mobile && (
                    <Badge variant="secondary" className="text-xs">
                      App
                    </Badge>
                  )}
                  {item.services.atendimento_online && (
                    <Badge variant="secondary" className="text-xs">
                      Online
                    </Badge>
                  )}
                  {item.services.guincho_km !== null && (
                    <Badge variant="secondary" className="text-xs">
                      Guincho {item.services.guincho_km}km
                    </Badge>
                  )}
                  {item.services.guincho_km === null && (
                    <Badge variant="secondary" className="text-xs">
                      Guincho ilimitado
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="font-medium">
                  R$ {item.pricing.preco_mensal_estimado_min.toFixed(0)} - R${' '}
                  {item.pricing.preco_mensal_estimado_max.toFixed(0)}
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <div className="text-sm">
                  R$ {item.pricing.franquia_minima.toFixed(0)} - R${' '}
                  {item.pricing.franquia_maxima.toFixed(0)}
                </div>
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {item.sinistros_aprovados_percentual}%
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {item.avaliacao_clientes.toFixed(1)}
                </div>
              </TableCell>

              <TableCell>
                <div className="font-semibold">{item.score.toFixed(2)}</div>
              </TableCell>

              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={item.isBestOption ? 'default' : 'outline'}
                  className={
                    item.isBestOption ? 'bg-green-600 hover:bg-green-700' : ''
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
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
