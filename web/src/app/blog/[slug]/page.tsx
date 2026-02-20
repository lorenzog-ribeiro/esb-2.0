import { getPostBySlug, getFeaturedImage, getAuthor, getPostCategories } from "@/lib/api/wordpress";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    stripHtmlTags,
    formatFullPostContent,
    calculateReadingTime,
    formatPostDate,
} from "@/utils/wordpress-formatter";

import { AdCard } from "@/components/ads/AdCard";
import { SidebarPromoCard } from "@/components/sidebar/SidebarPromoCard";
import { BriefcaseBusiness, Car } from "lucide-react";
import { getRandomAds, AdItem } from "@/lib/ads";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [post] = await Promise.all([getPostBySlug(slug)]);
    const ads = getRandomAds(4);
    const parseSize = (url: string) => {
        const m = url.match(/([0-9]{2,4})[^0-9]+([0-9]{2,4})/);
        if (!m) return null;
        return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
    };
    const isBanner = (ad: AdItem) => {
        const size = parseSize(ad.image_url);
        if (!size) return true;
        const ratio = size.w / Math.max(size.h, 1);
        return size.w >= 600 && size.h <= 140 && ratio >= 4;
    };
    const bannerAds = ads.filter(isBanner).slice(0, 3);
    const sideAds = ads.filter((a) => {
        const size = parseSize(a.image_url);
        return size ? size.h > 120 : false;
    }).slice(0, 2);

    if (!post) {
        notFound();
    }

    const featuredImage = getFeaturedImage(post);
    const author = getAuthor(post);
    const categories = getPostCategories(post) ?? [];

    const rawTitle = post.title?.rendered ?? "";
    const rawContent = post.content?.rendered ?? "";
    const rawDate = post.date ?? "";

    const formattedTitle = stripHtmlTags(rawTitle);
    const formattedContent = formatFullPostContent(rawContent);
    const readingTime = calculateReadingTime(rawContent);
    const formattedDate = formatPostDate(rawDate);

    const CATEGORY_COLOR_MAP: Record<string, string> = {
        "Planejamento Financeiro": "bg-blue-500",
        "Empréstimos e Financiamentos": "bg-blue-600",
        "Finanças Pessoais": "bg-gray-700",
        Aposentadoria: "bg-blue-400",
        "Carro por Assinatura": "bg-blue-500",
        "Ferramentas e Serviços": "bg-blue-600",
        DET: "bg-orange-500",
        Crédito: "bg-green-500",
        Saúde: "bg-purple-500",
        default: "bg-blue-600",
    };

    const getCategoryColor = (categoryName: string) => CATEGORY_COLOR_MAP[categoryName] ?? CATEGORY_COLOR_MAP.default;

    return (
        <div>
            <article className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Navigation */}
                <Link href="/blog" className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar ao Blog
                </Link>

                {/* Featured Image */}
                {featuredImage && (
                    <div className="relative mb-8 rounded-lg overflow-hidden">
                        <img
                            src={featuredImage.url}
                            alt={featuredImage.alt || formattedTitle}
                            className="w-full h-96 object-cover"
                        />
                    </div>
                )}

                {/* Article Header */}
                <header className="mb-8">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {formattedTitle}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                        {/* Author */}
                        {author && (
                            <div className="flex items-center gap-3">
                                {author.avatar ? (
                                    <img
                                        src={author.avatar}
                                        alt={author.name}
                                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                )}
                                <span className="font-medium text-gray-900">{author.name}</span>
                            </div>
                        )}

                        {/* Date and Reading Time */}
                        <div className="flex items-center gap-4 text-sm">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{readingTime}</span>
                        </div>
                    </div>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {categories.map((category) => (
                                <span
                                    key={category.id}
                                    className={`${getCategoryColor(
                                        category.name
                                    )} text-white px-3 py-1 rounded-full text-sm font-medium`}
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Article Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Coluna do conteúdo */}
                    <div className="lg:col-span-8">
                        <div className="formatted-content space-y-0 text-base">
                            {(() => {
                                const segments = formattedContent.split(/<\/p>/).filter(seg => seg.trim().length > 0);
                                const lastIndex = segments.length - 1;
                                const nodes: React.ReactNode[] = [];
                                const mainBanner = bannerAds[0];

                                // Insere o mesmo banner em múltiplos pontos (topo + ao longo do texto).
                                const bannerAfterIdx = new Set<number>();
                                if (mainBanner && segments.length > 0) {
                                    const len = segments.length;
                                    const candidates = [
                                        0,
                                        Math.floor(len / 3),
                                        Math.floor((2 * len) / 3),
                                        lastIndex,
                                    ].filter((i) => i >= 0 && i <= lastIndex);

                                    // Remove duplicados e evita colocar banner cedo demais em textos curtos
                                    const uniqueSorted = Array.from(new Set(candidates)).sort((a, b) => a - b);
                                    uniqueSorted.forEach((idx, pos) => {
                                        const prev = uniqueSorted[pos - 1];
                                        if (prev === undefined || idx - prev >= 2 || len >= 10) {
                                            bannerAfterIdx.add(idx);
                                        }
                                    });
                                }

                                segments.forEach((seg, idx) => {
                                    nodes.push(
                                        <div key={`seg-${idx}`} className="wp-content-block" dangerouslySetInnerHTML={{ __html: `${seg}</p>` }} />
                                    );
                                    if (mainBanner && bannerAfterIdx.has(idx)) {
                                        nodes.push(
                                            <div key={`ad-banner-${idx}`} className="my-6">
                                                <AdCard ad={mainBanner} />
                                            </div>
                                        );
                                    }
                                });
                                return nodes;
                            })()}
                        </div>
                    </div>

                    {/* Sidebar à direita */}
                    <aside className="lg:col-span-4 grid grid-cols-1 gap-4 grid-flow-dense lg:sticky lg:top-24 h-fit">
                        <SidebarPromoCard
                            title="Simulador de carro por assinatura"
                            description="Compare planos, custos e encontre a melhor opção para você."
                            href="/simuladores/comparador-assinatura"
                            icon={<Car className="w-5 h-5" />}
                            badge="Popular"
                        />
                        <SidebarPromoCard
                            title="Ranking de carro por assinatura"
                            description="Veja o ranking e descubra as melhores empresas do mercado."
                            href="/rankings/assinatura-carro"
                            icon={<Car className="w-5 h-5" />}
                            badge="Popular"
                        />
                        <SidebarPromoCard
                            title="Consultoria financeira"
                            description="Conheça nossa consultoria e dê o próximo passo com orientação profissional."
                            href="https://consultoria.educandoseubolso.blog.br/"
                            icon={<BriefcaseBusiness className="w-5 h-5" />}
                            badge="Novo"
                            external
                        />
                        {sideAds.map((ad) => (
                            <div key={ad.id} className="not-prose">
                                <AdCard ad={ad} />
                            </div>
                        ))}
                    </aside>
                </div>
            </article>
        </div>
    );
}
