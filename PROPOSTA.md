# HabitFlow — Proposta de Evolução (Recursos & Arquitetura)

> Documento de proposta. A rodada atual já entregou um **redesign visual completo com
> dark mode** e algumas correções estruturais (detalhadas no fim). Aqui descrevo o
> caminho recomendado para os próximos passos, priorizado por impacto × esforço.

---

## 1. Diagnóstico da versão atual

O HabitFlow hoje é um **tracker pessoal de saúde single-user**, com métricas fixas
(água, dieta, exercício, peso/IMC), persistência em Supabase + fallback `localStorage`
e três telas (Diário, Análises, Histórico).

### Pontos fortes
- Fluxo de registro rápido, autosave com debounce.
- Análises visuais ricas (gráficos + calendário com anéis de progresso).
- Fallback offline via `localStorage` que evita perda de dados.

### Fragilidades encontradas
| # | Problema | Impacto |
|---|----------|---------|
| 1 | **Sem autenticação.** A tabela `daily_logs` é global e a `anon key` fica *hardcoded* no código. Qualquer pessoa com o link vê/edita os mesmos dados. | 🔴 Crítico (privacidade/segurança) |
| 2 | **Métricas fixas no código.** Não é possível criar hábitos próprios — apesar do nome "HabitFlow". | 🟠 Produto |
| 3 | **Dependência de CDNs em runtime** (Tailwind, fontes, importmap esm.sh). Quebra sem rede e trava a estilização. | 🟠 Robustez *(corrigido p/ Tailwind nesta rodada)* |
| 4 | **Valores mágicos duplicados** (altura `1.79m` do IMC em 2 lugares). | 🟡 Manutenção *(corrigido nesta rodada)* |
| 5 | **Sem timeout nas chamadas Supabase** → UI travava em "Carregando" para sempre se a rede falhasse. | 🟠 UX *(corrigido nesta rodada)* |
| 6 | **Sem testes** e sem CI. | 🟡 Qualidade |
| 7 | Bundle único de ~817 kB (Recharts não faz code-split). | 🟡 Performance |
| 8 | Divergência de versões React (18 no `package.json`, 19 no importmap). | 🟡 Manutenção |

---

## 2. Roadmap de recursos (priorizado)

### 🥇 Fase 1 — Fundamentos (maior impacto)
1. **Autenticação + dados por usuário (Supabase Auth).**
   - Login por e-mail/mágico ou OAuth (Google).
   - `daily_logs` passa a ter `user_id` + **Row Level Security (RLS)**.
   - Perfil do usuário (altura, metas, unidades) numa tabela `profiles` — substitui o `localStorage` de configurações.
2. **Hábitos customizáveis** (torna o app fiel ao nome). Ver seção de arquitetura de dados.
3. **Streaks & consistência** — "🔥 7 dias seguindo a dieta", badge de sequência no header e por hábito. Alto poder de retenção.

### 🥈 Fase 2 — Engajamento
4. **Lembretes / notificações** (Web Push ou e-mail via Supabase Edge Functions + cron).
5. **Metas semanais** além das diárias (ex.: "correr 3× na semana").
6. **PWA / offline-first** — `manifest.json` + service worker; instalável no celular, sincroniza quando volta a rede. Combina com o fallback `localStorage` já existente.
7. **Notas por dia** — o campo `notes` já existe no modelo mas não é editável na UI.

### 🥉 Fase 3 — Diferenciais
8. **Exportar dados** (CSV/JSON) e importar.
9. **Insights automáticos** ("você bebe menos água nos fins de semana").
10. **Integrações** (Apple Health / Google Fit / Strava) para importar peso e exercícios.
11. **i18n** — hoje o texto PT-BR está fixo; extrair para dicionário permite EN/ES.

---

## 3. Arquitetura proposta

### 3.1 Modelo de dados para hábitos genéricos
Para virar um tracker de hábitos de verdade sem perder os widgets de saúde,
proponho um modelo híbrido: **hábitos tipados**, onde os widgets atuais viram *presets*.

```sql
-- Definição de um hábito (o "o quê")
habits (
  id          uuid pk,
  user_id     uuid references auth.users,
  name        text,               -- "Água", "Ler", "Meditar"
  type        text,               -- 'boolean' | 'quantity' | 'scale' | 'duration'
  unit        text null,          -- 'ml', 'páginas', 'min'
  target      numeric null,       -- meta diária
  icon        text, color text,
  archived    boolean default false,
  created_at  timestamptz
)

-- Registro diário de um hábito (o "quando/quanto")
habit_entries (
  id        uuid pk,
  habit_id  uuid references habits,
  user_id   uuid references auth.users,
  date      date,
  value     numeric,              -- 1/0 p/ boolean, ml p/ quantity...
  note      text null,
  unique (habit_id, date)
)
```

