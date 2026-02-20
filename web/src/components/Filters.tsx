"use client";

interface FiltersBlogProps {
    categories: Array<{ id: number | string; name: string; slug: string }>;
    selectedCategory?: string;
    onSelect: (slug: string | null) => void;
}

export default function FiltersBlog({ categories, selectedCategory, onSelect }: FiltersBlogProps) {
    const topCategories = categories.slice(0, 8);
    const activeCategoryName =
        selectedCategory ? categories.find((c) => c.slug === selectedCategory)?.name : "Todas";

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Filtros</span>
                    <span className="text-xs text-muted-foreground">Escolha por tema</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-foreground">
                        {activeCategoryName}
                    </span>
                    {selectedCategory && (
                        <button
                            onClick={() => onSelect(null)}
                            className="text-xs px-2 py-1 rounded-md border hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                        const modal = document.getElementById("filters-modal");
                        if (modal) modal.classList.remove("hidden");
                    }}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
                >
                    Filtrar
                </button>
            </div>

            <div
                id="filters-modal"
                className="hidden fixed inset-0 z-50"
                aria-modal="true"
                role="dialog"
            >
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => {
                        const modal = document.getElementById("filters-modal");
                        if (modal) modal.classList.add("hidden");
                    }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Filtrar por</span>
                        <button
                            onClick={() => {
                                const modal = document.getElementById("filters-modal");
                                if (modal) modal.classList.add("hidden");
                            }}
                            className="text-sm px-3 py-1 rounded-md border hover:bg-muted"
                        >
                            Fechar
                        </button>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium">Categorias</span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    onSelect(null);
                                    const modal = document.getElementById("filters-modal");
                                    if (modal) modal.classList.add("hidden");
                                }}
                                className={`px-3 py-2 rounded-full text-sm ${
                                    !selectedCategory
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-muted text-foreground hover:bg-accent/10"
                                }`}
                            >
                                Todas
                            </button>
                            {topCategories.map((category) => {
                                const isActive = selectedCategory === category.slug;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            onSelect(category.slug);
                                            const modal = document.getElementById("filters-modal");
                                            if (modal) modal.classList.add("hidden");
                                        }}
                                        className={`px-3 py-2 rounded-full text-sm ${
                                            isActive
                                                ? "bg-accent text-accent-foreground"
                                                : "bg-muted text-foreground hover:bg-accent/10"
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>
                        {categories.length > topCategories.length && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-primary">Ver mais</summary>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {categories.slice(topCategories.length).map((category) => {
                                        const isActive = selectedCategory === category.slug;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    onSelect(category.slug);
                                                    const modal = document.getElementById("filters-modal");
                                                    if (modal) modal.classList.add("hidden");
                                                }}
                                                className={`px-3 py-2 rounded-full text-sm ${
                                                    isActive
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-foreground hover:bg-primary/10"
                                                }`}
                                            >
                                                {category.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
