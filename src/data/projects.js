// Three build projects that turn the roadmap into a portfolio. Each tier adds
// the concerns of the phases it references, and each project can ship as-is.

export const projects = [
  {
    id: "link-shortener",
    tier: "Beginner",
    level: "01",
    duration: "2–4 weeks",
    title: "Link shortener with analytics",
    pitch:
      "A small service that anyone can use, with a real database, real validation and a deploy you can point at.",
    brief:
      "Build an API that takes a long URL and returns a short code, redirects visitors, and counts clicks without losing data under load. Ship it behind Nginx with a Dockerfile and a CI pipeline.",
    stack: ["Spring Boot 3", "PostgreSQL", "Flyway", "JUnit 5", "Docker"],
    phases: ["01", "02", "03", "04", "06"],
    requirements: [
      "POST /api/v1/links validates the URL, stores a unique slug and returns 201 with the short URL; GET /{slug} returns 302 with the original location.",
      "Postgres schema with a unique index on the slug and a clicks table; migrations managed by Flyway and tested against a Testcontainers database.",
      "Bean Validation for input, RFC 9457 problem responses for errors, and a redirect that still works when analytics is down.",
      "Integration test that follows the create → redirect → click-counted path, plus a Docker image running as a non-root user.",
    ],
    stretch: [
      "Add expiry dates, custom slugs and a rate limit per IP.",
      "Aggregate clicks per day and return a small stats endpoint.",
    ],
    tutorial: true,
    proves: "You can design a schema, build a validated REST API and deploy it.",
  },
  {
    id: "orders",
    tier: "Intermediate",
    level: "02",
    duration: "4–8 weeks",
    title: "Order & payment service",
    pitch:
      "The backend of a small shop: money, stock, idempotency and events — the parts that punish shortcuts.",
    brief:
      "Model customers, products, orders and payments. Accept an order idempotently, charge through a fake or sandbox payment provider, publish an order-placed event, and keep inventory consistent when things fail midway.",
    stack: ["Spring Boot 3", "JPA", "Redis", "Kafka", "Spring Security", "Testcontainers"],
    phases: ["03", "04", "05", "07", "08"],
    requirements: [
      "Order placement is transactional and idempotent: the same Idempotency-Key never charges twice, even when the client retries.",
      "JWT-secured endpoints with ownership checks — a customer can only read their own orders; an admin can list all of them with cursor pagination.",
      "Product reads are cached in Redis with a TTL and explicit eviction on update; measure hit rate and prove the cache miss path still works.",
      "Publish orders.placed through the outbox pattern so a Kafka outage cannot lose the event; the inventory consumer is idempotent.",
      "Circuit breaker plus timeout around the payment client with a documented fallback, and a 429 rate limit on checkout.",
    ],
    stretch: [
      "Add a refund flow with a compensating event and an audit trail.",
      "Run a k6 or Gatling load test and record p95 latency before and after caching.",
    ],
    proves: "You can build a transactional service that survives retries, outages and concurrent users.",
  },
  {
    id: "saas",
    tier: "Pro",
    level: "03",
    duration: "10–16 weeks",
    title: "Multi-tenant SaaS with an AI assistant",
    pitch:
      "A production-shaped platform: tenants, roles, background jobs, observability, a support assistant and a deploy you can roll back.",
    brief:
      "Build a workspace product (for example team notes or support tickets) with tenant isolation, role-based access, invite emails, background jobs and an AI assistant that answers only from the tenant's own documents. Package it as a real deployment with dashboards and alerts.",
    stack: ["Spring Boot 3", "PostgreSQL RLS", "Redis", "Kafka", "OpenTelemetry", "Kubernetes"],
    phases: ["03", "04", "07", "08", "09", "10"],
    requirements: [
      "Tenant isolation enforced in the data layer (tenant_id on every row or Postgres row-level security) and proven by a two-tenant test suite.",
      "Roles and invites: owner/admin/member permissions, expiring invite tokens, and authorization checked server-side on every resource.",
      "RAG assistant: chunk tenant documents, store embeddings, retrieve with a tenant filter, stream answers with citations, and refuse when evidence is missing.",
      "Observability: Micrometer metrics for golden signals, structured logs with trace ids, OTLP traces, a dashboard and alerts on error rate and p95 latency.",
      "Delivery: CI that runs unit/integration tests and builds one image, Kubernetes manifests with probes and limits, and a documented rollback.",
      "Security pass: rate limits, per-request token budgets for the AI calls, secrets from the platform, dependency scanning and a threat-model note.",
    ],
    stretch: [
      "Add a second region or a read replica and document the failover procedure.",
      "Load test to a target throughput, publish the numbers and fix the first bottleneck you find.",
    ],
    proves: "You can own a service end to end: data, security, scale, cost and on-call.",
  },
  {
    id: "task-api",
    tier: "Beginner",
    level: "02",
    duration: "2–3 weeks",
    title: "Task tracker API",
    pitch:
      "The classic first API, done properly: CRUD, filters, pagination and tests you actually keep.",
    brief:
      "Build a task list backend with projects, tasks, due dates and status. No authentication yet — focus on clean endpoints, validation, a real schema and a test suite. This is the project to repeat after the tutorial without following steps.",
    stack: ["Spring Boot 3", "PostgreSQL", "Flyway", "JUnit 5", "Testcontainers"],
    phases: ["02", "03", "04", "06"],
    requirements: [
      "Full CRUD for projects and tasks, with tasks belonging to a project and a foreign key that enforces it.",
      "Filtering by status and due date, plus cursor or offset pagination on every list endpoint with a documented maximum page size.",
      "Bean Validation on every request DTO and one consistent problem-detail error shape, including 404 for unknown ids.",
      "Unit tests for status transitions and an integration test per endpoint using Testcontainers.",
      "A README with the exact commands to run the app, the database and the tests.",
    ],
    stretch: [
      "Add soft delete plus an endpoint to restore a task.",
      "Add a daily digest endpoint that groups tasks by due date.",
    ],
    proves: "You can build a complete CRUD API without copying a tutorial.",
  },
  {
    id: "file-vault",
    tier: "Beginner",
    level: "03",
    duration: "2–3 weeks",
    title: "File vault with uploads",
    pitch:
      "Uploads are where beginners meet size limits, content types, storage costs and security.",
    brief:
      "Build an API that uploads files to object storage (MinIO locally, S3-compatible in the cloud) and keeps metadata in PostgreSQL. Downloads go through short-lived signed URLs instead of streaming every byte through your app.",
    stack: ["Spring Boot 3", "PostgreSQL", "MinIO / S3", "Flyway", "Docker"],
    phases: ["03", "04", "07", "08"],
    requirements: [
      "Multipart upload with a size cap, an allowlist of content types and a generated storage key — never trust the client's filename.",
      "Metadata row per file (owner placeholder, size, content type, checksum, created_at) with a unique storage key.",
      "Download returns a signed URL that expires in minutes, and deleting a record removes the stored object too.",
      "Reject oversized and disallowed files with clear 400/413 problem responses, and prove it with integration tests.",
      "Document the storage layout so a future migration can move objects without breaking links.",
    ],
    stretch: [
      "Generate thumbnails for images on upload using a background job.",
      "Add per-file download counters and a most-downloaded list.",
    ],
    proves: "You can handle binary data and external storage safely.",
  },
  {
    id: "chat-realtime",
    tier: "Intermediate",
    level: "02",
    duration: "4–6 weeks",
    title: "Realtime chat & notifications",
    pitch:
      "Persistent connections, fan-out across instances, and the authorization checks most chat demos skip.",
    brief:
      "Build rooms, messages and presence over WebSockets (or SSE for notifications). Store history in PostgreSQL, fan out through Redis pub/sub so two app instances stay in sync, and authenticate the handshake properly.",
    stack: ["Spring Boot 3", "WebSocket / STOMP", "Redis", "PostgreSQL", "Spring Security"],
    phases: ["04", "05", "07", "08", "09"],
    requirements: [
      "Authenticated handshake: a valid token is required and the server derives the user id from it, never from the message body.",
      "Room membership is checked on subscribe and on send; a non-member gets an error and no messages.",
      "Messages persist before broadcast, and a reconnecting client can load history with pagination.",
      "Two app instances share delivery through Redis pub/sub; a message sent to one is received by clients on the other.",
      "Presence and typing indicators are ephemeral, throttled, and never used as the source of truth.",
    ],
    stretch: [
      "Add unread counts and a notification stream over SSE.",
      "Add message editing with an audit trail of previous versions.",
    ],
    proves: "You can run stateful connections safely across more than one instance.",
  },
  {
    id: "cms-search",
    tier: "Intermediate",
    level: "03",
    duration: "4–6 weeks",
    title: "Blog CMS with full-text search",
    pitch:
      "Roles, drafts, scheduled publishing, caching and search relevance — a content backend with real editorial rules.",
    brief:
      "Build an editorial API: authors write drafts, editors publish, the public reads only published content. Add PostgreSQL full-text search with ranking, a cache for article pages, and image uploads for covers.",
    stack: ["Spring Boot 3", "PostgreSQL FTS", "Redis", "Spring Security", "OpenAPI"],
    phases: ["03", "04", "05", "06", "07"],
    requirements: [
      "Roles for author, editor and reader, with server-side checks on every state transition (draft → review → published).",
      "Scheduled publishing: an article with a future date becomes public without a manual deploy.",
      "Search endpoint using tsvector/GIN with ranking, highlighted snippets, pagination and an empty-query fallback.",
      "Article reads cached in Redis with explicit eviction on publish or edit; stale content must never outlive the TTL.",
      "OpenAPI spec published with accurate error responses and an integration test per status change.",
    ],
    stretch: [
      "Add revisions with a diff view and the ability to restore an older version.",
      "Add related-article suggestions based on shared tags.",
    ],
    proves: "You can build an editorial workflow with search and caching.",
  },
  {
    id: "analytics-pipeline",
    tier: "Pro",
    level: "02",
    duration: "8–12 weeks",
    title: "Event analytics pipeline",
    pitch:
      "Ingest millions of events, aggregate them in a columnar store, and serve dashboards without touching the transactional database.",
    brief:
      "Add an event ingestion endpoint to an app, publish events through Kafka with the outbox pattern, land them in ClickHouse, and expose aggregated dashboard queries. Include backfill, replay and a data-quality check.",
    stack: ["Spring Boot 3", "Kafka", "ClickHouse", "PostgreSQL", "Grafana", "Kubernetes"],
    phases: ["03", "08", "09", "10"],
    requirements: [
      "Ingestion endpoint validates and enqueues events with at-least-once delivery; duplicates are deduplicated by event id.",
      "Outbox table written in the same transaction as the business change, with a relay that publishes and marks rows sent.",
      "ClickHouse schema with a sorting key that matches the dashboard filters, batched inserts and a materialised daily aggregate.",
      "Dashboard query API with date-range limits, p95 latency targets and caching for repeated ranges.",
      "Replay procedure that rebuilds a day of aggregates from the Kafka log, plus a documented data-quality check.",
    ],
    stretch: [
      "Add anomaly alerts on event volume per tenant.",
      "Add a second consumer group that writes a per-user activity feed.",
    ],
    proves: "You can design an event pipeline with replay, deduplication and analytics.",
  },
];
