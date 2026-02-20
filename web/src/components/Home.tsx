import Hero from "./Hero";
import Tools from "./Tools";
import { getAllPosts, getCategories } from "@/lib/api/wordpress";
import { WordpressPost } from "@/types/wordpress";
import LatestArticles from "./LatestArticles";
import TopicSection from "./home/TopicSection";
import { HOME_TOPICS } from "@/config/home-topics";

function findCategoryBySlugs(
    categories: Array<{ id: number; name: string; slug: string }>,
    slugs: readonly string[]
) {
    const slugSet = new Set(slugs.map((s) => s.toLowerCase()));
    return categories.find((c) => slugSet.has((c.slug || "").toLowerCase())) ?? null;
}

export default async function Home() {
    const [categoriesRes, { posts: latestPosts }] = await Promise.all([
        getCategories(),
        getAllPosts(4),
    ]);
    const categories = (categoriesRes ?? []).map((c: { id: number; name: string; slug: string }) => ({
        id: Number(c.id),
        name: c.name,
        slug: c.slug || "",
    }));

    const topicData = HOME_TOPICS.map((topic) => {
        const category = findCategoryBySlugs(categories, topic.categorySlugs);
        return category ? { topic, category } : null;
    }).filter(Boolean) as Array<{
        topic: (typeof HOME_TOPICS)[number];
        category: { id: number; name: string; slug: string };
    }>;

    const postsByTopic = await Promise.all(
        topicData.map(({ category }) => getAllPosts(4, undefined, 1, category.id))
    );

    const topicSections = topicData
        .map(({ topic, category }, i) => {
            const posts = (postsByTopic[i]?.posts as WordpressPost[]) ?? [];
            return posts.length > 0 ? { topic, category, posts } : null;
        })
        .filter(Boolean) as Array<{
            topic: (typeof HOME_TOPICS)[number];
            category: { id: number; name: string; slug: string };
            posts: WordpressPost[];
        }>;

    const latest = (latestPosts as WordpressPost[]) ?? [];

    return (
        <div className="min-h-screen bg-background overflow-x-safe" id="blog">
            <Hero showLatest={false} />
            <Tools />
            <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-16 max-w-[1920px]">
                <LatestArticles posts={latest} />
                {topicSections.map(({ topic, category, posts }) => (
                    <TopicSection
                        key={category.slug}
                        title={topic.title}
                        subtitle={topic.subtitle}
                        posts={posts}
                        categorySlug={category.slug}
                        categoryName={category.name}
                    />
                ))}
            </main>
        </div>
    );
}
