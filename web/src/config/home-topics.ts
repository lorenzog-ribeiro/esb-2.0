/**
 * Tópicos exibidos na home. Cada tópico mostra 4 posts de uma categoria.
 * O categorySlug deve coincidir com o slug da categoria no WordPress.
 * Slugs alternativos permitem fallback caso o WP use nomenclatura diferente.
 */
export const HOME_TOPICS = [
    {
        title: "Domine suas finanças: organize seu dinheiro de vez",
        subtitle: "Dicas práticas para quem quer sair do vermelho e controlar o orçamento",
        categorySlugs: ["financas-pessoais", "organizacao-financeira", "financas", "economia"],
    },
    {
        title: "Investir não é bicho de 7 cabeças",
        subtitle: "Comece a fazer seu dinheiro trabalhar para você",
        categorySlugs: ["investimentos", "renda-fixa", "investir", "aplicacoes"],
    },
    {
        title: "Crédito inteligente: evite armadilhas",
        subtitle: "Empréstimos, cartões e como usar sem se endividar",
        categorySlugs: ["credito", "emprestimo", "cartao-de-credito", "cartoes"],
    },
    {
        title: "Contas, maquininhas e serviços financeiros",
        subtitle: "Escolha as melhores opções para o seu bolso",
        categorySlugs: ["contas-digitais", "maquininhas", "maquinas-cartao", "servicos-financeiros"],
    },
] as const;
