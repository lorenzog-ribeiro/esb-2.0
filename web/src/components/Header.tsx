"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { SiteBrand } from "@/components/atoms/SiteBrand";
import { NavLink } from "@/components/molecules/NavLink";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/config/site";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen((prev) => !prev);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    const prefix = item.activePrefix ?? item.href;
    return pathname === item.href || (prefix !== "/" && pathname?.startsWith(prefix));
  };

  return (
    <header
      role="banner"
      className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1920px]">
        <div className="flex items-center justify-between min-h-16">
          <SiteBrand />

          {/* Desktop: Search + Nav (prioridade: Simuladores, Rankings, Blog, Autores) */}
          <nav
            aria-label="Navegação principal"
            className="hidden lg:flex items-center gap-6 xl:gap-8"
          >
            <SearchBar variant="inline" />
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item)}
                  variant="desktop"
                />
              ))}
            </div>
          </nav>

          {/* Mobile: Search + Menu buttons (touch targets 44x44) */}
          <div className="flex items-center gap-1 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSearch}
              className="min-w-[44px] min-h-[44px] w-11 h-11 focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              aria-label={isMobileSearchOpen ? "Fechar busca" : "Abrir busca"}
              aria-expanded={isMobileSearchOpen}
            >
              <Search className="w-5 h-5" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="min-w-[44px] min-h-[44px] w-11 h-11 focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden />
              ) : (
                <Menu className="w-5 h-5" aria-hidden />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search drawer */}
        {isMobileSearchOpen && (
          <div
            className="lg:hidden border-t border-border/50 py-4"
            role="search"
            aria-label="Busca mobile"
          >
            <SearchBar
              variant="full"
              onSearch={closeMobileMenu}
              className="w-full"
            />
          </div>
        )}

        {/* Mobile Menu drawer */}
        {isMobileMenuOpen && (
          <nav
            className="lg:hidden border-t border-border/50 py-4"
            aria-label="Menu mobile"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    isActive={isActive(item)}
                    variant="mobile"
                    onClick={closeMobileMenu}
                  />
                </li>
              ))}
              <li className="pt-4 mt-4 border-t border-border/20">
                <p className="text-sm text-muted-foreground px-4">
                  Educação financeira moderna
                </p>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
