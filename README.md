# Chamber Events Newsletter

Chamber Events Newsletter is a production-ready micro-SaaS for turning public Chamber of Commerce event calendars into polished, government-style newsletter previews and downloadable PDFs.

The application uses deterministic scraping only. There is no AI or LLM extraction anywhere in the scraping pipeline.

## What It Does

- Lists seeded chambers from a registry.
- Scrapes the selected chamber’s stored `events_url`.
- Detects the chamber platform with deterministic adapter rules.
- Normalizes events into a single internal model.
- Auto-extracts chamber branding from the site or chamber record.
- Lets the user optionally upload an in-session graphic override.
- Renders a shared HTML preview and PDF from the same view model.
- Caches scrape results for 6 hours and records newsletter runs.

## Stack

- Next.js 16 App Router
- TypeScript strict mode
- Tailwind CSS 4
- pnpm
- Supabase JS client
- Zod
- Cheerio
- date-fns and date-fns-tz
- @react-pdf/renderer
- Vitest + React Testing Library
- Playwright
- GitHub Actions

## Local Setup

1. Use Node 22.

```bash
nvm use
```

2. Install dependencies.

```bash
pnpm install
```

3. Copy environment values.

```bash
cp .env.example .env.local
```

4. Start the app.

```bash
pnpm dev
```

By default, the app can run with the built-in in-memory chamber registry and fixture-mode scraping for tests. When Supabase env vars are present, the repository switches to the real Supabase-backed registry, scrape cache, and run metadata tables.

## Supabase Setup

This repo ships plain SQL migrations in [`supabase/migrations/001_initial_schema.sql`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/supabase/migrations/001_initial_schema.sql).

Recommended local flow:

1. Install the Supabase CLI.
2. Start local services from the repo root.

```bash
supabase start
```

3. Reset and apply migrations.

```bash
supabase db reset
```

4. Set these env vars in `.env.local`.

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

5. Seed chambers.

```bash
pnpm seed:chambers
```

## Vercel Setup

1. Push the repo to GitHub.
2. Import it into Vercel with the framework preset set to Next.js.
3. Add the environment variables from `.env.example`.
4. Connect your Supabase project values for server-side access.
5. Let Vercel build from the Git integration. No custom deployment workflow is required.

## Environment Variables

See [`.env.example`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/.env.example).

- `APP_URL`: local or deployed app base URL.
- `SUPABASE_URL`: server-side Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase service role key.
- `SUPABASE_DB_PASSWORD`: optional for local CLI workflows.
- `SCRAPER_FIXTURE_MODE`: use deterministic local HTML fixtures instead of live HTTP fetches.
- `SCRAPER_USER_AGENT`: user agent for deterministic scraping requests.
- `SCRAPE_CACHE_TTL_HOURS`: scrape cache TTL, default 6.
- `MAX_UPLOAD_BYTES`: upload validation cap for the optional symbol override.

## Scripts

- `pnpm dev`: run the app locally.
- `pnpm build`: create a production build.
- `pnpm start`: run the production build locally.
- `pnpm lint`: run ESLint.
- `pnpm typecheck`: run strict TypeScript checking.
- `pnpm test`: run Vitest unit, component, and integration coverage.
- `pnpm test:e2e`: run Playwright E2E tests.
- `pnpm seed:chambers`: upsert the deterministic chamber seed list into Supabase.
- `pnpm verify`: lint, typecheck, test, E2E, and build.

## Architecture Notes

- `app/api/*` route handlers stay thin and only orchestrate validation, services, and HTTP responses.
- `lib/scraping/*` contains deterministic fetch, adapter detection, adapter extraction, branding extraction, normalization, and cache policy.
- `lib/newsletter/*` contains the shared newsletter view model, HTML renderer, and PDF renderer.
- `lib/db/*` contains server-only data access and repository implementations.
- `components/*` contains the local UI state workflow and presentational pieces.
- `tests/fixtures/chambers/*` contains deterministic chamber HTML fixtures used by adapters and E2E.

## Chamber Registry and Cache Model

- `chambers`: source-of-truth registry for selectable chambers and branding hints.
- `scrape_cache`: normalized events + branding payloads stored together per chamber/cache key.
- `newsletter_runs`: request + output metadata for each preview/PDF run.

## How To Add a New Chamber

1. Add a new record to [`lib/db/demo-data.ts`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/lib/db/demo-data.ts) for local fallback and tests.
2. Add the chamber to Supabase with `pnpm seed:chambers`, or insert directly into the `chambers` table.
3. Add a fixture under [`tests/fixtures/chambers`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/tests/fixtures/chambers) if you want deterministic test coverage.
4. If the chamber uses a new platform, add or update an adapter and corresponding tests.

## How To Add a New Adapter

1. Create a new adapter file in [`lib/scraping/adapters`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/lib/scraping/adapters).
2. Implement:
   - `name`
   - `canHandle(input)`
   - `extractEvents(input)`
   - `extractBranding(input)`
3. Register it in [`lib/scraping/adapter-registry.ts`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/lib/scraping/adapter-registry.ts).
4. Add fixture-driven tests for:
   - detection
   - extraction
   - branding
   - normalization

## Testing

Unit and component coverage:

```bash
pnpm test
```

E2E flow:

```bash
pnpm test:e2e
```

Full verification:

```bash
pnpm verify
```

Current coverage targets are enforced in Vitest, with scraping and normalization modules covered above 90% lines and global lines/statements/functions above 80%.

## CI

- [`.github/workflows/ci.yml`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/.github/workflows/ci.yml) runs lint, typecheck, coverage, Playwright, and build on pushes to `main` and pull requests.
- [`.github/workflows/db-verify.yml`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/.github/workflows/db-verify.yml) reapplies migrations twice against a clean Postgres instance to verify reset safety.

## Troubleshooting Fixtures

- Set `SCRAPER_FIXTURE_MODE=true` to bypass live HTTP and use local chamber fixture HTML.
- If an adapter test fails, inspect the matching file under [`tests/fixtures/chambers`](/Users/scottcaesar/Documents/GitHub/chamber-events-newsletter/tests/fixtures/chambers).
- If branding looks wrong in preview or PDF, start with the chamber record’s explicit logo/favicon/theme fields, then inspect the fixture or source HTML meta tags.
- If PDF images are missing, confirm they resolve to the same site or a same-domain CDN. Cross-site asset URLs are intentionally ignored.
