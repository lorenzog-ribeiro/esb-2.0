import { WordpressPost } from "@/types/wordpress";

const USE_STRAPI = process.env.USE_STRAPI === "true";
const STRAPI_API_URL = process.env.STRAPI_API_URL || "http://localhost:1337/api";
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || "https://educandoseubolso.blog.br/wp-json/wp/v2";

/** Quando false, pula Strapi e usa WordPress direto (evita ECONNREFUSED se Strapi não estiver rodando) */
function shouldTryStrapi(): boolean {
    return USE_STRAPI && !!STRAPI_API_URL;
}

export interface GetPostsOptions {
    perPage?: number;
    page?: number;
    search?: string;
    categoryId?: number;
    categorySlug?: string;
}

export async function getPosts(options: GetPostsOptions = {}) {
    const { perPage = 10, page = 1, search, categoryId, categorySlug } = options;

    if (shouldTryStrapi()) {
    try {
        // Try Strapi first
        const params = new URLSearchParams();
        params.set("pagination[pageSize]", perPage.toString());
        params.set("pagination[page]", page.toString());
        params.set("populate", "*");
        params.set("sort[0]", "publishedAt:desc");

        if (search) {
            params.set("filters[title][$containsi]", search);
        }

        if (categoryId) {
            params.set("filters[categories][id][$eq]", categoryId.toString());
        } else if (categorySlug) {
            params.set("filters[categories][slug][$eq]", categorySlug);
        }

        const res = await fetch(`${STRAPI_API_URL}/posts?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (res.ok) {
            const data = await res.json();
            const strapiPosts = data.data || [];
            const pagination = data.meta?.pagination || { pageCount: 1, total: 0 };

            const posts = strapiPosts.map((post: any) => ({
                id: post.documentId || post.id,
                slug: post.slug,
                title: { rendered: post.title },
                excerpt: { rendered: post.excerpt || "" },
                content: { rendered: post.content || "" },
                date: post.publishedAt,
                _embedded: {
                    "wp:featuredmedia": post.cover_image ? [{
                        source_url: post.cover_image.url.startsWith('http') 
                            ? post.cover_image.url 
                            : `${process.env.STRAPI_URL || 'http://localhost:1337'}${post.cover_image.url}`
                    }] : []
                },
                categories: post.categories?.map((c: any) => c.id) || [],
            }));

            return { posts, totalPages: pagination.pageCount, totalPosts: pagination.total };
        }
    } catch (error) {
        console.error("Error fetching from Strapi, falling back to WordPress:", error);
    }
    }

    // Fallback to WordPress (ou uso direto quando USE_STRAPI=false)
    try {
        const wpSearch = search ? `&search=${encodeURIComponent(search)}` : "";
        const wpCategory = categoryId ? `&categories=${categoryId}` : "";
        const url = `${WORDPRESS_API_URL}/posts?_embed&per_page=${perPage}&page=${page}${wpSearch}${wpCategory}`;
        
        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);

        const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
        const totalPosts = parseInt(res.headers.get("X-WP-Total") || "0", 10);
        const posts = await res.json();

        return { posts, totalPages, totalPosts };
    } catch (error) {
        console.error("Error fetching from WordPress:", error);
        return { posts: [], totalPages: 1, totalPosts: 0 };
    }
}

export async function getPostBySlug(slug: string): Promise<WordpressPost | null> {
    if (shouldTryStrapi()) {
    try {
        // Try Strapi
        const params = new URLSearchParams();
        params.set("filters[slug][$eq]", slug);
        params.set("populate", "*");

        const res = await fetch(`${STRAPI_API_URL}/posts?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (res.ok) {
            const data = await res.json();
            if (data.data && data.data.length > 0) {
                const post = data.data[0];
                return {
                    id: post.documentId || post.id,
                    slug: post.slug,
                    title: { rendered: post.title },
                    excerpt: { rendered: post.excerpt || "" },
                    content: { rendered: post.content || "" },
                    date: post.publishedAt,
                    _embedded: {
                        "wp:featuredmedia": post.cover_image ? [{
                            source_url: post.cover_image.url.startsWith('http') 
                                ? post.cover_image.url 
                                : `${process.env.STRAPI_URL || 'http://localhost:1337'}${post.cover_image.url}`
                        }] : []
                    },
                    categories: post.categories?.map((c: any) => c.id) || [],
                } as any;
            }
        }
    } catch (error) {
        console.error("Error fetching post from Strapi:", error);
    }
    }

    // Fallback to WordPress
    try {
        const res = await fetch(`${WORDPRESS_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed=true`, {
            next: { revalidate: 60 },
        });
        if (res.ok) {
            const posts = await res.json();
            return posts[0] || null;
        }
    } catch (error) {
        console.error("Error fetching post from WordPress:", error);
    }

    return null;
}

export async function getCategories() {
    if (shouldTryStrapi()) {
    try {
        // Try Strapi first
        const res = await fetch(`${STRAPI_API_URL}/categories?pagination[pageSize]=100`, {
            next: { revalidate: 300 },
        });

        if (res.ok) {
            const data = await res.json();
            return data.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                count: 1, // Strapi doesn't easily provide count without custom logic
            }));
        }
    } catch (error) {
        console.error("Error fetching categories from Strapi:", error);
    }
    }

    // Fallback to WordPress
    try {
        const res = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100`, {
            next: { revalidate: 300 },
        });
        if (res.ok) {
            const categories = await res.json();
            const banned = new Set(["teste_ad", "sem categoria", "uncategorized"]);
            return categories.filter((c: any) => {
                const name = c.name.toLowerCase();
                return c.count > 0 && !banned.has(name);
            });
        }
    } catch (error) {
        console.error("Error fetching categories from WordPress:", error);
    }

    return [];
}

export async function getPageBySlug(slug: string): Promise<WordpressPost | null> {
    if (shouldTryStrapi()) {
    try {
        // Try Strapi
        const params = new URLSearchParams();
        params.set("filters[slug][$eq]", slug);
        params.set("populate", "*");

        const res = await fetch(`${STRAPI_API_URL}/pages?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (res.ok) {
            const data = await res.json();
            if (data.data && data.data.length > 0) {
                const post = data.data[0];
                return {
                    id: post.documentId || post.id,
                    slug: post.slug,
                    title: { rendered: post.title },
                    excerpt: { rendered: post.excerpt || "" },
                    content: { rendered: post.content || "" },
                    date: post.publishedAt,
                    _embedded: {
                        "wp:featuredmedia": post.cover_image ? [{
                            source_url: post.cover_image.url.startsWith('http') 
                                ? post.cover_image.url 
                                : `${process.env.STRAPI_URL || 'http://localhost:1337'}${post.cover_image.url}`
                        }] : []
                    },
                    categories: [],
                } as any;
            }
        }
    } catch (error) {
        console.error("Error fetching page from Strapi:", error);
    }
    }

    // Fallback to WordPress
    try {
        const res = await fetch(`${WORDPRESS_API_URL}/pages?slug=${encodeURIComponent(slug)}&_embed=true`, {
            next: { revalidate: 60 },
        });
        if (res.ok) {
            const pages = await res.json();
            return pages[0] || null;
        }
    } catch (error) {
        console.error("Error fetching page from WordPress:", error);
    }

    return null;
}
