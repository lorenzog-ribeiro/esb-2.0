import PostCard from "@/components/Posts";
import { WordpressPost } from "@/types/wordpress";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LatestArticlesProps {
  posts: WordpressPost[];
}

export default function LatestArticles({ posts }: LatestArticlesProps) {
  const safePosts = posts ?? [];

  if (safePosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Veja os artigos mais recentes
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Conteúdo especializado para você ficar por dentro das tendências do mercado financeiro
          </p>
        </div>
        <Button className="w-fit shrink-0" asChild>
          <Link href="/blog">
            Ver todos os artigos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-flow-dense">
        {safePosts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
