"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import PostCard from "@/components/Posts";
import FiltersBlog from "@/components/Filters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getRandomAds } from "@/lib/ads";
import { AdCard } from "@/components/ads/AdCard";
import { WordpressPost } from "@/types/wordpress";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/utils/utils";

interface BlogContentProps {
    categories: Array<{ id: number | string; name: string; slug: string }>;
    initialPosts: WordpressPost[];
    totalPages: number;
    totalPosts: number;
    initialPage: number;
    searchQuery: string;
    initialCategory?: string;
}

export function BlogContent({
    categories,
    initialPosts,
    totalPages,
    totalPosts,
    initialPage,
    searchQuery,
    initialCategory,
}: BlogContentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isMountedRef = useRef(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://educandoseubolso.blog.br/wp-json/wp/v2";
    const [posts, setPosts] = useState<WordpressPost[]>(initialPosts);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pages, setPages] = useState(totalPages);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState(totalPosts);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");

    const ads = useMemo(() => getRandomAds(2), []);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        setPosts(initialPosts);
        setPages(totalPages);
        setCurrentPage(initialPage);
        setSelectedCategory(initialCategory);
        setCount(totalPosts);
        setSearchTerm(searchQuery);
        setDebouncedTerm(searchQuery);
    }, [initialPosts, totalPages, initialPage, initialCategory, totalPosts, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const updateUrl = useCallback(
        (category?: string | null, page = 1) => {
            // Só atualiza URL se ainda estivermos na listagem do blog.
            // Evita que router.replace cancele a navegação para um post (/blog/[slug]).
            if (pathname !== "/blog") return;
            const params = new URLSearchParams();
            if (searchQuery) params.set("search", searchQuery);
            if (category) params.set("category", category);
            if (page > 1) params.set("page", page.toString());
            const query = params.toString();
            router.replace(`/blog${query ? `?${query}` : ""}`, { scroll: false });
        },
        [router, searchQuery, pathname],
    );

    const fetchPosts = useCallback(
        async (category?: string | null, page = 1, term?: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const perPage = 10;
                const q = term ?? searchQuery ?? "";
                const searchParam = q ? `&search=${encodeURIComponent(q)}` : "";
                let categoryIdParam = "";
                if (category) {
                    const match = categories.find((c) => c.slug === category);
                    if (match?.id) {
                        categoryIdParam = `&categoryId=${encodeURIComponent(match.id)}`;
                    }
                }
                if (!API_URL) {
                    throw new Error("API indisponível");
                }
                const response = await fetch(
                    `${API_URL}/blog/posts?perPage=${perPage}&page=${page}${searchParam}${categoryIdParam}`,
                );
                if (!response.ok) throw new Error("Erro ao carregar posts");
                const data = await response.json();
                setPosts((data.posts as WordpressPost[]) ?? []);
                setPages(data.totalPages || 1);
                setCount(data.totalPosts ?? data.posts?.length ?? 0);
                setCurrentPage(page);
                setSelectedCategory(category || undefined);
                if (!term && isMountedRef.current && pathname === "/blog") updateUrl(category, page);
            } catch (err) {
                try {
                    const perPage = 9;
                    const q = term ?? searchQuery ?? "";
                    const searchParam = q ? `&search=${encodeURIComponent(q)}` : "";
                    let categoryParam = "";
                    if (category) {
                        const match = categories.find((c) => c.slug === category);
                        if (match?.id) {
                            categoryParam = `&categories=${encodeURIComponent(match.id)}`;
                        }
                    }
                    const res = await fetch(
                        `${WP_URL}/posts?_embed&per_page=${perPage}&page=${page}${searchParam}${categoryParam}`,
                    );
                    if (!res.ok) throw new Error("Erro ao carregar posts");
                    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
                    const totalPosts = parseInt(res.headers.get("X-WP-Total") || "0", 10);
                    const wpPosts = await res.json();
                    setPosts((wpPosts as WordpressPost[]) ?? []);
                    setPages(totalPages || 1);
                    setCount(totalPosts ?? wpPosts?.length ?? 0);
                    setCurrentPage(page);
                    setSelectedCategory(category || undefined);
                    if (!term && isMountedRef.current && pathname === "/blog") updateUrl(category, page);
                } catch (fallbackErr) {
                    const message = fallbackErr instanceof Error ? fallbackErr.message : "Erro ao carregar posts";
                    setError(message);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [searchQuery, updateUrl, categories, pathname],
    );

    const handleCategorySelect = (slug: string | null) => {
        setSearchTerm("");
        setDebouncedTerm("");
        setSelectedCategory(slug || undefined);
        fetchPosts(slug || null, 1);
    };

    useEffect(() => {
        if (debouncedTerm.length === 0) {
            fetchPosts(selectedCategory || null, 1);
            return;
        }

        const searchPosts = async () => {
            setIsLoading(true);
            try {
                const perPage = 9;
                const q = encodeURIComponent(debouncedTerm);
                if (!API_URL) throw new Error("API indisponível");
                const response = await fetch(`${API_URL}/blog/posts?perPage=${perPage}&page=1&search=${q}`);
                if (!response.ok) throw new Error("Erro ao buscar artigos");
                const data = await response.json();
                setPosts((data.posts as WordpressPost[]) ?? []);
                setCount(data.totalPosts ?? data.posts?.length ?? 0);
                setPages(data.totalPages || 1);
                setCurrentPage(1);
            } catch (err) {
                    try {
                    const perPage = 9;
                    const res = await fetch(
                        `${WP_URL}/posts?_embed&per_page=${perPage}&page=1&search=${encodeURIComponent(
                            debouncedTerm,
                        )}`,
                    );
                    if (!res.ok) throw new Error("Erro ao buscar artigos");
                    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
                    const totalPosts = parseInt(res.headers.get("X-WP-Total") || "0", 10);
                    const wpPosts = await res.json();
                    setPosts((wpPosts as WordpressPost[]) ?? []);
                    setCount(totalPosts ?? wpPosts?.length ?? 0);
                    setPages(totalPages || 1);
                    setCurrentPage(1);
                } catch (fallbackErr) {
                    const message = fallbackErr instanceof Error ? fallbackErr.message : "Erro ao buscar artigos";
                    setError(message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        searchPosts();
    }, [debouncedTerm]);

    const handlePageChange = (page: number) => {
        if (debouncedTerm.length > 0) return;
        fetchPosts(selectedCategory || null, page);
    };

    const showFiltersAndPagination = debouncedTerm.length === 0 && searchTerm.length === 0;

    const goToSearchPage = (term: string) => {
        const query = term.trim();
        if (!query) return;
        router.push(`/blog?q=${encodeURIComponent(query)}`);
    };

    const buildPageNumbers = () => {
        const items: number[] = [];
        const total = pages;
        const maxVisible = 5;
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(total, start + maxVisible - 1);
        for (let i = start; i <= end; i++) items.push(i);
        if (start > 1) items.unshift(1);
        if (end < total) items.push(total);
        return Array.from(new Set(items));
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col gap-3">
                        {showFiltersAndPagination && (
                            <FiltersBlog
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onSelect={handleCategorySelect}
                            />
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(9)].map((_, idx) => (
                                <Skeleton key={idx} className="h-[300px] w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, index) => (
                                <PostCard key={post.id} post={post} index={index} />
                            ))}
                            {posts.length === 0 && !isLoading && (
                                <div className="col-span-3">
                                    <Alert>
                                        <AlertDescription>
                                            Nenhum artigo encontrado para esta categoria no momento.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </div>
                    )}

                    {showFiltersAndPagination && pages > 1 && (
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="text-sm text-muted-foreground">
                                {count} artigos • Página {currentPage} de {pages}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full justify-center md:w-full md:justify-center">
                                <button
                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                    className={cn(
                                        "px-3 py-3 min-h-11 rounded-md border text-sm hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
                                        currentPage === 1 && "opacity-50 cursor-not-allowed",
                                    )}
                                >
                                    {"<"}
                                </button>
                                {buildPageNumbers().map((page, idx, arr) => {
                                    const prev = arr[idx - 1];
                                    const showDots = prev && page - prev > 1;
                                    return (
                                        <div key={page} className="flex items-center gap-2">
                                            {showDots && <span className="text-sm text-muted-foreground">...</span>}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={cn(
                                                    "px-3 py-3 min-h-11 rounded-md border text-sm hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
                                                    page === currentPage && "bg-accent text-accent-foreground border-accent hover:bg-accent hover:text-accent-foreground",
                                                )}
                                                aria-current={page === currentPage ? "page" : undefined}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={() => currentPage < pages && handlePageChange(currentPage + 1)}
                                    className={cn(
                                        "px-3 py-3 min-h-11 rounded-md border text-sm hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
                                        currentPage === pages && "opacity-50 cursor-not-allowed",
                                    )}
                                >
                                    {">"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
