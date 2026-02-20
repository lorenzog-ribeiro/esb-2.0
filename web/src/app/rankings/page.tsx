import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { RANKINGS } from "@/config/site";

export default function RankingsHubPage() {
  return (
    <main className="container mx-auto py-6 px-4 max-w-7xl">
      <header className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <TrendingUp
            className="h-8 w-8 text-primary shrink-0"
            aria-hidden
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Rankings
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Compare e escolha as melhores opções do mercado com nossos rankings
          baseados em critérios objetivos
        </p>
      </header>

      <section
        aria-label="Lista de rankings disponíveis"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 grid-flow-dense"
      >
        {RANKINGS.map((ranking) => {
          const Icon = ranking.icon;
          const bgColor = ranking.iconBg ?? "bg-primary/10";
          const color = ranking.iconColor ?? "text-primary";

          return (
            <Card
              key={ranking.id}
              className="transition-all hover:shadow-lg hover:border-primary flex flex-col"
            >
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`p-3 rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center ${bgColor}`}
                    aria-hidden
                  >
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <Badge className="bg-accent text-accent-foreground shrink-0">
                    Disponível
                  </Badge>
                </div>
                <CardTitle className="text-xl">{ranking.title}</CardTitle>
                <CardDescription className="min-h-[48px]">
                  {ranking.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col h-full">
                <div className="text-sm text-muted-foreground mb-4">
                  {ranking.count} opções ranqueadas
                </div>
                <div className="mt-auto">
                  <Button
                    className="w-full min-h-[44px]"
                    asChild
                  >
                    <Link href={ranking.href}>
                      Ver Ranking
                      <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section
        className="mt-12 bg-muted p-6 rounded-lg"
        aria-labelledby="methodology-heading"
      >
        <h2
          id="methodology-heading"
          className="text-xl sm:text-2xl font-bold mb-4"
        >
          Como funcionam os rankings?
        </h2>
        <div className="space-y-3 text-muted-foreground">
          <p>
            Nossos rankings são baseados em critérios objetivos e ponderados,
            considerando múltiplos aspectos de cada produto ou serviço:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Critérios financeiros:</strong> Taxas, preços, mensalidades
              e custos totais
            </li>
            <li>
              <strong>Transparência:</strong> Clareza nas informações e ausência
              de custos ocultos
            </li>
            <li>
              <strong>Funcionalidades:</strong> Recursos oferecidos e tecnologia
              disponível
            </li>
            <li>
              <strong>Reputação:</strong> Avaliações de usuários e presença no
              mercado
            </li>
            <li>
              <strong>Atendimento:</strong> Qualidade do suporte ao cliente
            </li>
          </ul>
          <p className="pt-2">
            Cada ranking possui pesos específicos para seus critérios,
            priorizando os aspectos mais importantes para cada categoria.
          </p>
        </div>
      </section>
    </main>
  );
}
