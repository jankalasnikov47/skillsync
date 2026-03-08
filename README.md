# skillsync

Automatically sync your IDE environment based on your project's `package.json`.

When you add a package, **skillsync** installs the matching Cursor rules, agent skills, and keeps your `AGENTS.md` up to date — so your AI coding setup never goes stale.

```
bun i
# skillsync runs via prepare hook

✓ Skills installed:
  → next-best-practices
  → supabase-postgres-best-practices
✓ Rules installed:
  → .cursor/rules/next.mdc
  → .cursor/rules/typescript.mdc
✓ AGENTS.md updated

⚠ prisma — no community skill found
  Run: npx skillsync create prisma

💡 Recommended: eslint (eslint/eslint)
   Pluggable linting utility for JavaScript and TypeScript
```

## Install

```bash
npm install -D skillsync
```

Add the prepare hook to your `package.json`:

```json
{
  "scripts": {
    "prepare": "skillsync sync"
  }
}
```

Now every `bun i` / `npm i` / `pnpm i` automatically syncs your Cursor environment.

## Commands

### `skillsync sync`

The core command. Reads your `package.json`, installs matching skills and rules, and updates `AGENTS.md`.

```bash
npx skillsync sync
```

What it does:

1. Reads `dependencies` + `devDependencies` from `package.json`
2. Installs matching agent skills from [skills.sh](https://skills.sh)
3. Fetches matching Cursor rules from [cursor.directory](https://cursor.directory)
4. Diffs against what's already installed — never reinstalls existing assets
5. Generates/updates `AGENTS.md`
6. Suggests curated tools (opt-in only, never auto-installed)
7. Flags packages with no community skill

Automatically skips in CI environments (`CI=true`).

### `skillsync create [package]`

Generates a project-specific `SKILL.md` using Claude API. For packages where no community skill exists, this scans your actual codebase and creates a skill tailored to your setup.

```bash
npx skillsync create prisma
```

Requires `ANTHROPIC_API_KEY` in your environment. Never runs automatically — always manual opt-in.

### `skillsync status`

Shows what's currently installed without making changes.

```bash
npx skillsync status
```

## What gets created

```
your-project/
├── .cursor/rules/          ← always loaded into every Cursor session
│   ├── next.mdc
│   ├── typescript.mdc
│   └── prisma.mdc
├── skills/                 ← loaded on demand by Cursor agent
│   ├── next-best-practices/SKILL.md
│   └── prisma/SKILL.md
├── AGENTS.md               ← auto-maintained index for agents
└── package.json
```

| Directory | What it is | When it loads |
|-----------|-----------|---------------|
| `.cursor/rules/*.mdc` | Coding conventions | Every Cursor session |
| `skills/*/SKILL.md` | Deep library expertise | On demand, when relevant |
| `AGENTS.md` | Index of all skills | Always loaded upfront |

## Supported packages

Skills and rules are mapped from a curated `mapping.json`. Current mappings:

| Package | Skill | Rule | Recommendation |
|---------|-------|------|----------------|
| `next` | next-best-practices | next.mdc | — |
| `react` | — | react.mdc | — |
| `typescript` | — | typescript.mdc | — |
| `@supabase/supabase-js` | supabase-postgres-best-practices | — | — |
| `better-auth` | better-auth-best-practices | — | — |
| `expo` | building-native-ui | expo.mdc | — |
| `remotion` | remotion-best-practices | — | — |
| `prisma` | — | prisma.mdc | — |
| `drizzle-orm` | — | — | — |

Packages not in the mapping are silently skipped during sync. Use `skillsync create <package>` to generate a custom skill for anything missing.

## Data sources

| Source | What it provides |
|--------|-----------------|
| [skills.sh](https://skills.sh) | Community agent skills (Vercel, Supabase, Expo, etc.) |
| [cursor.directory](https://cursor.directory) | Coding convention rules as `.mdc` files |
| Claude API | Custom skills generated from your codebase |

## Design principles

- **Good defaults for vibe coders, full control for senior devs.** Works out of the box for beginners. Experienced devs can edit any generated file.
- **Never auto-install paid features.** `skillsync create` requires manual invocation and an API key.
- **Quality over quantity.** The mapping is intentionally small and opinionated — every entry is vetted.
- **Recommendations, not mandates.** Curated tools are suggested, never auto-installed.
- **Idempotent.** Running sync twice produces the same result. Already-installed assets are skipped.

## License

MIT
