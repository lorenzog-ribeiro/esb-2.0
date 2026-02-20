import { getActiveAuthors } from "@/lib/api/wordpress";
import type { WordpressAuthor } from "@/types/wordpress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users } from "lucide-react";
import Link from "next/link";

function getAvatar(author: WordpressAuthor): string | null {
  const urls = author.avatar_urls ?? {};
  return (
    urls["96"] ||
    urls["48"] ||
    urls["24"] ||
    Object.values(urls)[0] ||
    null
  );
}

export default async function AutoresPage() {
  const raw = (await getActiveAuthors()) as WordpressAuthor[];
  const authors = (raw ?? [])
    .filter((a) => a?.name && String(a.name).trim().length > 0)
    .map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      description: a.description ?? "",
      link: a.link ?? "",
      avatar: getAvatar(a),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 max-w-screen-xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">Autores</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Conheça quem escreve no Educando Seu Bolso. Aqui estão todos os autores
          cadastrados e ativos hoje.
        </p>
      </header>

      {authors.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum autor encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Não foi possível listar autores no momento.
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {authors.map((author) => (
            <Card key={String(author.id)} className="h-full">
              <CardHeader className="space-y-3">
                <div className="flex items-start gap-3">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-12 h-12 rounded-full object-cover border shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted border shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h2 className="font-semibold text-foreground leading-tight truncate">
                      {author.name}
                    </h2>
                    {author.slug ? (
                      <p className="text-xs text-muted-foreground truncate">
                        @{author.slug}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {author.description
                    ? author.description
                    : "Autor no Educando Seu Bolso."}
                </p>
                {author.slug ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/autores/${author.slug}`}>Ver posts</Link>
                  </Button>
                ) : author.link ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={author.link} target="_blank" rel="noopener noreferrer">
                      Ver página do autor
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}

