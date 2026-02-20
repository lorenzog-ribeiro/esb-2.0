import * as blogService from "./blog-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function requireApiUrl() {
  if (!API_URL) {
    return null;
  }
  return API_URL;
}

export async function getAllPosts(
  maxPosts: number,
  search?: string,
  currentPage: number = 1,
  categoryId?: number,
) {
  // Use service directly on server to avoid ECONNREFUSED during build
  if (typeof window === "undefined") {
    return blogService.getPosts({
      perPage: maxPosts,
      page: currentPage,
      search,
      categoryId,
    });
  }

  const baseUrl = requireApiUrl();

  if (!maxPosts || maxPosts <= 0) {
    maxPosts = 9;
  }

  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const pageParam = `&page=${encodeURIComponent(currentPage)}`;
  const categoryParam =
    categoryId && categoryId > 0
      ? `&categoryId=${encodeURIComponent(categoryId)}`
      : "";

  try {
    if (baseUrl) {
      const res = await fetch(
        `${baseUrl}/blog/posts?perPage=${maxPosts}${searchParam}${pageParam}${categoryParam}`,
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        return res.json();
      }
      throw new Error(
        `Failed to fetch posts: ${res.status} ${res.statusText || ""}`.trim()
      );
    }
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  } catch (error) {
    try {
      const WP = process.env.WORDPRESS_API_URL || "https://educandoseubolso.blog.br/wp-json/wp/v2";
      const wpSearch = search ? `&search=${encodeURIComponent(search)}` : "";
      const wpCategory = categoryId && categoryId > 0 ? `&categories=${encodeURIComponent(categoryId)}` : "";
      const res = await fetch(
        `${WP}/posts?_embed&per_page=${maxPosts}&page=${currentPage}${wpSearch}${wpCategory}`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) {
        throw new Error(
          `Failed to fetch posts via WP: ${res.status} ${res.statusText || ""}`.trim()
        );
      }
      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
      const totalPosts = parseInt(res.headers.get("X-WP-Total") || "0", 10);
      const posts = await res.json();
      return { posts, totalPages, totalPosts };
    } catch (routeError) {
      console.error(`getAllPosts: ${(routeError as Error).message}`);
      return { posts: [], totalPages: 1, totalPosts: 0 };
    }
  }
}

