import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebookF as Facebook,
  FaTwitter as Twitter,
  FaInstagram as Instagram,
  FaLinkedinIn as Linkedin,
  FaYoutube as Youtube,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SITE,
  CONTACT,
  SOCIAL_LINKS,
  FOOTER_RANKING_LINKS,
  FOOTER_SIMULATOR_LINKS,
} from "@/config/site";

/** Icon map for social links */
const SocialIconMap = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
} as const;

export default async function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-muted/50 border-t border-border/50"
      aria-label="Rodapé do site"
    >
      <div className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1920px]">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <section aria-labelledby="footer-brand">
              <div className="flex items-start gap-3">
                <Image
                  src="/bolsito_new.svg"
                  alt=""
                  width={70}
                  height={70}
                  className="w-10 h-10 md:w-[70px] md:h-[70px] shrink-0"
                />
                <div>
                  <h2
                    id="footer-brand"
                    className="gradient-text text-lg font-bold"
                  >
                    {SITE.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {SITE.tagline}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Guiamos suas decisões financeiras com conteúdo prático e
                confiável — rankings independentes, simuladores e análises que
                ajudam você a economizar, investir e planejar o futuro.
              </p>
              <div
                className="flex gap-2 mt-4"
                role="group"
                aria-label="Redes sociais"
              >
                {SOCIAL_LINKS.map((social) => {
                  const Icon = SocialIconMap[social.iconKey];
                  return (
                    <Button
                      key={social.href}
                      variant="secondary"
                      size="icon"
                      className="min-w-[44px] min-h-[44px] w-11 h-11 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
                      asChild
                    >
                      <Link
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                      >
                        <Icon className="w-5 h-5" aria-hidden />
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </section>

            {/* Rankings */}
            <nav aria-labelledby="footer-rankings">
              <h3
                id="footer-rankings"
                className="text-foreground font-semibold"
              >
                Rankings
              </h3>
              <ul className="mt-4 space-y-2" role="list">
                {FOOTER_RANKING_LINKS.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 py-1 block min-h-[44px] min-w-[44px] flex items-center"
                    >
                      {item.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Ferramentas (Simuladores) */}
            <nav aria-labelledby="footer-ferramentas">
              <h3
                id="footer-ferramentas"
                className="text-foreground font-semibold"
              >
                Ferramentas
              </h3>
              <ul className="mt-4 space-y-2" role="list">
                {FOOTER_SIMULATOR_LINKS.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 py-1 block min-h-[44px] min-w-[44px] flex items-center"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contato */}
            <section aria-labelledby="footer-contato">
              <h3
                id="footer-contato"
                className="text-foreground font-semibold"
              >
                Contato
              </h3>
              <address
                className="mt-4 space-y-3 not-italic"
                aria-label="Informações de contato"
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" aria-hidden />
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-sm hover:text-primary transition-colors break-all"
                  >
                    {CONTACT.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" aria-hidden />
                  <a
                    href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {CONTACT.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="text-sm">{CONTACT.address}</span>
                </div>
              </address>
            </section>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Bottom bar */}
      <div className="py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1920px]">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              Copyright © {new Date().getFullYear()} {SITE.name}. Todos os
              direitos reservados.
            </p>
            <nav
              className="flex flex-wrap justify-center gap-4 md:gap-6"
              aria-label="Links legais"
            >
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center sm:justify-start"
              >
                Política de Privacidade
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center sm:justify-start"
              >
                Termos de Uso
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center sm:justify-start"
              >
                Sobre nós
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
