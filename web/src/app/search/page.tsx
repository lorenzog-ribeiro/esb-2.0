import Link from "next/link";
import { getFeaturedImage } from "@/lib/api/wordpress";
import { formatExcerptHtml } from "@/utils/wordpress-formatter";

async function searchPosts(query: string) {
    const res = await fetch(`${process.env.WORDPRESS_API_URL}/posts?search=${encodeURIComponent(query)}&_embed`);
    if (!res.ok) throw new Error("Search failed");
    return res.json();
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
    const query = searchParams.q || "";
    const results = query ? await searchPosts(query) : [];

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Search Results</h1>

            <form action="/search" method="get" className="mb-8">
                <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Search posts..."
                    className="w-full max-w-md px-4 py-2 border rounded"
                />
                <button type="submit" className="ml-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Search
                </button>
            </form>

            {query && (
                <p className="text-gray-600 mb-4">
                    Found {results.length} results for "{query}"
                </p>
            )}

            <div className="space-y-6">
                {results.map((post: any) => {
                    const featuredImage = getFeaturedImage(post);

                    return (
                        <article key={post.id} className="border-b pb-6">
                            <h2 className="text-2xl font-semibold mb-2">
                                <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                                    <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                </Link>
                            </h2>
                            <div
                                className="formatted-content formatted-excerpt text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: formatExcerptHtml(post.excerpt?.rendered ?? '') }}
                            />
                        </article>
                    );
                })}
            </div>
        </main>
    );
}
