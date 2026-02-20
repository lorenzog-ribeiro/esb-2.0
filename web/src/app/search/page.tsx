import Link from "next/link";
import { formatExcerptHtml } from "@/utils/wordpress-formatter";
import type { WordpressPost } from "@/types/wordpress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

async function searchPosts(query: string): Promise<WordpressPost[]> {
  const res = await fetch(
    `${process.env.WORDPRESS_API_URL}/posts?search=${encodeURIComponent(query)}&_embed`
  );
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query = "" } = await searchParams;
  const results = query.trim() ? await searchPosts(query) : [];

  return (
    <main
      className="container mx-auto max-w-4xl"
      role="main"
      aria-label="Resultados da busca"
    >
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Resultados da busca
        </h1>

        <form
          action="/search"
          method="get"
          role="search"
          className="flex flex-col sm:flex-row gap-3 mt-4"
          aria-label="Buscar artigos"
        >
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar artigos..."
            className="flex-1 min-h-[44px] text-base"
            aria-label="Termo de busca"
          />
          <Button
            type="submit"
            className="min-h-[44px] min-w-[44px] px-6"
            aria-label="Executar busca"
          >
            <Search className="w-4 h-4 sm:mr-2" aria-hidden />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </form>

        {query && (
          <p className="text-muted-foreground mt-4" aria-live="polite">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para
            &quot;{query}&quot;
          </p>
        )}
      </header>

      <section aria-label="Lista de resultados">
        {results.length === 0 && query ? (
          <p className="text-muted-foreground py-8">
            Nenhum resultado encontrado. Tente outros termos.
          </p>
        ) : (
          <div className="space-y-6">
            {results.map((post) => (
              <article
                key={String(post.id)}
                className="border-b border-border pb-6 last:border-0"
              >
                <h2 className="text-xl font-semibold mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: post.title?.rendered ?? "",
                      }}
                    />
                  </Link>
                </h2>
                <div
                  className="formatted-content formatted-excerpt text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: formatExcerptHtml(
                      post.excerpt?.rendered ?? ""
                    ),
                  }}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
