import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SIMULATORS } from "@/config/site";

export default function SimuladoresHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <section
        className="bg-muted/30 py-8 sm:py-12"
        aria-labelledby="simuladores-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1
            id="simuladores-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
          >
            Simuladores Financeiros
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas gratuitas para ajudar você a tomar as melhores decisões
            financeiras.
          </p>
        </div>
      </section>

      <main>
        <section
          className="py-10 sm:py-14"
          aria-label="Lista de simuladores disponíveis"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {SIMULATORS.map((simulator) => {
                const Icon = simulator.icon;
                const isAvailable = simulator.status === "available";

                return (
                  <Card
                    key={simulator.id}
                    className="flex flex-col h-full shadow-sm hover:shadow-md transition-all hover:border-primary"
                  >
                    <CardHeader className="flex flex-row items-start gap-3 pb-3">
                      <div
                        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                        aria-hidden
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-lg font-semibold">
                          {simulator.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                          {simulator.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 flex-1 pt-0">
                      <div className="flex flex-wrap gap-2">
                        {simulator.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="secondary"
                            className="bg-accent text-accent-foreground"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-auto pt-4">
                        <Button
                          className="w-full min-h-[44px] flex items-center justify-center gap-2"
                          variant="default"
                          asChild={isAvailable}
                          disabled={!isAvailable}
                        >
                          {isAvailable ? (
                            <Link href={simulator.href}>
                              Ver simulador
                              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                          ) : (
                            <>
                              Em breve
                              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
