// Longer notes for every topic, keyed by topic id. Merged into the roadmap by
// roadmap.js so the reading panel and search can use them.
// Shape: overview (2-4 sentences), terms ([name, definition][]),
// gotchas (things that bite beginners), practice (one small thing to do).

export const topicDetails = {
  /* ---------- 01 foundations ---------- */
  internet: {
    overview:
      "The internet is millions of private networks agreeing to speak IP. Your request is chopped into packets, each addressed with an IP and a port, and independently routed hop by hop. TCP adds ordering, retransmission and a handshake on top of that unreliable delivery; UDP skips all of it for speed.",
    terms: [
      ["Packet", "One chunk of data with a source/destination IP and port in its header."],
      ["Port", "A number (80, 443, 5432, 8080) that selects which program on a machine receives the bytes."],
      ["Latency vs bandwidth", "Latency is how long one round trip takes; bandwidth is how much fits through. More bandwidth does not fix a slow round trip."],
    ],
    gotchas: [
      "localhost is only reachable from your own machine — a phone on the same Wi-Fi cannot open it until you bind 0.0.0.0 and open the firewall.",
      "A server that 'works locally' often fails in production because of NAT, a security group, or a proxy that changes the request.",
    ],
    practice:
      "Run `curl -v https://example.com` and label each part of the output: DNS, TCP connect, TLS handshake, request, response headers.",
  },
  http: {
    overview:
      "HTTP is a text protocol of request and response messages: a method, a path, headers, then an optional body. Its rules about safety and idempotency are what let proxies, browsers and retries behave predictably, so treat them as part of your API design rather than paperwork.",
    terms: [
      ["Idempotent", "Repeating the same request produces the same end state (GET, PUT, DELETE); POST is not idempotent, hence idempotency keys."],
      ["Status class", "2xx worked, 3xx look elsewhere, 4xx the caller is wrong, 5xx the server is wrong."],
      ["Header", "Metadata: content type, cache rules, credentials, correlation ids, cookies."],
    ],
    gotchas: [
      "Returning 200 with `{\"error\": ...}` breaks every client, monitor and retry policy that reads the status.",
      "GET bodies are not reliably supported — put filters in the query string.",
      "A 301 is cached aggressively by browsers; use 302/307 for anything temporary.",
    ],
    practice:
      "Call your future API by hand with `curl -i` until you can predict every status code before sending.",
  },
  dns: {
    overview:
      "DNS is a distributed lookup service that turns a name into records. Caching happens at every level (browser, OS, resolver), which is why changes feel instant for you and invisible for someone else until their TTL expires.",
    terms: [
      ["A / AAAA", "Maps a name to an IPv4 / IPv6 address."],
      ["CNAME", "Aliases one name to another name, commonly used to point at a managed host."],
      ["TTL", "How many seconds resolvers may cache the answer; low before a migration, higher normally."],
    ],
    gotchas: [
      "Changing DNS does not speed up an expired or misconfigured certificate — TLS is a separate problem.",
      "A wildcard record can silently hide a missing subdomain, making a typo in your config look fine.",
    ],
    practice:
      "Run `dig example.com` (or `nslookup`) and identify which record type answered and its TTL.",
  },
  browsers: {
    overview:
      "The browser is the client that punishes you: it caches, preflights, sends cookies automatically, blocks mixed content and enforces CORS. Understanding its request lifecycle turns most 'the API is broken' reports into a five-minute DevTools check.",
    terms: [
      ["Preflight", "An OPTIONS request the browser sends before a cross-origin non-simple request to ask permission."],
      ["Cookie jar", "Automatic per-origin storage that attaches cookies to matching requests, which is why CSRF exists."],
      ["TTFB", "Time to first byte — server plus network think time, the part backend work actually improves."],
    ],
    gotchas: [
      "CORS errors in the console are the browser refusing a response, not the server failing to send it — check the Network tab, not just the console.",
      "DevTools 'Disable cache' hides caching bugs; always retest with it off.",
    ],
    practice:
      "Open the Network tab, load a page, and read one request's status, request headers, response headers and timing breakdown.",
  },
  "frontend-basics": {
    overview:
      "You do not need to build UIs, but you must read them. A form POST sends urlencoded data and follows redirects; fetch sends JSON and does not send cookies unless told to; neither validates anything on the server's behalf.",
    terms: [
      ["Same-origin", "Same scheme, host and port. Anything else is cross-origin and subject to CORS."],
      ["Form encoding", "`application/x-www-form-urlencoded` or `multipart/form-data` — different from a JSON body."],
      ["JSON", "Text format with no date, decimal or binary types; agree on formats at the boundary."],
    ],
    gotchas: [
      "A client can send any body it likes; validation must exist server-side even when the form has `required`.",
      "Money and large ids lose precision in JavaScript numbers — send strings or integer minor units.",
    ],
    practice:
      "Build one HTML page with a form that POSTs to your API, then repeat it with `fetch` and compare the request headers in DevTools.",
  },
  "first-server": {
    overview:
      "A web server is a loop: accept a connection, parse the request, route it to a handler, write a response. Frameworks add routing, middleware, dependency injection and serialization around that loop — Spring Boot just does it with more conventions and more hidden magic.",
    terms: [
      ["Handler", "The function that turns a parsed request into a response for one route."],
      ["Middleware", "Code wrapped around handlers for logging, auth, CORS, compression and errors."],
      ["Health endpoint", "A cheap route that reports whether the process can serve traffic."],
    ],
    gotchas: [
      "Printing requests to the console is not logging; you cannot search it later or correlate it with a user.",
      "Binding to 0.0.0.0 exposes the port to your network — fine locally, dangerous by accident.",
    ],
    practice:
      "Write a 30-line HTTP server in plain Java (or Node) that answers GET /health with JSON, then do the same in Spring Boot and compare.",
  },

  /* ---------- 02 language ---------- */
  java: {
    overview:
      "Java's value is its type system plus a mature runtime: generics catch mistakes at compile time, records make data carriers terse, and the collection/stream APIs cover most everyday transformations. Learn visibility, immutability and exceptions properly before reaching for frameworks.",
    terms: [
      ["record", "An immutable data class with generated constructor, accessors, equals, hashCode and toString."],
      ["Generics", "Compile-time type parameters (`List<Order>`) that erase at runtime — hence no `new T[]`."],
      ["Checked exception", "A `throws`-declared exception the compiler forces you to handle; unchecked ones are programming errors."],
    ],
    gotchas: [
      "`==` compares references for objects; use `equals` (or records, which implement it).",
      "Streams are lazy and single-use — a consumed stream throws on a second terminal operation.",
      "Never mutate a collection while iterating it; use `removeIf` or an iterator.",
    ],
    practice:
      "Rewrite one loop as a stream, then rewrite it back. Notice which version you can read faster — that is the real test.",
  },
  "build-tools": {
    overview:
      "Maven and Gradle resolve dependencies, compile, test, package and publish. Their real job is reproducibility: the same source plus the same lockfile and wrapper must produce the same artifact on your laptop and in CI.",
    terms: [
      ["Lifecycle", "Maven's ordered phases (`compile → test → package → verify`) — running a later phase runs the earlier ones."],
      ["Scope", "`compile`, `runtime`, `test`, `provided` — controls what ships and what is on the test classpath."],
      ["BOM", "A managed set of compatible dependency versions, which is what `spring-boot-starter-parent` gives you."],
    ],
    gotchas: [
      "Two versions of the same library on the classpath cause bizarre runtime errors; run `mvn dependency:tree` early.",
      "A build that only works after a manual IDE step is not a build — put it in the POM.",
    ],
    practice:
      "Run `./mvnw -q dependency:tree` and find one dependency you did not add directly. That is a transitive dependency.",
  },
  "project-layout": {
    overview:
      "Organise code by business capability (orders, payments, catalog), not by technical layer (controllers, services, repositories). Each capability owns its API, logic and persistence, so a future split is a package move instead of an archaeology project.",
    terms: [
      ["Package by feature", "One package per capability, each with controller/service/repository inside."],
      ["Profile", "A named configuration set (`local`, `test`, `prod`) activated per environment."],
      ["@ConfigurationProperties", "A typed, validated binding of a config prefix into a Java object."],
    ],
    gotchas: [
      "Secrets in `application.yml` end up in git history forever; use environment variables or a secrets manager.",
      "Config that is missing should fail at startup, not at the first request in production.",
    ],
    practice:
      "Sketch your next project's package tree on paper before writing code. If it mirrors the framework's folders, redo it around features.",
  },
  git: {
    overview:
      "Git stores snapshots, not diffs, and every commit is a full tree with a parent pointer. That model is why branches are cheap, rebase is possible, and almost any mistake can be undone while the objects still exist.",
    terms: [
      ["Commit", "An immutable snapshot plus message, author and parent references."],
      ["Rebase", "Replays your commits on a new base, rewriting hashes — local branches only."],
      ["Reflog", "A local log of where HEAD and branches pointed, your undo history for lost commits."],
    ],
    gotchas: [
      "`git reset --hard` throws away uncommitted work permanently.",
      "Rewriting a shared branch forces everyone else to clean up; merge instead.",
    ],
    practice:
      "Create a branch, make three commits, squash them with an interactive rebase, then recover the originals with `git reflog`.",
  },
  "repo-hosting": {
    overview:
      "GitHub and GitLab add the collaboration layer: pull requests, reviews, protected branches, CI, issues and releases. The goal is that no change reaches main without review and a green pipeline.",
    terms: [
      ["Pull request", "A reviewable proposal to merge one branch into another, with discussion and checks attached."],
      ["Protected branch", "Rules that block direct pushes and require reviews or passing CI."],
      ["CODEOWNERS", "Maps paths to people or teams who are automatically requested for review."],
    ],
    gotchas: [
      "A PR that touches 40 files will not be reviewed properly; split it.",
      "Merge queues and required status checks are what actually keep main green — review alone does not.",
    ],
    practice:
      "Open a PR against your own repository, request your own review, and watch CI run on the branch.",
  },
  "code-reviews": {
    overview:
      "Review is a risk-reduction activity, not a style contest. The highest-value questions are about correctness at boundaries: what happens on bad input, a timeout, a retry, a missing permission, or two users at once.",
    terms: [
      ["Diff", "The exact set of changed lines a reviewer must reason about; smaller is better."],
      ["Nit", "A non-blocking preference — label it so the author knows it is optional."],
      ["Blast radius", "How much breaks if this change is wrong."],
    ],
    gotchas: [
      "Approving without running the code is common; at least read the tests to see what was actually verified.",
      "Mixing refactoring and behaviour change in one PR makes both unreviewable.",
    ],
    practice:
      "Review one of your own old PRs as if a stranger wrote it. List three questions you would ask.",
  },
  "ai-assisted": {
    overview:
      "AI assistants are good at boilerplate, unfamiliar APIs, test scaffolding and explaining code, and bad at knowing your constraints. Treat output as a fast draft from a confident junior: useful, but it must compile, pass tests and be understood by you.",
    terms: [
      ["Context", "The files and text the assistant can see; missing context is the main cause of wrong suggestions."],
      ["Hallucination", "A plausible invention — a method, config key or library version that does not exist."],
      ["Review loop", "Generate, compile, test, read the diff, then keep or discard."],
    ],
    gotchas: [
      "Never paste secrets, tokens or customer data into an unapproved tool.",
      "Accepting a large diff you cannot explain is how subtle bugs and licence problems enter a codebase.",
    ],
    practice:
      "Ask an assistant to write one test for a class you wrote, then verify the assertion actually fails when you break the code.",
  },
  "python-later": {
    overview:
      "A second language is cheapest once you can ship in the first, because you only have to learn syntax and idioms, not programming. Python's asyncio, type hints and FastAPI map closely onto virtual threads, generics and Spring's DI plus Bean Validation.",
    terms: [
      ["asyncio", "Cooperative concurrency on one thread; blocking calls stall everything unless offloaded."],
      ["Type hints", "Optional annotations checked by tools like mypy or pyright, not by the interpreter at runtime."],
      ["Pydantic", "Runtime validation and serialization from type annotations — FastAPI's DTO layer."],
    ],
    gotchas: [
      "Mixing sync and async code in FastAPI silently blocks the event loop under load.",
      "Installing packages globally leads to 'works on my machine'; use a virtualenv or uv per project.",
    ],
    practice:
      "Once, port one small endpoint from Spring Boot to FastAPI. The comparison teaches both frameworks.",
  },

  /* ---------- 03 data ---------- */
  relational: {
    overview:
      "A relational database stores rows in tables and enforces rules with constraints and foreign keys. SQL is declarative: you describe the result you want and the planner chooses how to get it — which is why `EXPLAIN` matters as much as the query text.",
    terms: [
      ["Primary key", "The column(s) that uniquely identify a row and are indexed automatically."],
      ["Join", "Combines rows from two tables on a matching condition; inner drops non-matches, left keeps them."],
      ["Constraint", "NOT NULL, UNIQUE, CHECK and FOREIGN KEY — invariants enforced regardless of application code."],
    ],
    gotchas: [
      "`NULL` is not equal to anything, including itself: use `IS NULL` and beware `NOT IN (subquery with nulls)`.",
      "`SELECT *` in production code breaks when columns change and prevents covering indexes.",
    ],
    practice:
      "Write one join with GROUP BY and HAVING against a real schema, then run `EXPLAIN ANALYZE` on it.",
  },
  "sql-engines": {
    overview:
      "PostgreSQL is the default choice, but MySQL/MariaDB, SQL Server and Oracle run a large share of production. The SQL standard gets you 90% of the way; the remaining 10% (identity columns, upserts, paging syntax, collations, types) is where migration pain lives.",
    terms: [
      ["InnoDB", "MySQL/MariaDB's transactional storage engine: row-level locks, MVCC, foreign keys."],
      ["T-SQL / PL-SQL", "SQL Server's and Oracle's procedural dialects for stored procedures, triggers and control flow."],
      ["Collation", "How text is compared and sorted — case and accent sensitivity differ per engine and per column."],
    ],
    gotchas: [
      "MySQL's default collation can make `'a' = 'A'` true, silently breaking unique email checks.",
      "Every engine has its own paging syntax (`LIMIT`, `OFFSET/FETCH`, `ROWNUM`); do not assume portability.",
    ],
    practice:
      "Take one query you wrote for PostgreSQL and rewrite its upsert and paging clauses for MySQL and SQL Server.",
  },
  normalization: {
    overview:
      "Normalisation removes duplication so one fact lives in one place: 1NF (atomic values), 2NF (no partial dependency on part of a key), 3NF (no transitive dependency between non-key columns). Denormalise only when a measured read path needs it, and then own the consistency cost.",
    terms: [
      ["Functional dependency", "When column A determines column B — the thing normal forms are about."],
      ["Denormalisation", "Deliberately duplicating data (a cached total, a copied name) to avoid a join on a hot path."],
      ["Natural vs surrogate key", "A meaningful value (email, ISBN) versus a generated id; prefer the generated one for stability."],
    ],
    gotchas: [
      "UUIDv4 primary keys fragment B-tree inserts; UUIDv7 or bigint identity is friendlier at scale.",
      "Soft deletes quietly break every unique constraint unless you include the deleted flag.",
    ],
    practice:
      "Model a simple shop (customers, orders, order lines, products) and check each table against 3NF.",
  },
  acid: {
    overview:
      "A transaction groups statements into one all-or-nothing unit. Atomicity and durability protect against crashes; isolation decides what concurrent transactions may see. Every level above read-committed costs concurrency, so choose per use case instead of globally.",
    terms: [
      ["Isolation level", "Read uncommitted, read committed, repeatable read, serializable — increasing strictness, decreasing concurrency."],
      ["MVCC", "Multi-version concurrency control: readers see a snapshot instead of blocking writers (Postgres, InnoDB)."],
      ["Lost update", "Two transactions read, both modify, the second overwrites the first — fix with locking or a version column."],
    ],
    gotchas: [
      "A remote HTTP call inside a transaction can hold locks for seconds; keep transactions short and I/O-free.",
      "Spring's `@Transactional` is proxy-based: self-invocation and private methods silently skip it.",
    ],
    practice:
      "Open two SQL sessions, update the same row in both without committing, and observe the lock.",
  },
  indexes: {
    overview:
      "An index is a sorted structure (usually a B-tree) that lets the engine jump to matching rows instead of scanning the table. The column order in a composite index decides which queries it can serve, and every index adds write cost and disk.",
    terms: [
      ["Composite index", "Ordered by several columns; usable left-to-right, so `(customer_id, created_at)` serves customer queries."],
      ["Covering index", "Contains every column the query needs, so the table is never touched."],
      ["Selectivity", "How many distinct values a column has; low selectivity (a boolean) rarely justifies an index."],
    ],
    gotchas: [
      "`WHERE lower(email) = ...` cannot use a plain index on email unless you create an expression index.",
      "Leading wildcards (`LIKE '%foo'`) force a scan; use full-text or trigram indexes instead.",
    ],
    practice:
      "Write a query with a filter and an ORDER BY, add a composite index, and compare `EXPLAIN ANALYZE` before and after.",
  },
  orm: {
    overview:
      "Spring Data JPA maps objects to tables, generates queries from method names and manages dirty checking inside a transaction. It removes boilerplate, not thinking: you still own schema design, fetch plans and SQL performance.",
    terms: [
      ["Entity", "A class mapped to a table with `@Entity`, managed by the persistence context."],
      ["Persistence context", "The per-transaction first-level cache; the same row is one object instance."],
      ["DTO / projection", "A read model separate from the entity, so the API does not leak persistence details."],
    ],
    gotchas: [
      "Serialising entities directly in JSON triggers lazy loads (and loops) at the worst moment.",
      "`save()` on a detached entity can merge, causing an extra SELECT and surprising updates.",
    ],
    practice:
      "Replace one `findAll()` list endpoint with a paginated projection and compare the SQL it generates.",
  },
  "n-plus-one": {
    overview:
      "The N+1 problem is one query for a list plus one more per item. It is invisible in tests with three rows and fatal with three hundred, so detect it by counting statements per request rather than by guessing.",
    terms: [
      ["Fetch plan", "The decision of which associations load eagerly with the parent query."],
      ["EntityGraph", "A JPA hint declaring which associations a query should fetch."],
      ["Batch fetching", "Loading associations for several parents in one `IN (...)` query."],
    ],
    gotchas: [
      "`spring.jpa.open-in-view=true` (the default) keeps a session open during rendering, hiding lazy loads until a page is big.",
      "Caching an N+1 endpoint hides the cost only until the cache misses.",
    ],
    practice:
      "Turn on SQL logging, request a list endpoint with page size 50, and count the statements in the log.",
  },
  migrations: {
    overview:
      "Migrations are versioned SQL applied in order and recorded in a history table. Flyway (or Liquibase) makes schema changes reviewable, repeatable in every environment, and safe to ship alongside code.",
    terms: [
      ["Versioned migration", "An immutable file (`V2__add_cancelled_at.sql`) that runs exactly once."],
      ["Baseline", "A starting point adopted for an existing database without replaying old scripts."],
      ["Expand and contract", "Add the new shape, backfill and dual-write, switch reads, then drop the old — never in one deploy."],
    ],
    gotchas: [
      "Editing an applied migration breaks checksums and every environment that already ran it.",
      "`ddl-auto=update` in production eventually drops or mis-types something; use `validate` plus migrations.",
    ],
    practice:
      "Create a V1 and V2 migration, run them, then deliberately change V1 and read the Flyway error.",
  },
  nosql: {
    overview:
      "NoSQL is a family, not a product: document stores model aggregates, key-value stores are dictionaries at scale, wide-column stores handle huge write volume, graph databases traverse relationships, and search engines index text. Each one gives up something relational databases do for you.",
    terms: [
      ["Aggregate", "A cluster of data read and written together (an order with its lines) — the natural unit for a document store."],
      ["Eventual consistency", "Replicas converge over time; a read right after a write may see the old value."],
      ["Denormalised copy", "Duplicated data kept in sync by the application, trading write complexity for read speed."],
    ],
    gotchas: [
      "Choosing a NoSQL store before knowing your queries locks you into access patterns you cannot change later.",
      "Joins and transactions exist but are limited; 'we will do it in the app' means you now own consistency.",
    ],
    practice:
      "List the five most frequent queries of your app, then choose a store and explain how each query is served.",
  },
  "managed-nosql": {
    overview:
      "DynamoDB and Firebase remove server operations but move the hard part into data modelling and security rules. Both reward designing the query first and both punish ad-hoc access patterns that were never planned for.",
    terms: [
      ["Partition key", "DynamoDB's distribution and lookup key; the unit of scaling and the basis of every query."],
      ["GSI", "A global secondary index giving one table an alternative partition/sort key — a second access pattern."],
      ["Security rules", "Firebase's server-side authorization for client access; the only thing between users and your data."],
    ],
    gotchas: [
      "A DynamoDB scan is a full table read — fine in development, ruinous in production.",
      "Firebase rules must be tested with the emulator; a permissive rule is a public database.",
    ],
    practice:
      "Write the access patterns for a to-do app (list by user, list by due date) and derive the DynamoDB keys for each.",
  },
  "analytics-stores": {
    overview:
      "Columnar databases store each column contiguously and compress it, so an aggregate over two columns reads a fraction of the data. ClickHouse is the common open-source choice for event and metrics workloads that would crush a transactional database.",
    terms: [
      ["Columnar storage", "Data stored per column, optimised for scanning a few columns over many rows."],
      ["MergeTree", "ClickHouse's main table engine; background merges keep parts sorted by the sorting key."],
      ["Materialised view", "A pre-aggregated result maintained as data arrives — dashboards read it instead of raw events."],
    ],
    gotchas: [
      "Row-by-row inserts destroy ClickHouse performance; batch writes of thousands of rows.",
      "No real updates or deletes per row — model events as append-only and use `ReplacingMergeTree` when needed.",
    ],
    practice:
      "Load 100k synthetic events into ClickHouse and compare a GROUP BY by day against the same query in PostgreSQL.",
  },
  /* ---------- 04 APIs ---------- */
  rest: {
    overview:
      "REST is a set of conventions, not a standard: model nouns as resources, use HTTP methods for the action, and let status codes carry the outcome. Predictability is the actual product — a client should be able to guess your endpoint after learning three of them.",
    terms: [
      ["Resource", "A thing clients can address (`/orders/123`), never a verb (`/getOrder`)."],
      ["Cursor pagination", "Paging with an opaque `after` token instead of an offset, so pages stay stable while rows are inserted."],
      ["Idempotency key", "A client-generated id stored by the server so a retried POST creates only one resource."],
    ],
    gotchas: [
      "Deep offsets get slower and duplicate rows when the underlying data changes between pages.",
      "Exposing database ids directly leaks volume and invites enumeration; prefer unguessable ids.",
    ],
    practice:
      "Design the five endpoints for a bookmark service on paper, with status codes and error cases, before coding.",
  },
  openapi: {
    overview:
      "OpenAPI is a machine-readable description of your API: paths, schemas, statuses, auth. Generate it from code with springdoc so it cannot drift, then use it to render docs, generate clients and test contracts.",
    terms: [
      ["Schema", "A reusable definition of a request or response body, including validation rules."],
      ["springdoc-openapi", "The Spring Boot library that derives an OpenAPI document from your controllers and annotations."],
      ["Contract test", "A test that fails when the real API stops matching the published spec."],
    ],
    gotchas: [
      "A spec without error responses and examples is a happy-path brochure, not documentation.",
      "Leaving Swagger UI enabled in production exposes your whole surface to scanners.",
    ],
    practice:
      "Add springdoc to a project, open `/swagger-ui.html`, and fix one inaccurate description you find.",
  },
  "versioning-errors": {
    overview:
      "Version when you must break clients, and design so you rarely must: add fields, never repurpose them, and keep old shapes working during a deprecation window. Errors deserve the same design effort as success responses, because they are what clients actually have to handle.",
    terms: [
      ["Breaking change", "Renaming, removing or retyping a field, changing a status code, or tightening validation."],
      ["Problem Details", "RFC 9457's JSON error shape (`type`, `title`, `status`, `detail`, plus extensions)."],
      ["Deprecation window", "The period both versions run while clients migrate — announce it with headers and docs."],
    ],
    gotchas: [
      "Returning a stack trace helps attackers map your internals and helps nobody else.",
      "Silently changing a field's meaning is worse than renaming it.",
    ],
    practice:
      "Write your error contract once — codes, message shape, when each status is used — and reuse it in every controller.",
  },
  graphql: {
    overview:
      "GraphQL exposes one typed endpoint where clients choose the fields they need. That flexibility is valuable for many varied clients, and expensive when a single query can trigger unbounded work, so depth limits and batched data loading are not optional.",
    terms: [
      ["Resolver", "The function that produces one field's value; resolvers compose into a query."],
      ["DataLoader", "A batching and caching utility that turns N resolver lookups into one query."],
      ["Query complexity", "A computed cost per query, used to reject expensive requests before executing them."],
    ],
    gotchas: [
      "Naive resolvers recreate N+1 at every nesting level, often far worse than REST.",
      "HTTP caching barely applies; you need persisted queries or a client-side cache instead.",
    ],
    practice:
      "Model a schema for orders and customers, then list which resolvers would need batching.",
  },
  "grpc-soap": {
    overview:
      "gRPC sends protobuf over HTTP/2 for compact, typed, streaming service-to-service calls. SOAP is the XML incumbent in enterprise integrations: heavier, WSDL-described, and still very much alive in banking, telecom and government systems.",
    terms: [
      ["Protobuf", "A binary schema-and-serialization format; fields are numbered and must never be reused."],
      ["Streaming RPC", "Client, server or bidirectional streams for long-lived flows like subscriptions or uploads."],
      ["WSDL", "The XML contract describing a SOAP service's operations, types and endpoint."],
    ],
    gotchas: [
      "Breaking protobuf compatibility by changing a field's type or number is silent and painful.",
      "gRPC needs HTTP/2 end to end; some load balancers and browsers need extra configuration.",
    ],
    practice:
      "Define a three-message .proto, generate Java classes, and call it from a test.",
  },
  authn: {
    overview:
      "Authentication establishes identity, and there are only a few honest options: server-side sessions with a cookie, signed tokens like JWT, or delegated login via OAuth2/OIDC. Whichever you pick, credentials must be hashed, tokens short-lived, and identity never taken from a client-supplied field.",
    terms: [
      ["JWT", "A signed, base64url-encoded claim set; readable by anyone, verifiable by anyone with the key."],
      ["Refresh token", "A long-lived credential used to obtain new short-lived access tokens, and revocable server-side."],
      ["MFA", "A second factor (TOTP, passkey, hardware key) that limits the damage of a stolen password."],
    ],
    gotchas: [
      "A JWT is not encrypted — putting an email or role in it makes it readable by every client.",
      "Logging out a JWT means a revocation list or short expiry; deleting it client-side is not logout.",
    ],
    practice:
      "Add BCrypt password hashing and a login endpoint to a small app, then inspect the stored hash.",
  },
  "session-auth": {
    overview:
      "These are three transports for the same question. Basic auth sends credentials every time, cookie sessions let the browser attach a server-managed session automatically, and bearer tokens make the client responsible for storage and attachment.",
    terms: [
      ["HttpOnly / Secure / SameSite", "Cookie flags that block JavaScript access, require HTTPS, and limit cross-site sending."],
      ["CSRF", "An attack that rides a victim's cookies; prevented by SameSite plus a token the attacker cannot read."],
      ["Opaque token", "A random string with no embedded claims, validated by a server-side lookup and easy to revoke."],
    ],
    gotchas: [
      "localStorage tokens are readable by any XSS; HttpOnly cookies survive XSS but need CSRF protection.",
      "Basic auth over plain HTTP exposes the password on every request.",
    ],
    practice:
      "Log in with curl using a cookie jar (`-c` then `-b`) and inspect the Set-Cookie flags.",
  },
  authz: {
    overview:
      "Authorization decides what an authenticated principal may do. Roles cover coarse access, scopes cover API capabilities, and ownership checks cover the rest — and they must run on the server for every object, every time.",
    terms: [
      ["RBAC", "Role-based access control: users get roles, roles get permissions."],
      ["ABAC / policy", "Attribute-based rules evaluated per request (`owner == user`, `tenant == claim`)."],
      ["OAuth2 scope", "A permission string granted to a token, e.g. `orders:read`, enforced by the resource server."],
    ],
    gotchas: [
      "Checking a role but not ownership lets any customer read every order by changing the id.",
      "Returning 403 instead of 404 for someone else's resource confirms the resource exists.",
    ],
    practice:
      "Write the authorization matrix for your app (roles × actions) and add one ownership test.",
  },
  "saml-oidc": {
    overview:
      "Enterprise single sign-on delegates authentication to an identity provider. SAML 2.0 posts a signed XML assertion to your endpoint; OpenID Connect returns a signed JWT ID token. Both are integration projects as much as coding projects, dominated by metadata, certificates and clock skew.",
    terms: [
      ["IdP / SP", "Identity provider (authenticates) and service provider (your application)."],
      ["Assertion", "SAML's signed statement about a user, including attributes and audience restrictions."],
      ["`sub` claim", "OIDC's stable, unique user identifier — the only claim safe to key accounts on."],
    ],
    gotchas: [
      "Skipping audience, recipient or expiry validation makes assertions replayable.",
      "Mapping users by email breaks when someone changes their name or address.",
    ],
    practice:
      "Set up a free OIDC provider (or Keycloak locally) and log in with Spring Security's OAuth2 client.",
  },
  "api-security": {
    overview:
      "APIs are attacked by automation, so design for abuse: authenticate everything, limit request size and rate, validate content types, allowlist origins, and log sensitive actions without logging secrets. Assume every endpoint is public and reachable.",
    terms: [
      ["Rate limit", "A cap on requests per key/IP/time window, usually returning 429 with Retry-After."],
      ["Mass assignment", "Binding request fields straight onto an entity, letting callers set fields they should not."],
      ["Audit log", "An append-only record of security-relevant actions with actor, time and target."],
    ],
    gotchas: [
      "`@RequestBody` into an entity is a privilege-escalation bug waiting for a `role` field.",
      "Stack traces and SQL in error responses are free reconnaissance.",
    ],
    practice:
      "Add a body-size limit and a per-IP rate limit to one endpoint, then verify with a loop of curl calls.",
  },

  /* ---------- 05 caching & search ---------- */
  "http-caching": {
    overview:
      "HTTP caching is free performance and correctness at once. `Cache-Control` says who may store a response and for how long; `ETag` plus `If-None-Match` lets a client revalidate and receive a cheap 304 instead of the full body.",
    terms: [
      ["max-age", "Seconds a response stays fresh without revalidation."],
      ["ETag", "A validator (usually a hash or version) the client sends back to check for changes."],
      ["CDN", "A shared cache near users that only stores responses explicitly marked public."],
    ],
    gotchas: [
      "Marking per-user responses `public` leaks one user's data to another through the CDN.",
      "Changing a URL's content without changing its ETag serves stale data forever.",
    ],
    practice:
      "Add ETag and Cache-Control to a read endpoint, then confirm a second curl with If-None-Match returns 304.",
  },
  redis: {
    overview:
      "Redis is an in-memory data structure server: strings, hashes, lists, sets, sorted sets, streams, plus TTLs and atomic operations. That makes it a cache, a session store, a rate limiter and a lightweight queue — all with the caveat that memory is finite and persistence is a trade-off.",
    terms: [
      ["TTL", "An expiry per key; without it a cache grows until eviction or crash."],
      ["Eviction policy", "What Redis drops when memory is full (`allkeys-lru` for caches, `noeviction` for data you cannot lose)."],
      ["Sorted set", "A set ordered by score — leaderboards, rate-limit windows, scheduled work."],
    ],
    gotchas: [
      "Using one Redis instance for cache and critical queue data means a flush evicts your jobs.",
      "`KEYS *` blocks the single-threaded server; use `SCAN`.",
    ],
    practice:
      "Cache one endpoint with `@Cacheable`, expire it after 60s, and watch the second request skip the database.",
  },
  "cache-patterns": {
    overview:
      "Cache-aside is the default: read the cache, load on a miss, write the result with a TTL, and keep writes going to the database first. The other patterns trade write latency and consistency in ways that only pay off for specific workloads.",
    terms: [
      ["Cache-aside", "The application manages reads and population; the cache is a side structure."],
      ["Write-through", "Writes go through the cache to the database, keeping both in step at the cost of write latency."],
      ["Key versioning", "Including a version in the key (`product:v3:42`) so an incompatible shape is never read."],
    ],
    gotchas: [
      "Caching nulls or errors without a short TTL turns a blip into a long outage.",
      "Synchronised TTLs on hot keys cause periodic stampedes; add jitter.",
    ],
    practice:
      "Implement cache-aside manually with RedisTemplate before using annotations, so you see each step.",
  },
  invalidation: {
    overview:
      "Invalidation is a consistency decision: how stale may this data be, and who pays for it? Delete on write and let the next read rebuild, accept bounded staleness for feeds, and demand fresh reads for money, permissions and inventory.",
    terms: [
      ["Delete on write", "Evict the key after committing the write; simpler and less race-prone than updating in place."],
      ["Stale-while-revalidate", "Serve stale content briefly while refreshing in the background."],
      ["Thundering herd", "Many requests missing the same key at once and hammering the database."],
    ],
    gotchas: [
      "Evicting before the transaction commits lets a concurrent read repopulate the old value.",
      "Two writers updating the cache and database in different orders leave permanent divergence.",
    ],
    practice:
      "Write a test that updates an entity and asserts the cache key is gone and the next read returns the new value.",
  },
  search: {
    overview:
      "A search engine builds an inverted index (term to documents) with analyzers that tokenise and normalise text. That enables relevance ranking, highlighting and faceting that `LIKE` cannot do — at the cost of a second system to keep in sync.",
    terms: [
      ["Analyzer", "The tokeniser plus filters that decide what is indexed and how queries are matched."],
      ["Relevance score", "A computed ranking (BM25 by default in Elasticsearch/OpenSearch) based on term frequency and rarity."],
      ["Reindex", "Rebuilding the index from the source of truth after a mapping change."],
    ],
    gotchas: [
      "Changing an analyzer requires reindexing; design mappings before loading real data.",
      "Indexing synchronously in the request path makes search outages break writes.",
    ],
    practice:
      "Use PostgreSQL full-text search (`tsvector` + GIN index) first, then decide if you need Elasticsearch.",
  },
  "rate-limiting": {
    overview:
      "Rate limiting protects capacity and fairness. Token bucket allows bursts up to a bucket size; sliding windows smooth them; quotas cap longer periods. Whatever the algorithm, tell the client with 429, `Retry-After` and documented limits.",
    terms: [
      ["Token bucket", "Tokens refill at a fixed rate; each request spends one, allowing short bursts."],
      ["Distributed counter", "Shared state (usually Redis) so several instances enforce one global limit."],
      ["429 Too Many Requests", "The standard refusal status, ideally with rate-limit headers."],
    ],
    gotchas: [
      "In-memory counters per instance multiply your real limit by the instance count.",
      "Limiting only by IP breaks users behind corporate NAT and misses authenticated abuse.",
    ],
    practice:
      "Implement per-API-key limits in Redis with a fixed window, then write a test that hits the limit.",
  },

  /* ---------- 06 testing & delivery ---------- */
  "unit-testing": {
    overview:
      "A unit test exercises one behaviour with no framework, network or filesystem. Fast, deterministic tests let you refactor with confidence, so the value comes from testing rules and edge cases rather than from a coverage number.",
    terms: [
      ["JUnit 5", "The test framework: `@Test`, lifecycle hooks, parameterised tests, assertions."],
      ["AssertJ", "Fluent assertions (`assertThat(x).isEqualTo(y)`) with readable failure messages."],
      ["Mockito", "Creates test doubles for collaborators so you can assert interactions and simulate failures."],
    ],
    gotchas: [
      "Mocking everything tests your mocks, not your code — mock only I/O boundaries.",
      "A test that passes regardless of the code (no assertion, or asserting a constant) is worse than no test.",
    ],
    practice:
      "Write a test for your slug generator covering an empty input, a very long input and a collision.",
  },
  "integration-testing": {
    overview:
      "Integration tests run the real framework: HTTP layer, JSON serialization, validation, security filters and actual SQL. Testcontainers gives you a real PostgreSQL in Docker, so the test environment stops being a polite fiction.",
    terms: [
      ["MockMvc", "Drives Spring MVC without a network port, exercising filters and serialization."],
      ["Testcontainers", "JUnit integration that starts real Docker containers and injects their connection details."],
      ["@SpringBootTest", "Boots the application context for the test; slower, so use it where wiring matters."],
    ],
    gotchas: [
      "H2 in PostgreSQL mode is not PostgreSQL; it accepts SQL and types production will reject.",
      "Container reuse speeds tests up but can leak state between runs if you share a database.",
    ],
    practice:
      "Write one MockMvc test that posts invalid JSON and asserts a 400 with a problem detail body.",
  },
  "functional-testing": {
    overview:
      "Functional and end-to-end tests verify whole journeys through a deployed stack. They are slow and flaky, so keep them few, focused on revenue-critical paths, and stable enough that a failure always means something.",
    terms: [
      ["E2E test", "Drives the real UI and backend together; highest confidence, highest maintenance."],
      ["Smoke test", "A tiny set of checks run right after deploy to prove the app is alive."],
      ["Consumer-driven contract", "A consumer's expectation published as a test the provider must satisfy (Pact)."],
    ],
    gotchas: [
      "Using sleeps instead of waiting for a condition is the number one source of flaky tests.",
      "E2E tests sharing one account in parallel will fail unpredictably.",
    ],
    practice:
      "Write three E2E checks: sign up, use the core feature, delete the account.",
  },
  "test-data": {
    overview:
      "Tests must own their data. Unique identifiers per test, transactions rolled back or tables truncated between tests, and factories with sensible defaults keep tests independent and parallel-safe.",
    terms: [
      ["Factory", "A helper that builds valid objects with overridable defaults (`aLink().withSlug(\"abc\").build()`)."],
      ["Isolation", "No test can see or depend on another test's rows."],
      ["Fixture", "Fixed reference data (countries, plans) loaded once per suite."],
    ],
    gotchas: [
      "A shared test database with leftover rows makes tests pass in one order and fail in another.",
      "Hard-coded dates make tests expire; freeze the clock explicitly.",
    ],
    practice:
      "Extract a small factory for your main entity and remove every inline `new Entity(...)` from tests.",
  },
  "ci-cd": {
    overview:
      "Continuous integration runs build, tests and static checks on every push; continuous delivery produces a deployable artifact and promotes the same artifact through environments. The pipeline is the only path to production, so it must run the same commands you run locally.",
    terms: [
      ["Pipeline", "Ordered stages (build, test, package, deploy) with fail-fast behaviour."],
      ["Artifact", "The immutable output — a jar or image — identified by commit hash."],
      ["Rollback", "Reverting to the previous artifact quickly, which requires versioned deploys and compatible schema changes."],
    ],
    gotchas: [
      "Building a fresh image per environment means you never test what you ship.",
      "Deploys without health checks turn a bad release into a full outage instead of a failed rollout.",
    ],
    practice:
      "Create a workflow that runs `mvn -B verify` on pull requests and builds an image only on main.",
  },
  "quality-gates": {
    overview:
      "Static analysis finds the boring defects before users do: null handling, resource leaks, unsafe deserialization, unused code, vulnerable dependencies. Gate on new findings so the team does not inherit an impossible backlog.",
    terms: [
      ["SpotBugs", "Bytecode analysis for bug patterns in Java."],
      ["Dependency scanning", "Checks libraries against CVE databases (OWASP Dependency-Check, Dependabot)."],
      ["Coverage delta", "Coverage of changed lines, a more meaningful signal than total percentage."],
    ],
    gotchas: [
      "A coverage target invites tests that execute code without asserting anything.",
      "Failing the build on 500 legacy warnings means the gate gets disabled within a week.",
    ],
    practice:
      "Add SpotBugs and one dependency-scan step to CI, and fix the first finding it reports.",
  },

  /* ---------- 07 security ---------- */
  tls: {
    overview:
      "TLS gives you confidentiality, integrity and server identity through a certificate chain. The handshake negotiates keys, the client verifies the chain against trusted roots, and all traffic after that is encrypted — including headers and cookies.",
    terms: [
      ["Certificate chain", "Leaf, intermediate and root certificates that let a client verify who signed yours."],
      ["SNI", "The hostname sent during the handshake so one IP can serve many certificates."],
      ["HSTS", "A header telling browsers to refuse plain HTTP for your domain for a set period."],
    ],
    gotchas: [
      "An expired certificate is a total outage; automate renewal and alert on 14 days remaining.",
      "Mixed content (an http:// asset on an https page) is blocked by browsers, sometimes silently.",
    ],
    practice:
      "Run `openssl s_client -connect example.com:443 -servername example.com` and read the chain and expiry.",
  },
  hashing: {
    overview:
      "Passwords need a deliberately slow, salted hash: BCrypt, scrypt or Argon2. Fast hashes like SHA-256 are built for integrity, not secrecy — an attacker with a GPU tries billions of candidates per second against them.",
    terms: [
      ["Salt", "Random per-password data mixed in so identical passwords produce different hashes."],
      ["Work factor", "The cost parameter (BCrypt rounds, Argon2 memory/time) you tune to your hardware."],
      ["HMAC", "A keyed hash for verifying message integrity and authenticity, not for storing passwords."],
    ],
    gotchas: [
      "Encrypting passwords reversibly means one leaked key exposes every account.",
      "Comparing hashes with `==` leaks timing information; use the library's constant-time check.",
    ],
    practice:
      "Hash the same password twice with BCrypt and confirm the two hashes differ but both verify.",
  },
  owasp: {
    overview:
      "The OWASP Top 10 is a map of recurring failure modes: broken access control, injection, insecure design, misconfiguration, vulnerable components, auth failures, integrity failures, logging gaps, SSRF. Most incidents are one of these, done accidentally.",
    terms: [
      ["Broken access control", "Users reaching data or actions they should not — the most common serious finding."],
      ["Injection", "Untrusted input interpreted as code or query (SQL, LDAP, shell, templates)."],
      ["SSRF", "Server-side request forgery: making your server call an internal address on the attacker's behalf."],
    ],
    gotchas: [
      "String-concatenated SQL is still trivially exploitable in 2026; parameterise everything.",
      "Authorising in the UI only means the API is open to anyone with curl.",
    ],
    practice:
      "Pick one endpoint and write down every way an attacker could read another user's data through it.",
  },
  cors: {
    overview:
      "CORS is the browser's rule for reading cross-origin responses. The server sends `Access-Control-Allow-Origin` (and related headers); the browser decides whether to expose the result. It is not authentication and it does not stop non-browser clients.",
    terms: [
      ["Origin", "Scheme + host + port; a different port is a different origin."],
      ["Preflight", "An OPTIONS request for methods/headers that are not 'simple'."],
      ["Credentials mode", "Sending cookies cross-origin requires explicit opt-in on both client and server."],
    ],
    gotchas: [
      "`*` plus `Allow-Credentials: true` is invalid and gets rejected by browsers.",
      "Reflecting any Origin header back effectively disables the protection while looking configured.",
    ],
    practice:
      "Trigger a CORS error on purpose, then fix it by allowlisting one exact origin, and read the preflight request.",
  },
  headers: {
    overview:
      "Response headers reduce browser attack surface cheaply. A Content-Security-Policy limits what scripts may run, `nosniff` stops content-type guessing, and frame protections block clickjacking. Start in report-only mode, then tighten.",
    terms: [
      ["CSP", "An allowlist of script, style, image and frame sources, with nonces or hashes for inline code."],
      ["X-Content-Type-Options: nosniff", "Stops browsers from treating a file as a different type than declared."],
      ["frame-ancestors", "The CSP directive that decides who may embed your pages."],
    ],
    gotchas: [
      "A CSP with `unsafe-inline` and `*` looks impressive and protects almost nothing.",
      "Headers are trivially stripped by misconfigured proxies; verify them on the real deployment.",
    ],
    practice:
      "Check your headers at securityheaders.com or with curl -I, then fix the two cheapest gaps.",
  },
  secrets: {
    overview:
      "Secrets are credentials your app needs to run: database passwords, API keys, signing keys. They belong in a secrets manager or environment injection at deploy time — never in git, images, logs or frontend bundles.",
    terms: [
      ["Secret manager", "A service that stores, versions, audits and injects secrets (Vault, AWS Secrets Manager, platform env vars)."],
      ["Rotation", "Replacing a credential on a schedule, with both values valid during the overlap."],
      ["Least privilege", "Each credential can do only what its service needs, so a leak is contained."],
    ],
    gotchas: [
      "A secret committed once stays in history after deletion; rotate it, do not just remove the file.",
      "Frontend bundles are public — any key in them is already leaked.",
    ],
    practice:
      "Move one hard-coded credential to an environment variable and verify the app starts without it failing loudly.",
  },
  hardening: {
    overview:
      "Hardening is reducing what an attacker can do after a small mistake: run as non-root, use minimal images, patch the runtime, set timeouts everywhere, disable debug endpoints and fail closed on authorization.",
    terms: [
      ["Least privilege", "The process, user and credentials have only the permissions they need."],
      ["Fail closed", "On error, deny access; default-allow on failure is how authorization gets bypassed."],
      ["Attack surface", "Every port, endpoint, dependency and debug feature reachable by an outsider."],
    ],
    gotchas: [
      "An unbounded outbound call holds threads and becomes a self-inflicted denial of service.",
      "Actuator endpoints exposed publicly can leak config, heap dumps and environment variables.",
    ],
    practice:
      "Run your container as a non-root user with a read-only filesystem and check it still starts.",
  },

  /* ---------- 08 architecture ---------- */
  monolith: {
    overview:
      "Almost every system should start as one deployable with clear internal modules. Microservices are a scaling and ownership strategy that adds network failure, eventual consistency and deployment coordination — worth it only when independent teams or independent scaling actually demand it.",
    terms: [
      ["Modular monolith", "One deployable with enforced module boundaries and no cross-module database access."],
      ["Bounded context", "A boundary within which one model and one vocabulary are consistent."],
      ["Distributed transaction", "Coordinating a change across services, usually replaced by sagas and idempotent steps."],
    ],
    gotchas: [
      "Splitting by technical layer (controllers service, data service) gives you all the pain of distribution and none of the isolation.",
      "A shared database across services is a distributed monolith — the worst of both worlds.",
    ],
    practice:
      "Draw your modules and their allowed dependencies; if any module reaches into another's tables, fix that first.",
  },
  "soa-mesh": {
    overview:
      "Service-oriented architecture organises systems as cooperating services with explicit contracts. A service mesh moves network concerns — mTLS, retries, timeouts, traffic splitting, telemetry — into sidecars or ambient proxies so each service does not reimplement them.",
    terms: [
      ["Sidecar", "A proxy container next to each service that intercepts its traffic."],
      ["mTLS", "Mutual TLS: both sides present certificates, so services authenticate each other."],
      ["Traffic splitting", "Sending a percentage of requests to a new version for canary releases."],
    ],
    gotchas: [
      "A mesh is a platform investment; for three services the operational cost usually exceeds the benefit.",
      "Retries configured both in the mesh and the client multiply load during an outage.",
    ],
    practice:
      "List the cross-cutting concerns (auth, retries, metrics) each of your services currently duplicates.",
  },
  "twelve-factor": {
    overview:
      "The twelve-factor app is a checklist for deployability: config in the environment, stateless processes, explicit dependencies, disposability, dev/prod parity, logs as streams. It is the reason a Spring Boot jar runs identically on a laptop and in Kubernetes.",
    terms: [
      ["Stateless process", "Any instance can serve any request; state lives in a database, cache or object store."],
      ["Disposability", "Instances start fast, shut down gracefully and can be killed at any time."],
      ["Dev/prod parity", "Same database engine, same backing services, minimal time gap between deploy and production."],
    ],
    gotchas: [
      "Local files written to disk vanish on the next deploy; use object storage.",
      "Different database engines in dev and prod is how H2-only SQL bugs reach production.",
    ],
    practice:
      "Audit your app for local file writes, in-memory sessions and hard-coded URLs — remove one.",
  },
  kafka: {
    overview:
      "Kafka is a durable, append-only log split into partitions. Producers append records, consumers track offsets per group, and records stay readable after consumption, which enables replay and multiple independent consumers.",
    terms: [
      ["Partition", "The unit of ordering and parallelism; a key always maps to the same partition."],
      ["Consumer group", "Consumers sharing a group split partitions between them, each partition read by one member."],
      ["Outbox pattern", "Write the event to a database table in the same transaction, then publish it from there reliably."],
    ],
    gotchas: [
      "Publishing inside a database transaction is not atomic — a crash can lose the event or publish for a rolled-back write.",
      "At-least-once delivery means duplicates; a consumer without idempotency will double-charge or double-count.",
    ],
    practice:
      "Run Kafka in Docker, publish ten keyed events, and read them back with a console consumer.",
  },
  rabbitmq: {
    overview:
      "RabbitMQ is a message broker built around exchanges, bindings and queues. Producers publish to an exchange, routing rules deliver to queues, and consumers acknowledge work. It excels at task distribution, routing and per-message retry — not at replaying history.",
    terms: [
      ["Exchange", "Receives published messages and routes them to queues by direct, topic, fanout or header rules."],
      ["Ack", "Confirmation that a message was processed; unacked messages are redelivered on disconnect."],
      ["Dead-letter queue", "Where messages go after repeated failures, so poison messages stop blocking the queue."],
    ],
    gotchas: [
      "Acking before the work completes loses messages on crash.",
      "Redelivery is not ordering — design handlers to be idempotent and safe to repeat.",
    ],
    practice:
      "Build a worker that consumes a queue, fails on bad input, and send that message to a dead-letter queue.",
  },
  realtime: {
    overview:
      "Choose the simplest transport that meets the latency need: polling for minutes, long polling for seconds, SSE for one-way streams, WebSockets for bidirectional low latency. Every persistent connection costs memory and needs its own authentication and lifecycle handling.",
    terms: [
      ["SSE", "Server-sent events: a one-way HTTP stream that reconnects automatically."],
      ["WebSocket", "A full-duplex connection upgraded from HTTP, with no automatic reconnection or delivery guarantee."],
      ["Fan-out", "Delivering one event to many subscribers; needs shared state (Redis pub/sub, Kafka) across instances."],
    ],
    gotchas: [
      "Authenticating only at the page load leaves the socket open to anyone who reconnects.",
      "In-memory subscriber maps break the moment you run two instances.",
    ],
    practice:
      "Add an SSE endpoint that streams a counter every second and watch it reconnect when you restart the server.",
  },
  containers: {
    overview:
      "A container is a process isolated with namespaces and limited by cgroups, sharing the host kernel. That makes it much lighter than a VM, while LXC/LXD offers a middle ground: long-lived system containers with their own init, closer to a lightweight VM.",
    terms: [
      ["Image layer", "Each Dockerfile instruction adds a cached layer; order instructions so dependencies cache before source."],
      ["Namespace / cgroup", "Kernel features that hide resources from a process and cap what it may use."],
      ["Probe", "Kubernetes readiness (send traffic?), liveness (restart?) and startup checks."],
    ],
    gotchas: [
      "A container is not a security boundary as strong as a VM; do not run untrusted workloads side by side.",
      "Copying the whole project before installing dependencies invalidates the layer cache on every change.",
    ],
    practice:
      "Write a multi-stage Dockerfile for the Spring Boot app, then compare image size with a single-stage build.",
  },
  "web-servers": {
    overview:
      "A reverse proxy sits in front of your app to terminate TLS, serve static files, compress, cache, rate-limit and route. Nginx is the default, Caddy automates certificates, and Apache remains widespread behind legacy `.htaccess` deployments.",
    terms: [
      ["Reverse proxy", "A server that forwards requests to your app and returns its response."],
      ["X-Forwarded-For / Proto", "Headers the proxy adds so the app can see the real client IP and scheme."],
      ["Upstream", "The backend server (or pool) the proxy forwards to."],
    ],
    gotchas: [
      "Ignoring forwarded headers makes every client look like the proxy IP in logs and rate limits.",
      "Proxy timeouts shorter than your slowest endpoint produce 504s that look like app failures.",
    ],
    practice:
      "Put Nginx in front of your app locally, forward `/api` to it, and confirm the client IP appears in the logs.",
  },

  /* ---------- 09 scale & reliability ---------- */
  "scaling-basics": {
    overview:
      "Scaling means removing the binding constraint. Vertical scaling adds resources to one machine; horizontal scaling adds machines, which requires statelessness. Always find the bottleneck first — CPU, memory, connections, locks or a downstream service — because guessing buys hardware you do not need.",
    terms: [
      ["Bottleneck", "The resource at 100% that caps throughput for everything else."],
      ["Statelessness", "No request depends on state held in a specific instance's memory."],
      ["Capacity planning", "Estimating load and headroom before an event rather than during it."],
    ],
    gotchas: [
      "Scaling the app when the database is the bottleneck adds load to the real problem.",
      "Connection pools multiply with instances and can exhaust the database's connection limit.",
    ],
    practice:
      "Load test one endpoint, record p95 latency and error rate, then find which resource saturates first.",
  },
  "load-balancing": {
    overview:
      "A load balancer spreads requests across healthy instances and removes unhealthy ones. Readiness decides who receives traffic; liveness decides who gets restarted — confusing them is how a bad deploy becomes a restart loop.",
    terms: [
      ["Round robin / least connections", "Simple rotation versus sending to the least busy instance."],
      ["Readiness probe", "Reports whether this instance should receive traffic right now."],
      ["Connection draining", "Letting in-flight requests finish before shutting an instance down."],
    ],
    gotchas: [
      "A liveness probe that checks the database restarts every instance during a database blip.",
      "Sticky sessions hide statefulness instead of removing it, and break on scale-in.",
    ],
    practice:
      "Run two instances behind a local proxy, kill one, and confirm traffic continues without errors.",
  },
  "db-scaling": {
    overview:
      "Databases scale in steps: indexes and query tuning, then connection pooling, then read replicas, then partitioning, and only finally sharding. Each step adds operational complexity and consistency questions you must answer deliberately.",
    terms: [
      ["Read replica", "A copy that serves reads, with replication lag you must tolerate."],
      ["Connection pool", "A bounded set of reused connections; size it to the database, not to your thread count."],
      ["Sharding", "Splitting rows across independent databases by a shard key, making cross-shard queries your problem."],
    ],
    gotchas: [
      "Reading your own write from a lagging replica shows the user stale data right after saving.",
      "Caching to avoid scaling the database often hides the missing index that caused the load.",
    ],
    practice:
      "Use `pg_stat_statements` (or your engine's equivalent) to find the slowest query, then index it.",
  },
  "failure-modes": {
    overview:
      "Distributed systems fail partially: one dependency is slow while everything else is fine. Timeouts, bounded retries with jitter, bulkheads and circuit breakers stop a local problem from consuming every thread and cascading into a full outage.",
    terms: [
      ["Timeout", "An upper bound on waiting; without one, a slow dependency blocks a thread indefinitely."],
      ["Retry amplification", "Retries multiplying across layers and turning a blip into a storm."],
      ["Bulkhead", "Separate pools per dependency so one saturation cannot starve the rest."],
    ],
    gotchas: [
      "Retrying non-idempotent writes duplicates charges and orders.",
      "A timeout longer than the caller's timeout wastes resources on work nobody is waiting for.",
    ],
    practice:
      "Add a 2s timeout and one retry with jitter to an HTTP client, then test against a deliberately slow stub.",
  },
  mitigation: {
    overview:
      "Mitigation is deciding in advance how the system behaves when a dependency is unhealthy: fail fast with a circuit breaker, shed or queue load, degrade non-essential features, and recover gradually with probes rather than a thundering herd.",
    terms: [
      ["Circuit breaker", "Closed, open, half-open states that stop calls while a dependency is failing and test recovery."],
      ["Backpressure", "Slowing or rejecting work when the system cannot keep up instead of buffering until it dies."],
      ["Graceful degradation", "Serving a reduced but useful experience rather than an error page."],
    ],
    gotchas: [
      "A fallback that returns fake data silently is worse than an honest error.",
      "Circuit breakers configured per instance need shared thresholds or they flap independently.",
    ],
    practice:
      "Wrap one flaky call in Resilience4j with a circuit breaker and a documented fallback, then trip it in a test.",
  },
  observability: {
    overview:
      "Observability answers questions you did not know to ask, using metrics (aggregates), logs (events) and traces (request paths). Instrument the golden signals, correlate by trace id, and alert on user-visible symptoms rather than raw resource usage.",
    terms: [
      ["Golden signals", "Latency, traffic, errors, saturation — the four metrics worth dashboards first."],
      ["Trace / span", "A request's journey across services, made of timed spans with a shared id."],
      ["Structured log", "JSON with stable field names, queryable by trace id, user and outcome."],
    ],
    gotchas: [
      "Percentiles matter: a p50 of 40ms can hide a p99 of four seconds.",
      "Logging full request bodies leaks passwords and personal data into a third-party system.",
    ],
    practice:
      "Expose `/actuator/prometheus`, add a trace-id log pattern, and make one request to see both.",
  },
  profiling: {
    overview:
      "Profiling finds where time and memory actually go. JFR and async-profiler give low-overhead CPU and allocation samples; heap dumps show what is retained; query plans show what the database does. Measure, change one thing, measure again.",
    terms: [
      ["Flame graph", "A stacked visualization where width is time spent, making hot paths obvious."],
      ["Heap dump", "A snapshot of live objects, used to find leaks and retention paths."],
      ["GC pause", "Time the JVM spends collecting garbage; long pauses show up as latency spikes."],
    ],
    gotchas: [
      "Optimising without a baseline means you cannot prove improvement.",
      "Micro-benchmarks without JMH mislead because of JIT warmup and dead-code elimination.",
    ],
    practice:
      "Record a 30-second JFR profile while load-testing, and identify the top three methods by CPU.",
  },

  /* ---------- 10 AI ---------- */
  "llm-basics": {
    overview:
      "A language model predicts the next token from the context you give it. It has no access to your database, no memory between calls, and no guarantee of factual accuracy — so backend design is about supplying context, constraining output, and handling non-determinism.",
    terms: [
      ["Token", "A sub-word chunk; pricing, limits and latency are all measured in tokens."],
      ["Context window", "The maximum tokens a model can consider per call, prompt plus output."],
      ["Temperature", "Randomness: low for extraction and classification, higher for brainstorming."],
    ],
    gotchas: [
      "Models confidently invent methods, citations and numbers; validate anything factual.",
      "Sending a whole document per request is expensive and slow — retrieve only relevant chunks.",
    ],
    practice:
      "Call a model with the same prompt three times at temperature 0 and 1, and compare the outputs.",
  },
  prompting: {
    overview:
      "A production prompt is an interface: instructions, constraints, examples and an output schema. Ask for JSON, validate it server-side, and require citations so the answer is checkable. Prompt changes deserve the same review as code.",
    terms: [
      ["Few-shot", "Providing examples of the desired input/output to shape behaviour."],
      ["Structured output", "Requesting a JSON schema or tool call so the response parses deterministically."],
      ["Groundedness", "Whether the answer is supported by supplied context rather than model memory."],
    ],
    gotchas: [
      "A schema in the prompt is a request, not a guarantee — always validate and handle parse failures.",
      "Unbounded user input in a prompt invites instruction injection; separate data from instructions.",
    ],
    practice:
      "Write a prompt that returns a fixed JSON shape, then validate it with a JSON schema and a bad-input test.",
  },
  integration: {
    overview:
      "Integrate models server-side: your backend holds the key, builds the prompt, applies limits and streams the result. The browser should never talk to the provider directly, and every call needs a timeout, a token budget and a failure path.",
    terms: [
      ["Proxy endpoint", "Your API route that authenticates the user, calls the provider, and returns only the answer."],
      ["Streaming", "Sending tokens as they arrive for perceived speed, with a non-streaming fallback."],
      ["Tool calling", "Letting the model request a typed function you execute, instead of guessing data."],
    ],
    gotchas: [
      "Provider keys in frontend code are public the moment you deploy.",
      "A retried streaming request can double-bill and duplicate output; make retries idempotent.",
    ],
    practice:
      "Build a `/api/ai/echo` endpoint that proxies one prompt, rate-limits per user, and logs token usage.",
  },
  rag: {
    overview:
      "Retrieval-augmented generation grounds answers in your own documents: split them into chunks, embed each chunk as a vector, store the vectors with metadata, then retrieve the nearest chunks for a question and instruct the model to answer only from them.",
    terms: [
      ["Embedding", "A numeric vector representing meaning, so similar text is geometrically close."],
      ["Chunking", "Splitting documents into retrievable pieces; by heading or paragraph, with overlap."],
      ["Hybrid search", "Combining vector similarity with keyword search, usually better than either alone."],
    ],
    gotchas: [
      "Changing the embedding model invalidates every stored vector; version your index.",
      "Retrieving chunks across tenants leaks data — filter by tenant in the query itself.",
    ],
    practice:
      "Index ten documents with metadata, ask a question, and print the retrieved chunks before the answer.",
  },
  "agents-mcp": {
    overview:
      "An agent is a loop: the model chooses a tool, your code executes it, the result goes back into context. MCP standardises how tools and resources are exposed to models. The engineering problem is permissions and auditability, not the loop.",
    terms: [
      ["Tool", "A typed function exposed to the model with a schema and an executor you control."],
      ["MCP", "Model Context Protocol: a standard interface for servers to expose tools and data to clients."],
      ["Human in the loop", "A required approval step before an irreversible action."],
    ],
    gotchas: [
      "Never let a model call destructive tools without authorization checks on the server.",
      "Chained tool calls can loop forever; bound iterations and total cost.",
    ],
    practice:
      "Expose one read-only tool (search your data) with a strict schema and log every call.",
  },
  "ai-refactoring": {
    overview:
      "Models are genuinely useful for mechanical change: renaming, extracting methods, adding tests, drafting docs. The safety rule is small steps behind a green test suite — one change, run tests, read the diff, commit — never a sweeping rewrite you cannot explain.",
    terms: [
      ["Behaviour-preserving refactor", "A structural change that keeps every test passing and every output identical."],
      ["Golden test", "A test that pins existing output so a refactor can be verified."],
      ["Diff review", "Reading every changed line, because generated refactors silently alter edge cases."],
    ],
    gotchas: [
      "AI-generated tests often assert current behaviour including the bug; fix the expectations yourself.",
      "Docs and commands generated from code can be confidently wrong — run every command before publishing.",
    ],
    practice:
      "Ask for one method extraction, run the suite, and revert if the diff touches anything unrelated.",
  },
  "ai-workflow": {
    overview:
      "AI fits the delivery workflow at the edges: scaffolding, test generation, migration drafts, review comments, changelogs. Use it to remove the boring 60%, keep human review on boundaries and failure handling, and never send secrets or customer data to unapproved tools.",
    terms: [
      ["Guardrail", "A rule enforced by tooling — no secrets in prompts, required review, limited tool permissions."],
      ["Provenance", "Knowing which code was generated and by which tool, for licence and audit purposes."],
      ["Verification loop", "The compile, test and review steps that make generated code trustworthy."],
    ],
    gotchas: [
      "Velocity without tests converts every generated change into future debugging.",
      "Approved-tool lists matter: pasting into a random chatbot is a data leak, not a shortcut.",
    ],
    practice:
      "Write a short team policy: what may be sent to AI tools, what must be reviewed, what must never be.",
  },
};
