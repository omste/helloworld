# A Modern Hello World

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
| Deploy           | Google Cloud Run (via Docker)        |
| Quality Gate     | SonarQube                            |
| Design           | Responsive layout                    |
| Database         | Neon Postgres (Vercel) + Drizzle ORM |
| Rate Limiting    | Upstash Redis                        |

---

## ✨ Key Technologies & Patterns

This project leverages several key technologies in specific ways to ensure type safety and a modern development experience, primarily centered around Next.js Server Actions.

### Drizzle ORM with Neon Postgres
-   **Database:** We use [Neon](https://neon.tech/) as our serverless Postgres provider. Connection details are managed via GitHub secrets and supplied to Google Cloud Run.
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

**This project deploys as a Docker container to Google Cloud Run.**

- ✅ **Firebase Hosting and Vercel are not used for deployment.**
- 🔐 Neon Postgres is used for persistent storage via Drizzle ORM. Credentials managed by GitHub secrets and passed to Cloud Run.
- 💾 Redis (via Upstash) is used for per-user rate limiting. Credentials managed by GitHub secrets and passed to Cloud Run.
- 💡 GCP Service Account keys and project details are stored in GitHub secrets for CI/CD.

### Deployment Pipeline Overview (with Google Cloud Run & GitHub Actions):
1. Code is pushed to GitHub (`main` branch or a PR from the same repository).
2. **GitHub Actions (`ci.yml`):**
    - `lint_unit_build` job: Runs linters, unit tests, and a Next.js production build check. This runs for all PRs (including forks) and pushes to `main`.
    - `e2e_tests_and_deploy` job: (Runs after `lint_unit_build` only on PRs from the same repo & pushes to `main`)
        - Authenticates to Google Cloud.
        - Builds the Docker image (potentially passing build-time ARGs like `DATABASE_URL` if needed by the Next.js build itself, though runtime is preferred for Cloud Run).
        - Pushes the Docker image to Google Container Registry (GCR) or Artifact Registry.
        - Deploys the image to a Google Cloud Run service, configuring runtime environment variables (`DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `PORT`).
        - Retrieves the URL of the deployed Cloud Run service.
        - Runs Playwright End-to-End tests against this live Cloud Run deployment.
        - Uploads test reports.

---

## 🔐 GCP Workload Identity Federation Setup for CI/CD

To allow GitHub Actions to securely authenticate to Google Cloud and manage resources (like deploying to Cloud Run and pushing to Artifact Registry) without using long-lived service account keys, we use Workload Identity Federation.

**Prerequisites:**
- Google Cloud SDK (`gcloud`) installed and configured locally with permissions to manage IAM policies and Workload Identity Pools in your target GCP project (e.g., your user account should have `Owner`, `Project IAM Admin`, or `IAM Workload Identity Pool Admin` roles on the project).
- A GCP Service Account that GitHub Actions will impersonate. This service account needs appropriate roles:
    - `Cloud Run Admin` (roles/run.admin)
    - `Artifact Registry Administrator` or `Artifact Registry Writer` (roles/artifactregistry.admin or roles/artifactregistry.writer)
    - `Service Account User` (roles/iam.serviceAccountUser)
    - *(Example Service Account Email used below: `github-ci@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com`)*

**Steps (using `gcloud`):**

1.  **Create a Workload Identity Pool:**
    Replace `YOUR_POOL_ID` (e.g., `helloworld-github-pool`), `YOUR_POOL_DISPLAY_NAME`, and `YOUR_POOL_DESCRIPTION` with your desired values. Replace `YOUR_GCP_PROJECT_ID` with your actual GCP Project ID (e.g., `tryout-ci`).
    ```bash
    gcloud iam workload-identity-pools create YOUR_POOL_ID \
        --project="YOUR_GCP_PROJECT_ID" \
        --location="global" \
        --display-name="YOUR_POOL_DISPLAY_NAME" \
        --description="YOUR_POOL_DESCRIPTION"
    ```
    *Example values used in this project: `helloworld-github-pool`, `tryout-ci`.*

2.  **Create a Workload Identity Pool Provider:**
    This links the pool to your GitHub repository. Replace `YOUR_PROVIDER_ID` (e.g., `github-provider`), `YOUR_POOL_ID` (from step 1), `YOUR_GCP_PROJECT_ID`, `YOUR_GCP_PROJECT_NUMBER`, `YOUR_PROVIDER_DISPLAY_NAME`, `YOUR_PROVIDER_DESCRIPTION`, and `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` (e.g., `omste/helloworld`).
    ```bash
    gcloud iam workload-identity-pools providers create-oidc YOUR_PROVIDER_ID \
        --project="YOUR_GCP_PROJECT_ID" \
        --location="global" \
        --workload-identity-pool="YOUR_POOL_ID" \
        --display-name="YOUR_PROVIDER_DISPLAY_NAME" \
        --description="YOUR_PROVIDER_DESCRIPTION" \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --allowed-audiences="https://iam.googleapis.com/projects/YOUR_GCP_PROJECT_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL_ID/providers/YOUR_PROVIDER_ID" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
        --attribute-condition="assertion.repository == 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME'"
    ```
    *Example values used in this project: `github-provider` for provider ID, `helloworld-github-pool` for pool ID, `tryout-ci` for project ID, `607500567423` for project number, `omste/helloworld` for repo path.*

3.  **Grant the GitHub Identity Permission to Impersonate the GCP Service Account:**
    This allows GitHub Actions from your specific repository to act as your chosen GCP Service Account. Replace `YOUR_GCP_SERVICE_ACCOUNT_EMAIL`, `YOUR_GCP_PROJECT_ID`, `YOUR_GCP_PROJECT_NUMBER`, `YOUR_POOL_ID`, and `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME`.
    ```bash
    gcloud iam service-accounts add-iam-policy-binding "YOUR_GCP_SERVICE_ACCOUNT_EMAIL" \
        --project="YOUR_GCP_PROJECT_ID" \
        --role="roles/iam.workloadIdentityUser" \
        --member="principalSet://iam.googleapis.com/projects/YOUR_GCP_PROJECT_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL_ID/attribute.repository/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"
    ```
    *Example values used in this project: `github-ci@tryout-ci.iam.gserviceaccount.com` for service account, `tryout-ci` for project ID, `607500567423` for project number, `helloworld-github-pool` for pool ID, `omste/helloworld` for repo path.*

**Required GitHub Secrets:**
After completing the above GCP setup, configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):
-   `GCP_PROJECT_ID`: Your Google Cloud Project ID (e.g., `tryout-ci`).
-   `GCP_PROJECT_NUMBER`: Your numeric Google Cloud Project Number (e.g., `607500567423`).
-   `GCP_WORKLOAD_IDENTITY_POOL_ID`: The ID you chose for your Workload Identity Pool (e.g., `helloworld-github-pool`).
-   `GCP_WORKLOAD_IDENTITY_PROVIDER_ID`: The ID you chose for your Workload Identity Pool Provider (e.g., `github-provider`).
-   `GCP_SERVICE_ACCOUNT_EMAIL`: The email of the GCP Service Account GitHub Actions will impersonate (e.g., `github-ci@tryout-ci.iam.gserviceaccount.com`).
-   `CLOUD_RUN_SERVICE_NAME`: Name for your Cloud Run service (e.g., `helloworld-app`).
-   `CLOUD_RUN_REGION`: GCP region for Cloud Run (e.g., `us-central1`).
-   `DATABASE_URL`: Connection string for your Neon database.
-   `UPSTASH_REDIS_REST_URL`: URL for your Upstash Redis instance.
-   `UPSTASH_REDIS_REST_TOKEN`: Token for your Upstash Redis instance.

This setup enables the GitHub Actions workflow (`.github/workflows/ci.yml`) to authenticate to GCP using the `google-github-actions/auth` action.

---

## 📋 TODO Checklist

- [x] Init Next.js app (TypeScript)
- [x] Add tRPC + Zod (for Server Action logic and validation)
- [x] Configure Neon Postgres + Drizzle ORM
- [x] Set up Playwright (E2E)
- [x] Integrate Upstash Redis (rate limiter utility)
- [x] Dockerize application
- [ ] GitHub Actions:
  - [x] Lint / Typecheck / Build
  - [x] Unit Tests
  - [ ] E2E Tests (Playwright against ephemeral Google Cloud Run deployment)
  - [ ] Deploy to Google Cloud Run (as part of E2E job for now, can be separate for `main`)
  - [ ] SonarQube scan + gate
- [ ] Store secrets in GitHub (GCP SA Key, Project ID, Cloud Run details, DB/Redis creds)
- [ ] Build responsive layout
- [ ] Document everything cleanly

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

## 🚨 Deployment Challenges & Solutions

During the setup of our Google Cloud Run deployment pipeline, we encountered and solved several challenges. Here's a detailed breakdown of the issues and their solutions:

### 1. GitHub Actions Authentication with GCP

**Challenge:** Setting up secure authentication between GitHub Actions and Google Cloud Platform.

**Solution:**
- Implemented Workload Identity Federation instead of using service account keys
- Created a dedicated service account with minimal permissions
- Set up proper IAM bindings and attribute conditions
- Used `token_format: 'access_token'` in the auth action for Docker authentication

### 2. Docker Registry Configuration

**Challenge:** Configuring proper access to Google Artifact Registry.

**Solution:**
- Used the correct registry format: `us-central1-docker.pkg.dev/$PROJECT_ID/helloworld-docker-repo`
- Added proper authentication for Docker using `gcloud auth configure-docker`
- Implemented build caching using GitHub Actions cache

### 3. Cloud Run Deployment Issues

**Challenge:** Several deployment-specific issues needed to be resolved:

1. **Invalid Component Installation:**
   - Initial error: `artifactregistry` component doesn't exist
   - Solution: Removed invalid component, kept only `beta` component

2. **Reserved Environment Variables:**
   - Error: Cannot set reserved `PORT` environment variable
   - Solution: Removed `PORT` from `--set-env-vars` as it's automatically managed by Cloud Run

3. **Deployment Verification:**
   - Added robust health check with retries
   - Implemented proper URL output capture and verification
   - Added timeout and proper error handling

### 4. CI/CD Pipeline Optimization

**Improvements implemented:**
- Added caching for:
  - pnpm dependencies
  - Next.js build cache
  - Docker layers
- Separated build and deployment stages
- Added proper condition checks for deployment
- Implemented deployment verification

### 5. Environment Configuration

**Key considerations:**
- All sensitive values stored in GitHub Secrets
- Used proper environment variable injection
- Configured production settings (`NODE_ENV=production`)
- Set minimum instances to 1 to avoid cold starts

### 6. Common Gotchas to Watch For

1. **Docker Registry Path:**
   - Must match exactly: `[REGION]-docker.pkg.dev/[PROJECT_ID]/[REPO_NAME]`
   - Region must be consistent throughout configuration

2. **Service Account Permissions:**
   - Needs `Cloud Run Admin`, `Storage Admin`, `Artifact Registry Admin/Writer`
   - Requires `Service Account User` and `Token Creator` roles

3. **Environment Variables:**
   - Don't set reserved vars like `PORT`
   - Use secrets for sensitive values
   - Remember to set `NODE_ENV=production`

4. **Deployment Verification:**
   - Wait for service to be fully ready
   - Check for correct HTTP status codes
   - Implement proper timeout and retry logic

### 7. Best Practices Implemented

1. **Security:**
   - Used Workload Identity Federation
   - Minimal service account permissions
   - Secure secret management

2. **Performance:**
   - Implemented proper caching
   - Configured minimum instances
   - Used Docker layer optimization

3. **Reliability:**
   - Added deployment verification
   - Implemented proper error handling
   - Added health checks

4. **Maintainability:**
   - Clear workflow structure
   - Proper environment separation
   - Documented configuration

---

## License

MIT — over-engineer responsibly.
