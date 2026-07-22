# HabitFlow

Plataforma pessoal de acompanhamento de hábitos, saúde e exercícios — água, dieta,
exercício e peso/IMC — com análises visuais e histórico.

Feito com **React + TypeScript + Vite + Tailwind CSS**, persistência via **Supabase**
com fallback offline em `localStorage`.

## Recursos

- **Diário**: registro rápido do dia com autosave e resumo de progresso.
- **Análises**: gráficos de peso/IMC, calorias e dieta + calendário com anéis.
- **Histórico**: tabela pesquisável de todos os registros.
- **Tema claro/escuro** com toggle (respeita a preferência do sistema).

## Rodando localmente

**Pré-requisitos:** Node.js 18+

```bash
npm install
npm run dev
```

### Configuração do Supabase (opcional)

Sem configuração, o app funciona 100% offline via `localStorage`. Para sincronizar
na nuvem, crie um `.env.local`:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_KEY=sua-anon-key
```

> **Importante:** ative **Row Level Security** nas tabelas antes de qualquer deploy
> público. Veja `PROPOSTA.md` para o roadmap de autenticação e segurança.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Pré-visualiza o build |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |

## Estrutura

```
components/   widgets de UI (Water, Diet, Exercise, Weight, Analytics, History...)
hooks/        useTheme (tema claro/escuro)
services/     dataService (persistência), settings (perfil/metas), supabaseClient
index.css     tokens de design + diretivas Tailwind
```

Roadmap de recursos e arquitetura: veja **[PROPOSTA.md](./PROPOSTA.md)**.