export async function getPostBySlug(slug: string) {
  if (typeof window === "undefined") {
    return blogService.getPostBySlug(slug);
  }
  const baseUrl = requireApiUrl();
  try {
    if (baseUrl) {
      const res = await fetch(`${baseUrl}/blog/posts/${slug}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        return res.json();
      }
    }
    throw new Error("Backend unavailable");
  } catch {
    try {
      const WP = process.env.WORDPRESS_API_URL || "https://educandoseubolso.blog.br/wp-json/wp/v2";
      const res = await fetch(`${WP}/posts?slug=${encodeURIComponent(slug)}&_embed=true`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      const arr = await res.json();
      const post = Array.isArray(arr) ? arr[0] : null;
      return post || null;
    } catch {
      return null;
    }
  }
}

export async function getPageBySlug(slug: string) {
  if (typeof window === "undefined") {
    return blogService.getPageBySlug(slug);
  }
  const baseUrl = requireApiUrl();
  try {
    const res = await fetch(`${baseUrl}/blog/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch page");
    }
    return res.json();
  } catch (error) {
    console.error(`getPageBySlug: ${(error as Error).message}`);
    return blogService.getPageBySlug(slug);
  }
}

export async function getCategories() {
  if (typeof window === "undefined") {
    return blogService.getCategories();
  }
  const baseUrl = requireApiUrl();
  try {
    if (baseUrl) {
      const res = await fetch(`${baseUrl}/blog/categories`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        throw new Error(
          `Failed to fetch categories: ${res.status} ${res.statusText || ""}`.trim()
        );
      }
      return res.json();
    }
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  } catch (error) {
    try {
      const WP = process.env.WORDPRESS_API_URL || "https://educandoseubolso.blog.br/wp-json/wp/v2";
      const res = await fetch(`${WP}/categories?per_page=100`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) {
        throw new Error(
          `Failed to fetch categories via WP: ${res.status} ${res.statusText || ""}`.trim()
        );
      }
      return res.json();
    } catch (routeError) {
      console.error(`getCategories: ${(routeError as Error).message}`);
      return [];
    }
  }
}

export async function getPostsByCategory(categoryId: number) {
  if (typeof window === "undefined") {
    return blogService.getPosts({ categoryId });
  }
  const baseUrl = requireApiUrl();
  try {
    const res = await fetch(`${baseUrl}/blog/posts?categoryId=${categoryId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }
    return res.json();
  } catch (error) {
    console.error(`getPostsByCategory: ${(error as Error).message}`);
    return blogService.getPosts({ categoryId });
  }
}

export async function getAuthors() {
  if (typeof window === "undefined") {
    return blogService.getAuthors();
  }
  const baseUrl = requireApiUrl();
  try {
    if (baseUrl) {
      const res = await fetch(`${baseUrl}/blog/authors`, {
        next: { revalidate: 300 },
      });
      if (res.ok) return res.json();
      throw new Error(`Failed to fetch authors: ${res.status}`);
    }
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  } catch (error) {
    try {
      const WP =
        process.env.WORDPRESS_API_URL ||
        "https://educandoseubolso.blog.br/wp-json/wp/v2";
      const res = await fetch(`${WP}/users?per_page=100&context=embed`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) throw new Error(`WP users fetch failed: ${res.status}`);
      const authors = await res.json();
      return Array.isArray(authors) ? authors : [];
    } catch (routeError) {
      console.error(`getAuthors: ${(routeError as Error).message}`);
      return [];
    }
  }
}

export async function getActiveAuthors() {
  if (typeof window === "undefined") {
    return blogService.getActiveAuthors();
  }
  // No client: melhor manter consistente com server (usa posts como fonte)
  try {
    const WP =
      process.env.WORDPRESS_API_URL ||
      "https://educandoseubolso.blog.br/wp-json/wp/v2";
    const authorsById = new Map<string, any>();
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(`${WP}/posts?_embed&per_page=100&page=${page}`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) break;
      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) break;
      for (const post of posts) {
        const a = post?._embedded?.author?.[0];
        if (!a) continue;
        const id = String(a.id ?? a.slug ?? a.name ?? "");
        if (!id) continue;
        if (!authorsById.has(id)) authorsById.set(id, a);
      }
    }
    return Array.from(authorsById.values());
  } catch (error) {
    console.error(`getActiveAuthors: ${(error as Error).message}`);
    return [];
  }
}

export async function getAuthorBySlug(slug: string) {
  if (typeof window === "undefined") {
    return blogService.getAuthorBySlug(slug);
  }
  try {
    const WP =
      process.env.WORDPRESS_API_URL ||
      "https://educandoseubolso.blog.br/wp-json/wp/v2";
    const res = await fetch(
      `${WP}/users?per_page=100&context=embed&slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const arr = await res.json();
    return Array.isArray(arr) ? arr[0] ?? null : null;
  } catch {
    return null;
  }
}

export async function getPostsByAuthor(authorId: number, perPage = 12, page = 1) {
  if (typeof window === "undefined") {
    return blogService.getPostsByAuthor({ authorId, perPage, page });
  }
  try {
    const WP =
      process.env.WORDPRESS_API_URL ||
      "https://educandoseubolso.blog.br/wp-json/wp/v2";
    const res = await fetch(
      `${WP}/posts?_embed&per_page=${perPage}&page=${page}&author=${encodeURIComponent(authorId)}`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return { posts: [], totalPages: 1, totalPosts: 0 };
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
    const totalPosts = parseInt(res.headers.get("X-WP-Total") || "0", 10);
    const posts = await res.json();
    return { posts: Array.isArray(posts) ? posts : [], totalPages, totalPosts };
  } catch {
    return { posts: [], totalPages: 1, totalPosts: 0 };
  }
}

export function getPostCategories(post: any) {
  const categories = post._embedded?.["wp:term"]?.[0];
  if (!categories || !Array.isArray(categories)) return [];

  return categories.map((category: any) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    count: category.count,
    link: category.link,
  }));
}

export async function getMedia() {
  const baseUrl = requireApiUrl();
  try {
    const res = await fetch(`${baseUrl}/blog/media`);
    if (!res.ok) {
      throw new Error("Failed to fetch media");
    }
    return res.json();
  } catch (error) {
    console.error(`getMedia: ${(error as Error).message}`);
    return [];
  }
}

export function getFeaturedImage(post: any) {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!featuredMedia) return null;

  return {
    url: featuredMedia.source_url,
    alt: featuredMedia.alt_text || post.title.rendered,
    width: featuredMedia.media_details?.width,
    height: featuredMedia.media_details?.height,
  };
}

export function getAuthor(post: any) {
  const author = post._embedded?.author?.[0];
  if (!author) return null;

  return {
    name: author.name,
    avatar: author.avatar_urls?.["96"],
    description: author.description,
  };
}
