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
    subgraph Client
        RSC[Server Components]
        SA[Server Actions]
        MS[MessageService]
    end

    subgraph "tRPC Layer"
        TR[tRPC Router]
        subgraph "Middleware"
            RL[Rate Limiter]
            ZV[Zod Validation]
        end
    end

    subgraph "Infrastructure"
        RD[(Upstash Redis)]
    end

    subgraph "Data Layer"
        DO[Drizzle ORM]
        DB[(Neon PostgreSQL)]
    end

    %% Client to tRPC connections
    RSC --> MS
    SA --> MS
    MS --> TR

    %% tRPC internal flow
    TR --> RL
    TR --> ZV
    RL --> RD
    RL --> DO
    ZV --> DO

    %% Data layer
    DO --> DB

    %% Styles
    style RSC fill:#e1f5fe,stroke:#01579b
    style SA fill:#e8f5e9,stroke:#1b5e20
    style MS fill:#fff3e0,stroke:#ff6f00
    style TR fill:#fce4ec,stroke:#880e4f
    style RL fill:#f3e5f5,stroke:#4a148c
    style ZV fill:#e8eaf6,stroke:#1a237e
    style DO fill:#ede7f6,stroke:#311b92
    style DB fill:#efebe9,stroke:#3e2723
    style RD fill:#ffebee,stroke:#b71c1c

    %% Subgraph styles
    classDef subgraph-style fill:none,stroke:#666,stroke-dasharray: 5 5
    class Client,tRPC Layer,Data Layer,Infrastructure,Middleware subgraph-style
```

#### Flow
The data flows through the following components:
1. **Entry Points:**
   - Server Components use tRPC procedures for data fetching
2. **Processing:**
   - All requests go through the tRPC Router for type-safe validation
   - Input validation is handled by Zod schemas (e.g., `messageInputSchema`, `messageResponseSchema`)
   - Requests pass through Rate Limiter to prevent abuse
3. **Data Access:**
   - Drizzle ORM provides type-safe database operations
   - Finally reaches Neon PostgreSQL for data persistence

## Key Features

- **Type Safety:** End-to-end type safety through tRPC and Zod:
  - Input validation using Zod schemas (`messageSchema` for database records)
  - Runtime validation of API inputs and outputs
  - Automatic type inference for client-side usage
- **Error Boundaries & Component Fallbacks:** Implemented to enhance user experience and application resilience.
- **Secrets Management:** All secrets are securely managed using GitHub Actions Encrypted Secrets.

## Service Architecture

The application implements a service layer pattern:

### Singleton Services
All services (`MessageService`, `ImageService`, `Logger`) are implemented as singletons to ensure:
- Single source of truth
- Efficient resource use
- Consistent behavior

Example implementation:
```typescript
export class MessageService {
  private static instance: MessageService;
  private trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  private constructor() {
    // Private initialization logic
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }
}
```

### Service Responsibilities
- **MessageService:** Handles all tRPC client interactions and message operations
- **ImageService:** Manages image assets and metadata
- **Logger:** Provides centralized logging with structured output

### Benefits of the Service Layer
1. **Separation of Concerns:**
   - Business logic is isolated from UI components
   - Each service has a single, well-defined responsibility
   - Easy to test with mock implementations

2. **Environment Awareness:**
   - Services adapt behavior based on runtime environment
   - Different configurations for browser/server/preview
   - Graceful fallbacks for build-time execution

3. **Error Handling:**
   - Basic error class hierarchy with `AppError` as base
   - HTTP status code mapping through error classes
   - React Error Boundaries for UI resilience
   - Structured error logging via Pino

4. **Extensibility:**
   - New features can be added by extending existing services
   - Clear patterns for adding new services
   - Easy to implement A/B testing

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