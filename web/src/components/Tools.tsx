"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorIcon, Car, CreditCard, Landmark } from "lucide-react";

const features = [
    {
        title: "Máquinas de cartão",
        description: "Ranking das melhores máquinas para o seu negócio",
        icon: CreditCard,
        color: "from-slate-100 to-slate-200",
        link: "/rankings/maquinas-cartao",
    },
    {
        title: "Carro por assinatura",
        description: "Ranking das melhores empresas de carro por assinatura",
        icon: Car,
        color: "from-blue-100 to-blue-200",
        link: "/rankings/assinatura-carro",
    },
    {
        title: "Contas digitais",
        description: "Ranking das melhores contas digitais do mercado",
        icon: Landmark,
        color: "from-green-100 to-green-200",
        link: "/rankings/contas-digitais",
    },
    {
        title: "Simule grátis",
        description: "Calcule rendimentos e descubra o poder dos juros compostos",
        icon: CalculatorIcon,
        color: "from-amber-100 to-amber-200",
        link: "/simuladores/juros-compostos",
    },
];

export default function Tools() {
    return (
        <section className="py-20 bg-muted/30" id="rankings">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-in fade-in duration-700">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        Ferramentas para suas{" "}
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            decisões financeiras
                        </span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Link key={feature.title} href={feature.link} className="block">
                            <Card
                                className={`group hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-br from-background to-muted/50 border border-border/50 hover:border-primary/30 animate-in slide-in-from-bottom-8 duration-700 cursor-pointer h-full`}
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <CardHeader className="text-center pb-4">
                                    <div
                                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} p-3 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300  flex items-center justify-center`}
                                    >
                                        <feature.icon className="w-8 h-8 text-foreground" />
                                    </div>
                                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <CardDescription className="text-muted-foreground mb-6 leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12 animate-in fade-in duration-1000">
                    <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-full hover:scale-105 transition-transform duration-200"
                            asChild
                        >
                            <Link href="/rankings">Acesse todos os rankings</Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full hover:scale-105 transition-transform duration-200"
                            asChild
                        >
                            <Link href="/simuladores">Acesse todos os simuladores</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
