import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
    FaFacebookF as Facebook,
    FaTwitter as Twitter,
    FaInstagram as Instagram,
    FaLinkedinIn as Linkedin,
    FaYoutube as Youtube,
} from "react-icons/fa";

export default async function Footer() {
    return (
        <footer className="bg-muted/50 border-t border-border/50">
            {/* Newsletter Section */}
            {/* <div className="bg-gradient-primary py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-primary-foreground">
                        <h3 className="text-2xl font-bold mb-4">Fique por dentro das novidades</h3>
                        <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                            Receba conteúdo exclusivo e seja o primeiro a saber sobre novos rankings e simuladores
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Seu e-mail"
                                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-primary-foreground placeholder-white/70 backdrop-blur-sm focus:outline-none focus:border-white/40 transition-all duration-300"
                            />
                            <Button variant="ghost" size="lg" className="sm:w-auto">
                                Inscrever-se
                            </Button>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Main Footer Content */}
            <div className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
                        {/* Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 md:w-[70px] md:h-[70px] rounded-lg flex items-center justify-center">
                                    <Image src="/bolsito_new.svg" alt="Logo" width={70} height={70} />
                                </div>
                                <div>
                                    <h3 className="gradient-text text-lg font-bold">Educando Seu Bolso</h3>
                                    <p className="text-muted-foreground text-sm">Educação financeira moderna</p>
                                </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Guiamos suas decisões financeiras com conteúdo prático e confiável — rankings
                                independentes, simuladores e análises que ajudam você a economizar, investir e planejar
                                o futuro.
                            </p>
                        <div className="flex space-x-3">
                            <Button variant="secondary" size="icon" className="hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary">
                                <Link href="https://x.com/bolsito_">
                                    <Twitter className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button variant="secondary" size="icon" className="hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary">
                                <Link href="https://www.facebook.com/people/Blog-Educando-Seu-Bolso/61554308285348/">
                                    <Facebook className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button variant="secondary" size="icon" className="hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary">
                                <Link href="https://www.instagram.com/educandoseubolso/">
                                    <Instagram className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button variant="secondary" size="icon" className="hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary">
                                <Link href="https://www.linkedin.com/company/educandoseubolso">
                                    <Linkedin className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button variant="secondary" size="icon" className="hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary">
                                <Link href="https://www.youtube.com/@EducandoSeuBolso">
                                    <Youtube className="w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                        </div>

                        {/* Rankings */}
                        <div className="space-y-4">
                            <h4 className="text-foreground font-semibold">Rankings</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="/rankings/maquinas-cartao"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Máquinas de cartão
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/rankings/contas-digitais"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Contas digitais
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/rankings/assinatura-carro"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Carro por assinatura
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Ferramentas */}
                        <div className="space-y-4">
                            <h4 className="text-foreground font-semibold">Ferramentas</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="/simuladores/amortizacao"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Simulador de amortização
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/simuladores/renda-fixa"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Simulador de renda fixa
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/simuladores/comparador-assinatura"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Comparador de carro por assinatura
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contato */}
                        <div className="space-y-4">
                            <h4 className="text-foreground font-semibold">Contato</h4>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">marketing@educandoseubolso.blog.br</span>
                                </div>
                                <div className="flex items-center space-x-3 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">+55 (31) 9 9918-9537</span>
                                </div>
                                <div className="flex items-center space-x-3 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">Belo Horizonte, MG - Brasil</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Bottom Footer */}
            <div className="py-6">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-center md:text-left">
                            <p className="text-muted-foreground text-sm">
                                Copyright © 2024 Educando Seu Bolso. Todos os direitos reservados.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-accent transition-colors duration-200"
                            >
                                Política de Privacidade
                            </a>
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-accent transition-colors duration-200"
                            >
                                Termos de Uso
                            </a>
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-accent transition-colors duration-200"
                            >
                                Sobre nós
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
