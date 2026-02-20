"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

/** Props for SearchBar component */
export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Variant: inline (header) or full-width (mobile drawer) */
  variant?: "inline" | "full";
  /** Callback when search is submitted (e.g. close mobile drawer) */
  onSearch?: () => void;
  /** Additional class names */
  className?: string;
}

export function SearchBar({
  placeholder = "Buscar...",
  variant = "inline",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    router.push(`/blog?search=${encodeURIComponent(query)}`);
    onSearch?.();
  }, [query, router, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const inputClasses =
    variant === "full"
      ? "flex-1 bg-muted rounded-lg px-4 py-3 text-base text-foreground placeholder-muted-foreground border-none outline-none min-h-[44px]"
      : "bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground w-48";

  const containerClasses =
    variant === "full"
      ? "flex items-center gap-2"
      : "flex items-center space-x-2 bg-muted rounded-lg px-3 py-2";

  return (
    <div className={`${containerClasses} ${className}`}>
      <input
        type="search"
        role="searchbox"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className={inputClasses}
        aria-label="Buscar artigos no blog"
      />
      <Button
        onClick={handleSearch}
        variant="default"
        size={variant === "full" ? "default" : "sm"}
        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[44px] min-h-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-auto focus-visible:ring-2 focus-visible:ring-primary shrink-0"
        aria-label="Executar busca"
      >
        <Search className="w-4 h-4 sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
}
