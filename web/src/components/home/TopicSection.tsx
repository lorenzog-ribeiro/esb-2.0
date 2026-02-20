import PostCard from "@/components/Posts";
import { WordpressPost } from "@/types/wordpress";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopicSectionProps {
    title: string;
    subtitle: string;
    posts: WordpressPost[];
    categorySlug: string;
    categoryName: string;
}

export default function TopicSection({ title, subtitle, posts, categorySlug, categoryName }: TopicSectionProps) {
    if (!posts.length) return null;

    return (
        <section className="space-y-6 pt-8 first:pt-0 border-t first:border-t-0 border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                        {title}
                    </h2>
                    <p className="mt-1 text-base text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
                <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
                    <Link href={`/blog?category=${categorySlug}`}>
                        Ver todos em {categoryName}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {posts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                ))}
            </div>
        </section>
    );
}
