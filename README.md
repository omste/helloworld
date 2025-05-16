# The Most Over-Engineered Hello World

A public, type-safe, CI-heavy Hello World app — fully loaded with modern tooling.

## ⚠️ Security

- All secrets stored in **GitHub Actions Encrypted Secrets**
- Secrets are **not exposed** to forks, logs, or PRs
- Firebase/GCP service keys are **base64 encoded** and decoded in CI
- **No secrets committed** or printed
- Minimal-permission GCP service accounts used
- `.env` is in `.gitignore`

---

## 🧱 Stack

| Area             | Tech                                 |
|------------------|--------------------------------------|
| Framework        | Next.js                              |
| Type Safety      | tRPC + Zod (defining Server Action logic & validation) |
| Testing          | Playwright (E2E)                     |
| CI/CD            | GitHub Actions                       |
| Deploy           | Vercel                               |
| Quality Gate     | SonarQube                            |
| Design           | Responsive layout                    |
| Database         | Neon Postgres (Vercel) + Drizzle ORM |
| Rate Limiting    | Upstash Redis                        |

---

## ✨ Key Technologies & Patterns

This project leverages several key technologies in specific ways to ensure type safety and a modern development experience, primarily centered around Next.js Server Actions.

### Drizzle ORM with Neon Postgres
-   **Database:** We use [Neon](https://neon.tech/) as our serverless Postgres provider, configured via Vercel.
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/) is used for database interactions.
    -   **Schema Definition:** Database schemas (e.g., `src/db/schema.ts`) are defined using Drizzle's TypeScript syntax, providing strong typing for our data structures.
    -   **Migrations:** `drizzle-kit` is used to generate SQL migration files (`pnpm db:generate`) based on changes to the schema. These migrations are then applied to the Neon database (e.g., via Neon's SQL console or a dedicated migration tool).
    -   **Querying:** The Drizzle client is initialized in the tRPC context (`src/server/context.ts`) and used within tRPC procedures (and by extension, Server Actions) for type-safe database queries.

### tRPC for Server-Side Logic
-   **Purpose:** While often used for creating type-safe APIs, in this project, tRPC's server-side components are primarily used to structure and type our backend logic that Server Actions will consume.
    -   **Procedure Definition:** We define tRPC routers and procedures (e.g., in `src/server/routers/_app.ts`) that encapsulate specific pieces of server-side logic, including database interactions.
    -   **Input Validation:** Each tRPC procedure uses Zod (see below) to define and validate its input parameters, ensuring data integrity before any logic is executed.
    -   **Context System:** tRPC's context (`src/server/context.ts`) is used to provide dependencies like the Drizzle DB client to procedures.
-   **Not an API Layer (in this project):** We are **not** using tRPC's HTTP server/client or its React Query integrations. Instead, Next.js Server Actions directly call these tRPC procedures (or their underlying functions/callers) on the server. This keeps data fetching and mutations server-centric.

### Zod for Validation
-   **Schema Definition & Validation:** [Zod](https://zod.dev/) is used extensively for defining validation schemas for:
    -   Input to tRPC procedures (and thus Server Actions).
    -   Environment variables (can be added later for robust config).
-   **Type Safety:** Zod schemas infer TypeScript types, ensuring that the data passed to and from our server logic is structurally sound and type-correct. This works seamlessly with tRPC to provide end-to-end type safety for our server operations.

### Upstash Redis for Rate Limiting
-   **Service:** [Upstash Redis](https://upstash.com/redis) is used for serverless Redis.
-   **Purpose:** Primarily for implementing rate limiting on specific server actions/procedures.
-   **Implementation:**
    -   The `@upstash/redis` SDK and `@upstash/ratelimit` library are used.
    -   A Redis client and a `Ratelimit` instance are configured in `src/lib/redis.ts`.
    -   tRPC middleware (`src/server/trpc.ts`) leverages this to protect procedures. An identifier (like an IP address, passed via tRPC context) is used to track requests.
    -   Rate-limited procedures (`rateLimitedProcedure`) can be easily defined and used for actions requiring protection against abuse.
-   **Configuration:** Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables.

This combination allows us to build robust, type-safe server-side logic for our Next.js application, leveraging the strengths of each tool within a Server Action-first architecture.

---

## 🚀 Deployment

**This project deploys to Vercel.** Vercel handles the build and deployment process directly from the Git repository.

- ✅ **Firebase Hosting is not used**
- 🔐 Neon Postgres is used for persistent storage via Drizzle ORM (managed through Vercel environment variables).
- 💾 Redis (via Upstash) is used for per-user rate limiting (managed through Vercel environment variables).
- 💡 GitHub secrets are used for the Vercel CLI and other Actions configurations. Vercel has its own environment variable management for the deployed application.

### Deployment Pipeline Overview (with Vercel & GitHub Actions):
1. Code is pushed to GitHub (main branch or a Pull Request).
2. **Vercel**: Automatically triggers a build and deployment.
    - For the `main` branch, it deploys to Production.
    - For Pull Requests, it creates a unique Preview Deployment.
3. **GitHub Actions (`ci.yml`):**
    - `lint_unit_build` job: Runs linters, unit tests, and a production build check. This runs for all PRs and pushes to `main`.
    - `e2e_tests` job: (Runs after `lint_unit_build` on PRs from same repo & pushes to `main`)
        - Fetches the Vercel Preview URL (for PRs) or Production URL (for `main` branch).
        - Runs Playwright End-to-End tests against the live Vercel deployment.
        - Uploads test reports.

---

## 📋 TODO Checklist

- [x] Init Next.js app (TypeScript)
- [x] Add tRPC + Zod (for Server Action logic and validation)
- [x] Configure Neon Postgres (Vercel) + Drizzle ORM
- [x] Set up Playwright (E2E)
- [x] Integrate Upstash Redis (rate limiter utility)
- [x] GitHub Actions:
  - [x] Lint / Typecheck / Build
  - [x] Unit Tests
  - [x] E2E Tests (Playwright against Vercel Previews/Production)
  - [ ] SonarQube scan + gate
- [ ] Store secrets in GitHub + test decode in CI (Vercel-related secrets added)
- [ ] Build responsive layout
- [ ] Document everything cleanly
- [ ] **Future Considerations**: Dockerize output (for alternative deployments), k8 clusters (if non-Vercel targets are explored)

---

## 🧪 Dev

**Initial Setup (if starting from scratch):**
```bash
# 1. Initialize the Next.js project (this step was done for you)
# pnpm create next-app . --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"

# 2. Install dependencies (if not done by create-next-app or after cloning)
pnpm install
```

**Running the app:**
```bash
pnpm dev
```

**Other commands:**
```bash
pnpm build
# pnpm deploy:cloudrun # Placeholder for Cloud Run deployment script (to be configured)

# Database
pnpm db:generate  # Generate Drizzle migrations based on schema changes
pnpm db:studio    # Open Drizzle Studio to browse DB

# End-to-End Testing (Playwright)
pnpm test:e2e           # Run Playwright E2E tests
pnpm test:e2e:ui        # Run Playwright E2E tests in UI mode
pnpm test:e2e:report    # Show last Playwright HTML report
```

---

## 🤖 For AI Tools

- Clear sectioning and secure setup
- Optimized for Cursor, Copilot, etc.
- Minimal context window usage

---

## License

MIT — over-engineer responsibly.
