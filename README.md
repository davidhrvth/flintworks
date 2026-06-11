# Flintworks

Monorepo for the Flintworks web platform: Next.js frontend, Express API, email templates, and the legacy Vite site.

## Packages

| Directory | Description |
|---|---|
| [`flintworks-next/`](flintworks-next/) | Production Next.js app (flintworks.hu) |
| [`flintworks-backend/`](flintworks-backend/) | Express API for contact form and email delivery |
| [`email-templates/`](email-templates/) | HTML email templates used by the backend |
| [`flintworks/`](flintworks/) | Legacy Vite + React site |

## Prerequisites

- Node.js 22+ (see [`.nvmrc`](.nvmrc))
- npm 10+

## Getting started

```bash
npm install
```

Copy environment files and fill in values:

```bash
cp flintworks-backend/.env.example flintworks-backend/.env
cp flintworks-next/.env.production.example flintworks-next/.env.production
```

Run the Next.js app and backend together:

```bash
npm run dev
```

Or run packages individually:

```bash
npm run dev:next      # http://localhost:3000
npm run dev:backend   # http://localhost:3001
npm run dev:vite      # legacy Vite dev server
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js and backend in parallel |
| `npm run build` | Build Next.js and backend for production |
| `npm run lint` | Lint Next.js and Vite packages |
| `npm run start:next` | Start built Next.js app |
| `npm run start:backend` | Start built backend |

## Docker

From the repo root:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project layout

```
.
├── flintworks-next/      # Next.js frontend
├── flintworks-backend/   # Express API
├── email-templates/      # Shared HTML email templates
├── flintworks/           # Legacy Vite frontend
├── package.json          # Workspace root
└── docker-compose.yml    # Local production stack
```
