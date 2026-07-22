# HabitFlow — Design System

Biblioteca de componentes sincronizada com o projeto no **claude.ai/design** via `/design-sync`.

Cada arquivo `.html` é um *card* de preview autocontido (tema claro + escuro lado a lado)
e traz o marcador `<!-- @dsCard group="..." -->` na primeira linha.

## Estrutura
- `foundations/` — cores/tokens, tipografia (Inter), raio & elevação.
- `components/` — botões, cards, controles (toggle/abas/checkbox), progresso & sequência, linhas de lista.

Os tokens espelham os do app (`index.css`): `base`, `surface`, `elevated`, `line`,
`content`, `muted`, `faint`, `brand` — com valores próprios para claro e escuro.
