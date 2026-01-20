# RepoLens 🚀

**Understand any GitHub repo in seconds.**

RepoLens scans a GitHub repository and generates a clean onboarding report:
**what it is, how to run it, where things live, and what’s missing.**

> Stop wasting 45 minutes doing repo archaeology.  
> Paste a repo link → get clarity → ship faster.

---

## ✅ What RepoLens Solves (The Pain)

You open a new repo and instantly get hit with:

- “Where is the entry point?”
- “How do I run this locally?”
- “What stack is this even using?”
- “Where are env variables?”
- “Is Docker supported?”
- “Does this repo even have tests?”

RepoLens answers all of that in **one scan**.

---

## ✨ What You Get (Output)

RepoLens returns a structured report like:

- **Framework:** Next.js / React / Express / NestJS / etc.
- **Tech Stack:** Prisma, Tailwind, TypeScript, Zod, JWT, Firebase, Supabase, etc.
- **Run Steps:** auto-generated from scripts
- **Repo Doctor:** warnings for missing `.env.example`, Docker, tests, README quality…
- **Repo Score:** quick quality score out of 100
- **Markdown Report:** copy-paste into README / Notion / docs

---

## 🧠 Features

✅ **Framework + Stack Detection**  
Detects frameworks + tools from `package.json` deps + conventions.

✅ **Monorepo Support**  
Works even when `package.json` is **not in root**.

✅ **Repo Doctor (Health & Risk Warnings)**  
Flags common repo footguns:

- `.env.example`
- `Dockerfile`
- `docker-compose.yml`
- tests folder/config
- LICENSE
- weak README

✅ **Default Branch Support**  
Supports `main`, `master`, and default branch patterns.

✅ **Copy-ready Markdown Output**  
Instant onboarding doc. Copy it and ship.

✅ **Works for Public + Private Repos**  
Private repos require a GitHub token for API access.

---

## 🏗️ How RepoLens Works (Simple)

RepoLens uses the GitHub REST API to:

1. Fetch repo metadata (default branch)
2. Fetch repo tree (files + folders)
3. Find the correct `package.json` (even in monorepos)
4. Detect stack/framework from dependencies + conventions
5. Generate run steps from scripts
6. Run repo health checks (Repo Doctor)
7. Generate a markdown report + JSON report

---

## 📦 Monorepo Structure

```bash
RepoLens/
├── backend/     # Express API (repo analysis engine)
└── frontend/    # Vite + React + Tailwind + shadcn/ui
```
