# HelloWorld – Cloud Run Deployment

This is a modern, production-ready web service deployed on Google Cloud Run. It demonstrates a clean architecture, robust CI/CD pipeline, and modern deployment practices.

## Architecture

- **Framework:** Next.js (React-based)
- **Data Layer:** PostgreSQL (via Neon) with Drizzle ORM
- **Deployment:** Dockerized application deployed to Google Cloud Run
- **CI/CD:** GitHub Actions
- **Testing:** End-to-end tests executed against preview environments
- **Rate Limiting:** Upstash Redis
- **Validation:** tRPC + Zod for server-side logic and input validation

## Key Features

- **Type Safety:** Ensured through tRPC and Zod, providing robust server-side logic and input validation.
- **Error Boundaries & Component Fallbacks:** Implemented to enhance user experience and application resilience.
- **Secrets Management:** All secrets are securely managed using GitHub Actions Encrypted Secrets.

## Deployment

The application is containerized using Docker and deployed to Google Cloud Run. Cloud Run provides a serverless environment that automatically scales based on incoming traffic, eliminating the need for manual infrastructure management. This setup ensures efficient resource utilization and cost-effectiveness.

**Deployed URL:** [HelloWorld App](https://hello.omrisuleiman.com/)

## CI/CD Pipeline

GitHub Actions orchestrates the continuous integration and deployment processes:

- **Build:** Compiles the application and constructs the Docker image.
- **Test:** Executes unit and integration tests to validate functionality.
- **Deploy:** Pushes the Docker image to Google Cloud Container Registry and deploys it to Cloud Run.

## Preview Environments

For each pull request, a preview environment is automatically deployed. This allows for isolated testing and validation of changes before merging into the main branch.

## End-to-End Testing

End-to-end tests are run against the preview environments to ensure that the application behaves as expected in a production-like setting.

## Setup

### Initial Setup

1. **Initialize the Next.js project:**
   ```bash
   pnpm create next-app . --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Running the app:**
   ```bash
   pnpm dev
   ```

### Database Setup

- **Generate Drizzle migrations:**
  ```bash
  pnpm db:generate
  ```

- **Open Drizzle Studio to browse DB:**
  ```bash
  pnpm db:studio
  ```

## GCP Setup

### Workload Identity Federation

1. **Create a Workload Identity Pool:**
   ```bash
   gcloud iam workload-identity-pools create YOUR_POOL_ID \
       --project="YOUR_GCP_PROJECT_ID" \
       --location="global" \
       --display-name="YOUR_POOL_DISPLAY_NAME" \
       --description="YOUR_POOL_DESCRIPTION"
   ```

2. **Create a Workload Identity Pool Provider:**
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

3. **Grant the GitHub Identity Permission to Impersonate the GCP Service Account:**
   ```bash
   gcloud iam service-accounts add-iam-policy-binding "YOUR_GCP_SERVICE_ACCOUNT_EMAIL" \
       --project="YOUR_GCP_PROJECT_ID" \
       --role="roles/iam.workloadIdentityUser" \
       --member="principalSet://iam.googleapis.com/projects/YOUR_GCP_PROJECT_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL_ID/attribute.repository/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"
   ```

### Required GitHub Secrets

- `GCP_PROJECT_ID`
- `GCP_PROJECT_NUMBER`
- `GCP_WORKLOAD_IDENTITY_POOL_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER_ID`
- `GCP_SERVICE_ACCOUNT_EMAIL`
- `CLOUD_RUN_SERVICE_NAME`
- `CLOUD_RUN_REGION`
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Best Practices Implemented

- **Containerization:** Ensures consistency across development and production environments.
- **Serverless Deployment:** Leverages Cloud Run for automatic scaling and reduced operational overhead.
- **Automated Testing:** Incorporates unit and end-to-end tests to catch issues early in the development cycle.
- **Continuous Integration:** Utilizes GitHub Actions for automated building, testing, and deployment.
- **Code Coverage Monitoring:** Integrates tools to monitor test coverage and maintain code quality.

## License

MIT — over-engineer responsibly.