- **Água** → hábito `quantity` (unit=ml, target=3000).
- **Corrida/Academia** → hábitos `boolean` (+ campo extra de calorias).
- **Refeições** → 6 hábitos `scale` (skipped/off/on) ou uma categoria dedicada.
- **Peso** → série numérica (pode virar um `measurement` à parte, pois não é "meta diária").

> Estratégia de migração: manter `daily_logs` durante a transição e uma rotina que
> "explode" cada coluna em `habit_entries`, com os presets criados no onboarding.

### 3.2 Camadas de código
Hoje `dataService.ts` mistura mapeamento snake↔camel, fallback e migração. Sugiro:

```
services/
  supabaseClient.ts     // cliente (env vars — ver segurança)
  repositories/
    habitsRepo.ts       // CRUD de habits
    entriesRepo.ts      // CRUD de habit_entries
  mappers.ts            // snake_case <-> camelCase num só lugar
hooks/
  useDailyLog.ts        // encapsula fetch/save/autosave (tirar do App.tsx)
  useHabits.ts
state/                  // React Query (TanStack) p/ cache, revalidação e otimista
```

- **TanStack Query** substitui o `refreshDataTrigger` manual, dá cache, *optimistic updates* e revalidação — remove muito estado imperativo do `App.tsx`.
- **Zod** para validar o que vem do banco/localStorage (a migração hoje é feita "na mão").

### 3.3 Segurança (prioridade)
- **Mover a `anon key` e a URL para variáveis de ambiente** (`.env.local`, já suportado pelo `getEnvVar`). Remover os fallbacks *hardcoded* de `supabaseClient.ts` antes de qualquer deploy público.
- **Ativar RLS** em todas as tabelas: cada usuário só lê/escreve as próprias linhas.
- A `anon key` é pública por design no Supabase, mas **sem RLS ela expõe tudo** — hoje é o caso.

### 3.4 Build & qualidade
- ✅ **Tailwind build-time** (feito nesta rodada) — sem CDN, CSS de ~24 kB, tema por *design tokens*.
- **Code-splitting**: `React.lazy` nas abas Análises/Histórico (Recharts só carrega quando abre Análises) → derruba o bundle inicial.
- **Alinhar React 18 vs 19**: escolher uma versão e remover o importmap divergente do `index.html`.
- **Testes**: Vitest + Testing Library para os cálculos (IMC, adesão, streak) e componentes-chave. `tsc --noEmit` já disponível via `npm run typecheck`.
- **CI** (GitHub Actions): `typecheck` + `build` + testes em cada PR.

---

## 4. Sugestão de ordem de execução

1. **Segurança + Auth + RLS** (Fase 1.1) — destrava tudo e é pré-requisito de multiusuário.
2. **React Query + hooks** (refactor 3.2) — reduz complexidade antes de crescer.
3. **Hábitos customizáveis** (Fase 1.2, modelo 3.1).
4. **Streaks** (Fase 1.3) e **PWA/lembretes** (Fase 2).
5. **Code-splitting + testes + CI** em paralelo, contínuo.

---

## 5. O que já foi entregue nesta rodada (redesign + correções)

**Design**
- Sistema de **design tokens** (CSS vars) com **dark mode** completo (toggle no header, persistido, respeita `prefers-color-scheme`, sem flash inicial).
- **Migração do Tailwind CDN → build-time** (PostCSS + Vite): app autocontido.
- Novo **"Resumo de Hoje"** com anel de progresso geral + detalhamento por área.
- Refino de todos os cards, header com blur, navegação e gráficos cientes do tema.
- Ações rápidas de água (+250/+500/+750), IMC com faixa nomeada, botão "próximo dia" desabilitado no futuro.

**Correções estruturais**
- Altura do IMC centralizada em `services/settings.ts` (era duplicada e fixa).
- **Timeout** nas chamadas Supabase (evita travar em "Carregando").
- Acesso seguro a `process` no `supabaseClient.ts` (quebrava em browser).
- Remoção de código morto (`SleepTracker.tsx` órfão) — destravou o `tsc`.
- Script `npm run typecheck`.
