import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getPostsByAuthor } from "@/lib/api/wordpress";
import type { WordpressAuthor, WordpressPost } from "@/types/wordpress";
import PostCard from "@/components/Posts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, User } from "lucide-react";
import { Card } from "@/components/ui/card";

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

export default async function AutorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number.isNaN(parseInt(sp?.page ?? "", 10))
    ? 1
    : Math.max(1, parseInt(sp?.page ?? "1", 10));

  const author = (await getAuthorBySlug(slug)) as WordpressAuthor | null;
  if (!author) notFound();

  const authorId = Number(author.id);
  const avatar = getAvatar(author);
  const { posts, totalPages, totalPosts } = await getPostsByAuthor(authorId, 12, page);
  const typedPosts = (posts as WordpressPost[]) ?? [];

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 max-w-screen-xl space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/autores">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para autores
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          {totalPosts ? `${totalPosts} posts` : `${typedPosts.length} posts`}
        </div>
      </div>

      <header className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={author.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border shrink-0"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted border shrink-0 flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {author.name}
            </h1>
            {author.description ? (
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {author.description}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/blog?search=${encodeURIComponent(author.name)}`}>
                  Buscar no blog
                </Link>
              </Button>
              {author.link ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={author.link} target="_blank" rel="noopener noreferrer">
                    Página no WordPress
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {typedPosts.length === 0 ? (
        <Card className="p-6 text-muted-foreground">
          Nenhum post encontrado para este autor.
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {typedPosts.map((post, idx) => (
              <PostCard key={post.id} post={post} index={idx} />
            ))}
          </section>

          {totalPages > 1 ? (
            <nav className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={page <= 1}
              >
                <Link href={`/autores/${encodeURIComponent(slug)}?page=${page - 1}`}>
                  Anterior
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={page >= totalPages}
              >
                <Link href={`/autores/${encodeURIComponent(slug)}?page=${page + 1}`}>
                  Próxima
                </Link>
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </main>
  );
}

