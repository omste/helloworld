# A Modern Hello World

Web service built with modern tools, standards, QA and practices. Designed to be production-ready and is deployed on Google Cloud Run.

## Architecture

- **Framework:** Next.js, which is React-based
- **Data Layer:** Uses PostgreSQL with Drizzle ORM
- **Deployment:** Runs in Docker containers on Google Cloud Run
- **CI/CD:** Managed with GitHub Actions
- **Testing:** End-to-end tests are run in preview environments
- **Rate Limiting:** Handled by Upstash Redis
- **Validation:** Uses tRPC and Zod for server-side logic and input validation

### Flow

The app follows a type-safe data flow pattern:

1. **Server Components:**
   - Fetch initial data through tRPC procedures
   - Provide server-rendered content
   - Use tRPC to interact with the database via Drizzle ORM
   - No client-side JavaScript for static content

2. **Server Actions:**
   - Integrate directly with tRPC procedures
   - Enhance progressively for non-JS clients

3. **tRPC Layer:**
   - Type-safe API procedures
   - Input validation with Zod schemas
   - Rate limiting via Upstash Redis
   - Error handling and logging

4. **Database Layer:**
   - Neon PostgreSQL for data storage
   - Drizzle ORM for type-safe queries
   - Connection pooling and prepared statements for security

### Data Flow Example

> Note: The following diagram is rendered automatically by GitHub using Mermaid. If you're viewing this elsewhere, see the flow description below.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#32CD32', 'edgeLabelBackground':'#fff', 'tertiaryColor': '#fff'}}}%%
graph LR
    %% Cloud Platform
    subgraph "Google Cloud Run"
        direction TB
        subgraph "Next.js Server"
            Page[Next.js Page]
            SC[Server Component]
            SA[Server Action]
        end

        subgraph "tRPC API Layer"
            direction TB
            RL[Rate Limiter]
            TR[tRPC Router]
            ZV[Zod Validation]
            MS[MessageService]
        end

        subgraph "Data Layer"
            DO[Drizzle ORM]
        end
    end

    %% External Services
    subgraph "External Services"
        RD[(Upstash Redis)]
        DB[(Neon PostgreSQL)]
    end

    %% Flow
    Page --> SC
    Page --> SA
    SC --> MS
    SA --> MS
    MS --> TR
    TR --> RL
    RL --> RD
    RL --> |if allowed| ZV
    ZV --> |validated| DO
    DO --> DB

    %% Styles
    style Page fill:#e1f5fe,stroke:#01579b
    style SC fill:#e1f5fe,stroke:#01579b
    style SA fill:#e8f5e9,stroke:#1b5e20
    style MS fill:#fff3e0,stroke:#ff6f00
    style TR fill:#fce4ec,stroke:#880e4f
    style RL fill:#f3e5f5,stroke:#4a148c
    style ZV fill:#e8eaf6,stroke:#1a237e
    style DO fill:#ede7f6,stroke:#311b92
    style DB fill:#efebe9,stroke:#3e2723
    style RD fill:#ffebee,stroke:#b71c1c


```


#### Flow
The data flows through the following components:

1. **Entry Points:**
   - Next.js Pages contain Server Components and Server Actions
   - Server Components fetch data through the MessageService
   - Server Actions handle mutations through the MessageService

2. **API Processing:**
   - MessageService creates type-safe tRPC client requests
   - Requests first go through Rate Limiting middleware
   - If rate limit allows, Zod validates input/output
   - tRPC Router handles routing to correct procedure

3. **Data Access:**
   - Validated requests use Drizzle ORM for database operations
   - External services (Redis, PostgreSQL) handle persistence
   - All runs serverless on Google Cloud Run

## Features

- **Type Safety:** End-to-end type safety through tRPC and Zod:
  - Input validation using Zod schemas (`messageSchema` for database records)
  - Runtime validation of API inputs and outputs
  - Automatic type inference for client-side usage
- **Error Boundaries & Component Fallbacks:** Implemented to enhance user experience and application resilience.
- **Secrets Management:** All secrets are securely managed using GitHub Actions Encrypted Secrets.

## Service Architecture

The application implements a functional service pattern:

### Service Factory Pattern
Services (`MessageService`, `ImageService`) are implemented using a factory pattern to ensure:
- Clean separation of concerns
- Immutable state
- Functional composition
- Easy testing through dependency injection

Example implementation:
```typescript
// Factory function to create a message service
export const createMessageService = () => {
  const trpc = createTrpcClient();

  const getWelcomeMessage = async (): Promise<MessageResponse> => {
    // Implementation
  };

  const addMessage = async (text: string): Promise<void> => {
    // Implementation
  };

  const getMessages = async (): Promise<Message[]> => {
    // Implementation
  };

  return {
    getWelcomeMessage,
    addMessage,
    getMessages,
  };
};
```

### Service Responsibilities
- **MessageService:** Handles all tRPC client interactions and message operations
- **ImageService:** Manages image assets and metadata
- **Logger:** Provides centralized logging with structured output


## Deployment

The application is containerized with Docker and deployed to Google Cloud Run, for these good things :

### Google Cloud Run Features
- **Automatic Scaling:** Scales from zero to handle traffic spikes automatically
- **Cost Optimization:** Only pay for actual compute time used
- **Container Security:** Automatic vulnerability scanning and secure defaults
- **Global Load Balancing:** Built-in CDN and global load balancing

### Deployment Process
1. **Container Build:**
   - Multi-stage Dockerfile for optimized image size
   - Separate build and runtime stages
   - Production dependencies in final image
   
2. **CI/CD Pipeline:**
   - Automated builds on GitHub Actions
   - Container vulnerability scanning
   - Automated testing before deployment
   - Preview environments for pull requests
   
3. **Infrastructure:**
   - Workload Identity Federation for secure authentication
   - Minimum instance count for faster cold starts
   - Environment variables managed through Cloud Run
   - Automatic platform updates and security patches

### Preview Environments
Each pull request gets its own isolated environment:
- Unique URL for testing changes
- Full production parity
- Automatic cleanup on PR closure
- E2E tests run against preview deployments

**Deployed URL:** [HelloWorld App](https://hello.omrisuleiman.com/)

## CI/CD Pipeline

*PLEASE NOTE : ALL SECRETS REMOVED FROM THIS PUBLIC REPO, so pushing and forking won't trigger any of the Github Actions*

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

### Environment Variables

The following environment variables are required:

```env
# Database
DATABASE_URL=postgres://user:pass@host:5432/db

# Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Optional
NODE_ENV=development
PORT=3000
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

### Required GitHub Actions Secrets

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


## UnLicensed
Like all the best venues :)