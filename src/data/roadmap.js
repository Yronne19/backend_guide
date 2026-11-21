// The roadmap follows https://roadmap.sh/backend, reorganised into a learning
// sequence and paired with real-world Java / Spring Boot examples.
// Most roadmap.sh nodes are covered directly; a few adjacent ones are grouped
// into a single topic rather than repeating the same idea twice.

import { topicDetails } from "./topicDetails.js";

export const meta = {
  title: "Backend Engineering Roadmap",
  edition: "2026 edition",
  source: "https://roadmap.sh/backend",
  primaryStack: "Java 21 · Spring Boot 3",
  upcomingStack: "Python · FastAPI",
};

const httpExample = {
  file: "the wire",
  lang: "http",
  code: `GET /api/v1/orders/ord_7f3a HTTP/1.1
Host: api.shop.dev
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: private, max-age=30
ETag: "a91f-3c02"

{
  "id": "ord_7f3a",
  "status": "PAID",
  "total": 149.90,
  "currency": "USD"
}`,
};

const javaCoreExample = {
  file: "OrderSummary.java",
  lang: "java",
  code: `public record OrderLine(String sku, int quantity, BigDecimal price) {}

public record OrderSummary(String orderId, int items, BigDecimal total) {

  public static OrderSummary of(String orderId, List<OrderLine> lines) {
    var total = lines.stream()
        .map(line -> line.price().multiply(BigDecimal.valueOf(line.quantity())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    var items = lines.stream().mapToInt(OrderLine::quantity).sum();

    return new OrderSummary(orderId, items, total);
  }
}

var summary = OrderSummary.of("ord_7f3a", List.of(
    new OrderLine("SKU-1", 2, new BigDecimal("49.95")),
    new OrderLine("SKU-2", 1, new BigDecimal("50.00"))));

System.out.println(summary.total()); // 149.90`,
};

const pomExample = {
  file: "pom.xml",
  lang: "xml",
  code: `<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.4.1</version>
</parent>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>`,
};

const gitExample = {
  file: "daily git workflow",
  lang: "bash",
  code: `# create a branch for one small, reviewable change
git switch -c feat/order-cancellation

git add src/main/java/dev/shop/orders
git commit -m "feat(orders): allow cancelling a pending order"

# stay current with the mainline before opening a PR
git fetch origin
git rebase origin/main

git push -u origin feat/order-cancellation

# inspect what you are about to ship
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD`,
};

const sqlSchemaExample = {
  file: "V1__create_orders.sql",
  lang: "sql",
  code: `create table customers (
  id            uuid primary key,
  email         text not null unique,
  created_at    timestamptz not null default now()
);

create table orders (
  id            uuid primary key,
  customer_id   uuid not null references customers (id),
  status        text not null check (status in ('PENDING', 'PAID', 'CANCELLED')),
  total_cents   bigint not null check (total_cents >= 0),
  created_at    timestamptz not null default now()
);

-- covers "my orders, newest first" without a full table scan
create index orders_customer_created_idx
  on orders (customer_id, created_at desc);

select o.id, o.status, o.total_cents
from orders o
where o.customer_id = $1
order by o.created_at desc
limit 20 offset 0;`,
};

const transactionExample = {
  file: "OrderService.java",
  lang: "java",
  code: `@Service
public class OrderService {

  private final OrderRepository orders;
  private final PaymentClient payments;

  public OrderService(OrderRepository orders, PaymentClient payments) {
    this.orders = orders;
    this.payments = payments;
  }

  // Both writes commit or roll back together.
  @Transactional
  public Order placeOrder(PlaceOrderCommand command) {
    var order = Order.place(command.customerId(), command.lines());
    orders.save(order);

    var receipt = payments.charge(order.id(), order.total());
    order.markPaid(receipt.transactionId());
    return order;
  }
}`,
};

const jpaExample = {
  file: "Order.java + OrderRepository.java",
  lang: "java",
  code: `@Entity
@Table(name = "orders")
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Enumerated(EnumType.STRING)
  private OrderStatus status;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "order_id")
  private List<OrderLine> lines = new ArrayList<>();

  @Version
  private long version; // optimistic locking

  protected Order() {}

  public static Order place(UUID customerId, List<OrderLine> lines) {
    var order = new Order();
    order.status = OrderStatus.PENDING;
    order.lines.addAll(lines);
    return order;
  }
}

public interface OrderRepository extends JpaRepository<Order, UUID> {

  Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}`,
};

const nPlusOneExample = {
  file: "OrderRepository.java",
  lang: "java",
  code: `// BAD: 1 query for orders + 1 per order for its lines (the N+1 problem)
List<Order> orders = orderRepository.findAll();
orders.forEach(o -> o.getLines().size());

// GOOD: fetch the association in the same round trip
@EntityGraph(attributePaths = {"lines"})
@Query("select o from Order o where o.status = :status")
List<Order> findWithLines(@Param("status") OrderStatus status);

// Also watch out for open-in-view: disable it and fetch what you render.
// spring.jpa.open-in-view=false`,
};

const migrationExample = {
  file: "V2__add_cancelled_at.sql",
  lang: "sql",
  code: `-- Flyway runs this exactly once, in version order, inside a transaction.
alter table orders
  add column cancelled_at timestamptz;

alter table orders
  add constraint cancelled_requires_status
  check (cancelled_at is null or status = 'CANCELLED');

-- Never edit an applied migration. Add a new one instead.
-- spring.flyway.enabled=true
-- spring.jpa.hibernate.ddl-auto=validate`,
};

const restControllerExample = {
  file: "OrderController.java",
  lang: "java",
  code: `@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

  private final OrderService orders;

  public OrderController(OrderService orders) {
    this.orders = orders;
  }

  @GetMapping
  public Page<OrderResponse> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") @Max(100) int size) {
    var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    return orders.list(pageable).map(OrderResponse::from);
  }

  @GetMapping("/{id}")
  public OrderResponse get(@PathVariable UUID id) {
    return OrderResponse.from(orders.get(id));
  }

  // POST is unsafe and non-idempotent: require and honour an idempotency key.
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public OrderResponse place(
      @RequestHeader("Idempotency-Key") String key,
      @Valid @RequestBody PlaceOrderRequest request) {
    return OrderResponse.from(orders.placeOnce(key, request));
  }
}

public record PlaceOrderRequest(
    @NotNull UUID customerId,
    @NotEmpty List<@Valid OrderLineRequest> lines) {}

public record OrderLineRequest(
    @NotBlank String sku,
    @Min(1) @Max(99) int quantity) {}`,
};

const apiErrorExample = {
  file: "ApiExceptionHandler.java",
  lang: "java",
  code: `@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(OrderNotFoundException.class)
  public ResponseEntity<ProblemDetail> notFound(OrderNotFoundException ex) {
    var problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    problem.setTitle("Order not found");
    problem.setProperty("code", "ORDER_NOT_FOUND");
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail invalid(MethodArgumentNotValidException ex) {
    var problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    problem.setTitle("Validation failed");
    problem.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(
            FieldError::getField,
            fe -> Objects.requireNonNullElse(fe.getDefaultMessage(), "invalid"))));
    return problem;
  }
}`,
};

const securityExample = {
  file: "SecurityConfig.java",
  lang: "java",
  code: `@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())                 // stateless JSON API
        .cors(Customizer.withDefaults())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/orders/**").hasAuthority("SCOPE_orders:read")
            .requestMatchers(HttpMethod.POST, "/api/v1/orders").hasAuthority("SCOPE_orders:write")
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
        .build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://shop.dev"));
    config.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Idempotency-Key"));

    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
  }
}`,
};

const httpCacheExample = {
  file: "CatalogController.java",
  lang: "java",
  code: `@GetMapping("/api/v1/products/{slug}")
public ResponseEntity<ProductResponse> product(
    @PathVariable String slug,
    @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {

  var product = catalog.get(slug);
  var etag = "\\"" + product.version() + "\\"";

  if (etag.equals(ifNoneMatch)) {
    return ResponseEntity.status(HttpStatus.NOT_MODIFIED)
        .eTag(etag)
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
        .build();
  }

  return ResponseEntity.ok()
      .eTag(etag)
      .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
      .body(ProductResponse.from(product));
}`,
};

const redisCacheExample = {
  file: "CatalogService.java",
  lang: "java",
  code: `@Service
public class CatalogService {

  private final ProductRepository products;

  // Read-through cache: miss -> load from DB -> write Redis -> return.
  @Cacheable(value = "products", key = "#slug", unless = "#result == null")
  public ProductView product(String slug) {
    return products.findBySlug(slug)
        .map(ProductView::from)
        .orElse(null);
  }

  // Evict after the owning write so the next read repopulates it.
  @CacheEvict(value = "products", key = "#product.slug")
  @Transactional
  public void update(Product product) {
    products.save(product);
  }
}

// application.yml
// spring.cache.type=redis
// spring.data.redis.host=localhost
// spring.cache.redis.time-to-live=5m`,
};

const unitTestExample = {
  file: "OrderTest.java",
  lang: "java",
  code: `class OrderTest {

  private final PaymentClient payments = mock(PaymentClient.class);

  @Test
  void rejects_empty_orders() {
    assertThatThrownBy(() -> Order.place(UUID.randomUUID(), List.of()))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("at least one line");
  }

  @Test
  void marks_paid_order_with_receipt() {
    var order = Order.place(UUID.randomUUID(), List.of(sampleLine()));
    when(payments.charge(any(), any())).thenReturn(new Receipt("tx_123"));

    new OrderService(orderRepository, payments).placeOrder(command());

    assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
    verify(payments).charge(order.getId(), order.total());
  }
}`,
};

const integrationTestExample = {
  file: "OrderApiIT.java",
  lang: "java",
  code: `@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class OrderApiIT {

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;

  @Test
  void placing_an_order_returns_201_and_persists_it() throws Exception {
    var body = """
        {"customerId": "3f0c...", "lines": [{"sku": "SKU-1", "quantity": 2}]}
        """;

    mvc.perform(post("/api/v1/orders")
            .header("Idempotency-Key", "it-1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("PENDING"));
  }
}`,
};

const ciExample = {
  file: ".github/workflows/ci.yml",
  lang: "yaml",
  code: `name: ci

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "21"
          cache: maven
      - name: Verify
        run: mvn -B verify
      - name: Build image
        run: docker build -t shop-api:\${{ github.sha }} .
      # deploy only from main, after tests and the image build pass
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: ./scripts/deploy.sh \${{ github.sha }}
        env:
          DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`,
};

const passwordExample = {
  file: "UserService.java",
  lang: "java",
  code: `@Service
public class UserService {

  private final PasswordEncoder encoder; // BCryptPasswordEncoder(12)
  private final UserRepository users;

  public UserService(UserRepository users, PasswordEncoder encoder) {
    this.users = users;
    this.encoder = encoder;
  }

  public User register(String email, String rawPassword) {
    if (users.existsByEmail(email)) {
      throw new EmailAlreadyUsed(email);
    }
    // Never store or log the raw password. BCrypt salts every hash.
    var hash = encoder.encode(rawPassword);
    return users.save(new User(email, hash));
  }

  public boolean checkPassword(User user, String candidate) {
    return encoder.matches(candidate, user.getPasswordHash());
  }
}

@Bean
PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder(12);
}`,
};

const kafkaProducerExample = {
  file: "OrderEventPublisher.java",
  lang: "java",
  code: `@Service
public class OrderEventPublisher {

  private final KafkaTemplate<String, OrderPlacedEvent> kafka;

  public OrderEventPublisher(KafkaTemplate<String, OrderPlacedEvent> kafka) {
    this.kafka = kafka;
  }

  // Key by order id so all events for one order stay ordered.
  public void publish(Order order) {
    var event = new OrderPlacedEvent(order.id(), order.total(), Instant.now());
    kafka.send("orders.placed", order.id().toString(), event)
        .whenComplete((result, error) -> {
          if (error != null) {
            log.error("failed to publish {}", order.id(), error);
          }
        });
  }
}

// Consumer side must be idempotent: the broker guarantees at-least-once.
@KafkaListener(topics = "orders.placed", groupId = "inventory")
public void onOrderPlaced(OrderPlacedEvent event) {
  inventory.reserveOnce(event.orderId(), event.items());
}`,
};

const websocketExample = {
  file: "WebSocketConfig.java",
  lang: "java",
  code: `@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("https://shop.dev");
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/topic");
    registry.setApplicationDestinationPrefixes("/app");
  }
}

// Push a status change only to the user who owns the order.
@MessagingGateway
public interface OrderUpdates {
  @SendToUser("/topic/orders")
  void statusChanged(OrderStatusEvent event);
}`,
};

const dockerExample = {
  file: "Dockerfile",
  lang: "docker",
  code: `# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# Runtime stage — small image, no build tools, non-root user
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]`,
};

const resilienceExample = {
  file: "PaymentClient.java",
  lang: "java",
  code: `@Service
public class PaymentClient {

  private final RestClient http;

  // Stop hammering a failing dependency; fail fast and recover gracefully.
  @CircuitBreaker(name = "payments", fallbackMethod = "enqueueForRetry")
  @RateLimiter(name = "payments")
  @TimeLimiter(name = "payments")
  @Retry(name = "payments")
  public CompletableFuture<Receipt> charge(UUID orderId, BigDecimal amount) {
    return CompletableFuture.supplyAsync(() ->
        http.post()
            .uri("/v1/charges")
            .body(new ChargeRequest(orderId, amount))
            .retrieve()
            .body(Receipt.class));
  }

  private CompletableFuture<Receipt> enqueueForRetry(
      UUID orderId, BigDecimal amount, Throwable error) {
    log.warn("payment deferred for {}", orderId, error);
    outbox.enqueue(new PaymentRetry(orderId, amount, Instant.now().plusSeconds(30)));
    return CompletableFuture.completedFuture(null);
  }
}`,
};

const observabilityExample = {
  file: "application.yml",
  lang: "yaml",
  code: `management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      probes:
        enabled: true
      show-details: when_authorized

spring:
  application:
    name: shop-api

logging:
  pattern:
    level: "%5p [traceId=%X{traceId:-}, spanId=%X{spanId:-}]"

# Micrometer exports the same metrics to Prometheus; traces flow via OTLP.
# io.micrometer:micrometer-registry-prometheus
# io.micrometer:micrometer-tracing-bridge-otel`,
};

const llmExample = {
  file: "SupportAssistant.java",
  lang: "java",
  code: `@Service
public class SupportAssistant {

  private final RestClient llm;

  public SupportAssistant(RestClient.Builder builder,
                          @Value("\${app.ai.base-url}") String baseUrl) {
    this.llm = builder.baseUrl(baseUrl).build();
  }

  // Ask for a strict JSON schema result, then deserialize into a record.
  public Answer answer(String question, List<Policy> policies) {
    var prompt = "Answer only from these policies. Quote the policy id.\\n"
        + policies.stream().map(Policy::text).collect(Collectors.joining("\\n"))
        + "\\nQuestion: " + question;

    var response = llm.post()
        .uri("/chat/completions")
        .header("Authorization", "Bearer " + apiKey)
        .body(Map.of(
            "model", "gpt-4o-mini",
            "response_format", Map.of("type", "json_object"),
            "messages", List.of(Map.of("role", "user", "content", prompt))))
        .retrieve()
        .body(ChatCompletion.class);

    return json.readValue(response.content(), Answer.class);
  }

  public record Answer(String text, List<String> policyIds, boolean confident) {}
}`,
};

export const phases = [
  {
    id: "foundations",
    number: "01",
    title: "Foundations of the web",
    tagline: "What actually happens between a click and a database row",
    summary:
      "Before frameworks, understand the path a request takes: DNS turns a name into an address, TCP and TLS open a channel, HTTP carries the request, a server produces a response, and the browser renders it. This is the mental model every later topic hangs from.",
    topics: [
      {
        id: "internet",
        title: "How the internet works",
        blurb:
          "Packets, IP addresses, ports, TCP vs UDP, and what a 'server' really is. Enough depth to reason about latency and failures.",
        points: [
          "IP routes packets between networks; ports pick a listener; TCP adds ordering and retries while UDP trades reliability for latency.",
          "A request crosses DNS, a CDN/edge, a load balancer, your app and a database — each hop can fail or add milliseconds.",
          "Understand private networks, NAT, firewalls and why localhost:8080 is reachable only on your machine.",
        ],
      },
      {
        id: "http",
        title: "HTTP, requests and responses",
        blurb:
          "Methods, status codes, headers, bodies and idempotency. HTTP is the contract your API lives inside.",
        points: [
          "GET is safe, PUT/DELETE are idempotent, POST is neither — this shapes retries, caching and API design.",
          "Status codes carry meaning: 2xx success, 3xx redirect, 4xx caller error, 5xx your error. Never return 200 for a failure.",
          "Headers negotiate content, carry credentials, control caching and correlate traces across services.",
        ],
        code: httpExample,
      },
      {
        id: "dns",
        title: "DNS, domains and hosting",
        blurb:
          "Names resolve to records: A/AAAA for addresses, CNAME for aliases, MX for mail, TXT for verification. Hosting is where the machine runs.",
        points: [
          "TTL controls how long resolvers cache a record; low TTL before a migration saves hours of confusion.",
          "Use managed DNS with health checks and failover, and terminate TLS at the edge or load balancer.",
          "Know the difference between VPS, PaaS, containers and serverless — it changes your ops burden and scaling model.",
        ],
      },
      {
        id: "browsers",
        title: "Browsers and the request lifecycle",
        blurb:
          "The browser is your most demanding client: it pipelines, caches, retries, sends cookies and enforces CORS.",
        points: [
          "Preflight OPTIONS requests only happen for cross-origin, non-simple calls — an important source of CORS bugs.",
          "The critical path is DNS + connect + TLS + TTFB + download; keep payloads small and cache aggressively.",
          "DevTools' Network panel is the fastest way to debug headers, cookies and redirect chains.",
        ],
      },
      {
        id: "frontend-basics",
        title: "Frontend basics (HTML, CSS, JavaScript)",
        blurb:
          "You do not need to be a frontend engineer, but you must read HTML, style states, and understand fetching, forms and cookies.",
        points: [
          "Know how a form POST, a fetch call and a cookie behave — they drive backend contracts and CSRF concerns.",
          "Semantic HTML and accessible forms make the API easier for every client, not just browsers.",
          "JavaScript's event loop and JSON handling explain why frontends batch, debounce and retry.",
        ],
      },
      {
        id: "first-server",
        title: "Your first server",
        blurb:
          "Build a tiny HTTP service by hand once. Then let Spring Boot do it, with a clear idea of what it hides.",
        points: [
          "Routes map a method plus path to a handler; middleware handles logging, auth and errors around it.",
          "Read the request body as a stream, parse JSON, validate it, produce a response — that is 90% of backend work.",
          "Health endpoint + structured logs from day one make every later debugging session cheaper.",
        ],
      },
    ],
  },
  {
    id: "language",
    number: "02",
    title: "Pick a language & build the habit",
    tagline: "Java 21 + Spring Boot for now, Python next",
    summary:
      "Choose one language and go deep before collecting frameworks. This track uses Java with Spring Boot: strong typing, a mature ecosystem and the language most enterprise backends run on. Python/FastAPI is the planned second track.",
    topics: [
      {
        id: "java",
        title: "Java language core",
        blurb:
          "Classes, records, generics, collections, streams, exceptions, and the concurrency primitives you will actually meet.",
        points: [
          "Prefer immutable records and constructor injection; they make services easy to test and reason about.",
          "Streams are for transforming collections, not for controlling flow — keep side effects out of them.",
          "Know checked vs unchecked exceptions, try-with-resources and what 'effectively final' means for lambdas.",
        ],
        code: javaCoreExample,
      },
      {
        id: "build-tools",
        title: "Build tools & dependencies",
        blurb:
          "Maven or Gradle, dependency scopes, version conflicts, and a reproducible build that runs the same locally and in CI.",
        points: [
          "Spring Boot's parent POM manages compatible versions; override only when you must, and document why.",
          "Use the wrapper (mvnw/gradlew) so CI and teammates use the same build tool version.",
          "Keep test, runtime and compile scopes honest — leaking test libraries into production is a real supply-chain risk.",
        ],
        code: pomExample,
      },
      {
        id: "project-layout",
        title: "Project structure & configuration",
        blurb:
          "Package by feature, not by framework layer. Externalise configuration and keep secrets out of the repository.",
        points: [
          "One package per capability (orders, payments, catalog), each with its API, service and persistence.",
          "Profiles for local/test/prod, environment variables for anything secret, sensible defaults everywhere else.",
          "Fail fast on missing config with @ConfigurationProperties plus validation.",
        ],
      },
      {
        id: "git",
        title: "Git & version control",
        blurb:
          "Small commits, clear history, branches per change, and the ability to undo almost anything without fear.",
        points: [
          "Commit one logical idea at a time; a good commit message explains why, not just what.",
          "Rebase local work to keep history linear; never rewrite shared branches.",
          "Learn reflog, cherry-pick, revert and bisect — they turn git from scary to useful.",
        ],
        code: gitExample,
      },
      {
        id: "repo-hosting",
        title: "GitHub / GitLab workflows",
        blurb:
          "Pull requests, protected branches, code owners, issues and release tags — the collaboration layer around git.",
        points: [
          "Require review, passing CI and an up-to-date branch before merge; automation removes arguments.",
          "Keep the PR small enough to review in 30 minutes; large diffs hide bugs and discourage feedback.",
          "Tag releases and keep a changelog so you can answer 'what is running in production?'",
        ],
      },
      {
        id: "code-reviews",
        title: "Code reviews & clean code",
        blurb:
          "Review for correctness, clarity and risk. Naming, small functions and clear boundaries beat clever code.",
        points: [
          "Ask 'what could go wrong in production?' — then check error paths, nulls, timeouts and authorization.",
          "Prefer refactoring behind tests; behaviour changes and structural changes belong in separate PRs.",
          "Leave comments that explain the concern, not just the preference; consistency with the codebase wins.",
        ],
      },
      {
        id: "ai-assisted",
        title: "AI-assisted coding",
        blurb:
          "Copilot, Claude Code, Cursor and friends are part of the modern toolchain — use them for leverage, verify like a senior.",
        points: [
          "Let AI draft boilerplate, tests and migrations; you own the design, security and final review.",
          "Never paste secrets or customer data into a tool that does not have an approved data policy.",
          "Treat generated code as untrusted: compile it, test it and read it line by line before it ships.",
        ],
      },
      {
        id: "python-later",
        title: "Second language: Python (planned)",
        blurb:
          "The roadmap is language-agnostic. Python with FastAPI is the next track; the concepts transfer directly.",
        points: [
          "Python's asyncio and type hints map closely to Java's virtual threads and generics.",
          "FastAPI's dependency injection and Pydantic validation rhyme with Spring's beans and Bean Validation.",
          "Learn a second language after you can ship in the first — not instead of it.",
        ],
      },
    ],
  },
  {
    id: "data",
    number: "03",
    title: "Data & persistence",
    tagline: "Model it, constrain it, index it, migrate it",
    summary:
      "Most backend bugs are data bugs. Learn relational modelling and SQL properly, then add NoSQL deliberately — choice follows access patterns, not fashion. Spring Data JPA and Flyway give you a production-grade loop.",
    topics: [
      {
        id: "relational",
        title: "Relational databases & SQL",
        blurb:
          "Tables, keys, joins, aggregates, transactions. PostgreSQL or MySQL as the daily driver.",
        points: [
          "Learn joins, group by/having, window functions and explain plans — ORMs do not remove the need for SQL.",
          "Use constraints (not null, unique, foreign keys, check) so the database enforces invariants too.",
          "Pick PostgreSQL by default; it covers JSONB, full-text search and extensions when you need them.",
        ],
        code: sqlSchemaExample,
      },
      {
        id: "sql-engines",
        title: "MariaDB, SQL Server & Oracle",
        blurb:
          "PostgreSQL is a good default, but MySQL/MariaDB, SQL Server and Oracle run a huge share of production systems — learn the differences that bite.",
        points: [
          "MySQL/MariaDB: InnoDB, utf8mb4, case-insensitive collations and `ON DUPLICATE KEY UPDATE` instead of `ON CONFLICT`.",
          "SQL Server: T-SQL, `IDENTITY` columns, clustered indexes and `OFFSET/FETCH` paging; Oracle adds PL/SQL, sequences and its own optimizer hints.",
          "Portability lives in standard SQL plus a migration tool — keep vendor-specific SQL isolated behind repositories, not spread through services.",
        ],
      },
      {
        id: "normalization",
        title: "Schema design & normalization",
        blurb:
          "Third normal form removes duplication; deliberate denormalisation buys read speed at the cost of consistency.",
        points: [
          "Model entities and relationships first, then optimise for known queries instead of imagined ones.",
          "Money in integer minor units, timestamps in UTC with time zone, ids that are stable and non-guessable.",
          "Soft deletes, audit columns and version fields are schema decisions — make them consciously.",
        ],
      },
      {
        id: "acid",
        title: "ACID & transactions",
        blurb:
          "Atomicity, consistency, isolation, durability — and the isolation levels you actually choose.",
        points: [
          "Keep transactions short and free of network calls; a remote timeout inside a transaction holds locks.",
          "@Transactional only works through the proxy, so self-invocation and private methods silently skip it.",
          "Know read-committed vs repeatable-read vs serializable, and what a lost update or phantom read looks like.",
        ],
        code: transactionExample,
      },
      {
        id: "indexes",
        title: "Indexes & query performance",
        blurb:
          "BTrees, composite index ordering, covering indexes and why an index can still be ignored.",
        points: [
          "Index the columns in your where/order by clauses, in the same order as the query uses them.",
          "Leading wildcards, functions on columns and type mismatches prevent index usage.",
          "Measure with EXPLAIN ANALYZE; an index slows down writes and costs disk, so add it for real queries.",
        ],
      },
      {
        id: "orm",
        title: "ORMs: Spring Data JPA",
        blurb:
          "Entities, repositories, derived queries and pagination. The ORM handles the boring parts, not the thinking.",
        points: [
          "Entities are persistence models, not API models — map to DTOs at the boundary.",
          "Use pagination for lists, projections for read-heavy queries, and explicit fetch plans for associations.",
          "Disable open-in-view; lazy loading that happens during JSON serialization hides N+1 problems.",
        ],
        code: jpaExample,
      },
      {
        id: "n-plus-one",
        title: "The N+1 problem & profiling",
        blurb:
          "The classic performance trap: one query becomes N+1 as you iterate. Detect it with SQL logs and metrics.",
        points: [
          "Enable SQL logging in development and count statements per request; the number should not grow with page size.",
          "Fix with join fetch / @EntityGraph, batch fetching, or a dedicated read query — not with caching as a band-aid.",
          "Track p50/p95/p99 latency; averages hide the slow requests users complain about.",
        ],
        code: nPlusOneExample,
      },
      {
        id: "migrations",
        title: "Migrations & schema evolution",
        blurb:
          "Flyway or Liquibase apply versioned, repeatable schema changes. Deploy code and schema in compatible steps.",
        points: [
          "Migrations are immutable once applied; every change is a new file with a higher version.",
          "Expand then contract: add nullable column, backfill, switch reads/writes, then remove the old one.",
          "Run migrations in CI against a real PostgreSQL container, not just an in-memory database.",
        ],
        code: migrationExample,
      },
      {
        id: "nosql",
        title: "NoSQL families",
        blurb:
          "Document, key-value, wide-column, graph, time-series and search stores — each solves a specific shape of problem.",
        points: [
          "MongoDB/CouchDB for document aggregates, Redis for key-value and caching, Cassandra/Scylla for huge write volume.",
          "Neo4j/DGraph for relationship traversal, Influx/Timescale for metrics, Elasticsearch/Solr for search and analytics.",
          "NoSQL usually means you own the consistency and query-design work the RDBMS did for you.",
        ],
      },
      {
        id: "managed-nosql",
        title: "DynamoDB & Firebase",
        blurb:
          "Managed NoSQL removes server operations but locks you into its access patterns. DynamoDB is key-value at scale; Firebase is a client-first app platform.",
        points: [
          "DynamoDB: model queries first, pick partition and sort keys accordingly, and accept that a new access pattern can mean a new index or table.",
          "Firebase (Firestore/Auth/Storage) shines for prototypes and mobile-first apps; check pricing, vendor lock-in and how you enforce authorization in security rules.",
          "Both push consistency, transactions and joins into your application — design idempotent writes and denormalised copies deliberately.",
        ],
      },
      {
        id: "analytics-stores",
        title: "ClickHouse & analytical stores",
        blurb:
          "OLTP databases are bad at scanning billions of rows. Columnar stores such as ClickHouse answer analytical questions fast.",
        points: [
          "Columnar storage reads only the columns a query needs and compresses well — perfect for events, metrics and dashboards.",
          "Batch inserts, pick a sorting key that matches your filters, and keep high-cardinality dimensions out of the primary key.",
          "Copy data out of the transactional database asynchronously (CDC or a nightly export); never point user-facing writes at the warehouse.",
        ],
      },
    ],
  },
  {
    id: "apis",
    number: "04",
    title: "APIs & contracts",
    tagline: "Design the interface before the implementation",
    summary:
      "REST + JSON is the default; GraphQL, gRPC and even SOAP earn their place in specific contexts. Good APIs are predictable, versioned, validated, idempotent and documented. Then you protect them.",
    topics: [
      {
        id: "rest",
        title: "REST & JSON APIs",
        blurb:
          "Resources, verbs, status codes, pagination, filtering and idempotency keys — the practical core of backend work.",
        points: [
          "Nouns in paths, verbs in methods; return the created resource and its Location on 201.",
          "Paginate every collection; cursor pagination scales better than deep offsets.",
          "Validate at the edge with Bean Validation and reject unknown fields; never trust the client.",
        ],
        code: restControllerExample,
      },
      {
        id: "openapi",
        title: "OpenAPI & documentation",
        blurb:
          "Generate the spec from code (springdoc-openapi), keep examples accurate, and treat it as a tested contract.",
        points: [
          "An API without a spec is tribal knowledge; publish OpenAPI and render Swagger UI in non-prod environments.",
          "Document error shapes, auth scopes and rate limits, not only happy paths.",
          "Generate typed clients from the spec so consumers cannot drift silently.",
        ],
      },
      {
        id: "versioning-errors",
        title: "Versioning & error handling",
        blurb:
          "Version in the path (/api/v1) or via media type, add fields without breaking clients, and return consistent errors.",
        points: [
          "Additive changes are safe; renaming, removing or changing types is a breaking change that needs a version.",
          "Use RFC 9457 Problem Details with a stable machine-readable code for every expected failure.",
          "Never leak stack traces, SQL or internal hostnames in production error responses.",
        ],
        code: apiErrorExample,
      },
      {
        id: "graphql",
        title: "GraphQL",
        blurb:
          "A single typed endpoint where clients select fields. Powerful for varied clients, costly if you ignore query complexity.",
        points: [
          "Watch the N+1 problem across resolvers; use batched loaders instead of per-field queries.",
          "Limit query depth and complexity, and disable introspection in production if it is not a public API.",
          "Spring GraphQL fits naturally alongside existing Spring services and validation.",
        ],
      },
      {
        id: "grpc-soap",
        title: "gRPC & SOAP",
        blurb:
          "gRPC for fast, typed service-to-service calls; SOAP remains in enterprise integrations you may have to consume.",
        points: [
          "gRPC uses protobuf over HTTP/2 with streaming; ideal for internal low-latency communication.",
          "Version protobuf fields by number and never reuse retired tag numbers.",
          "For SOAP, generate classes from the WSDL, handle faults explicitly and keep XML parsers secured.",
        ],
      },
      {
        id: "authn",
        title: "Authentication",
        blurb:
          "Sessions and cookies for browsers, JWT/OAuth2 tokens for APIs. Authentication answers 'who are you?'.",
        points: [
          "Hash passwords with BCrypt/Argon2, use short-lived access tokens and rotate refresh tokens.",
          "JWTs are signed, not encrypted — never put secrets or sensitive PII in claims.",
          "Validate issuer, audience, expiry and signature; never trust a token just because it decodes.",
        ],
        code: securityExample,
      },
      {
        id: "session-auth",
        title: "Basic auth, cookies & tokens",
        blurb:
          "Three ways a request proves who it is: an Authorization header, a cookie the browser sends automatically, or a bearer token stored by the client.",
        points: [
          "HTTP Basic sends base64 credentials on every request — acceptable only over TLS for machine-to-machine or internal tools, never for a browser login.",
          "Cookie sessions need `HttpOnly`, `Secure`, `SameSite` and a CSRF defence; the browser attaches them automatically, which is both the convenience and the risk.",
          "Bearer tokens (JWT or opaque) suit APIs and mobile, but storage is the client's problem: short lifetimes, rotation and revocation matter more than the format.",
        ],
      },
      {
        id: "authz",
        title: "Authorization & OAuth2 / OIDC",
        blurb:
          "Scopes, roles, ownership checks, and delegating login to an identity provider. This answers 'what may you do?'.",
        points: [
          "Enforce authorization server-side on every request; hiding a button is not access control.",
          "Check resource ownership explicitly — scope alone rarely proves this order belongs to this user.",
          "Prefer OIDC with a trusted identity provider over rolling your own auth protocol.",
        ],
      },
      {
        id: "saml-oidc",
        title: "SAML & OpenID Connect SSO",
        blurb:
          "Enterprise customers want single sign-on. SAML 2.0 is the XML incumbent; OpenID Connect is the modern OAuth2-based successor.",
        points: [
          "In SAML the identity provider posts a signed assertion to your ACS endpoint; validate signature, audience, recipient and timestamps before trusting any attribute.",
          "OIDC gives you an ID token plus a UserInfo endpoint; map the `sub` claim to a local user and never use email as the primary identity.",
          "Implement SSO through Spring Security's SAML/OAuth2 client support with one provider config per tenant, and test the logout and clock-skew paths.",
        ],
      },
      {
        id: "api-security",
        title: "API security practices",
        blurb:
          "Rate limits, input limits, CORS, HTTPS-only, idempotency and audit logs. Assume every endpoint is public.",
        points: [
          "Throttle by API key and IP; cap body size and pagination limits to prevent cheap exhaustion attacks.",
          "Validate content types, allowlist origins and avoid mass assignment by mapping DTO fields explicitly.",
          "Log authentication failures and sensitive mutations, but never log tokens or passwords.",
        ],
      },
    ],
  },
  {
    id: "caching",
    number: "05",
    title: "Caching & search",
    tagline: "The fastest query is the one you never make",
    summary:
      "Caching is a correctness problem disguised as a performance feature. Learn HTTP caching at the edge, Redis in the app, invalidation rules, and when a real search engine beats SQL LIKE.",
    topics: [
      {
        id: "http-caching",
        title: "HTTP caching",
        blurb:
          "Cache-Control, ETag/If-None-Match, Last-Modified and CDN behaviour. Free performance for repeat visitors.",
        points: [
          "Use max-age plus revalidation (ETag) for content that changes; use immutable for hashed assets.",
          "public vs private decides whether a CDN may store a response — never mark user-specific data public.",
          "A 304 response saves bandwidth but still costs a round trip; design for both freshness and volume.",
        ],
        code: httpCacheExample,
      },
      {
        id: "redis",
        title: "Redis & Memcached",
        blurb:
          "In-memory key-value stores for cached reads, sessions, rate-limit counters, queues and ephemeral state.",
        points: [
          "Redis offers data structures, persistence and clustering; Memcached is a simpler, pure cache.",
          "Set a TTL on everything and a memory policy (allkeys-lru) so a full cache degrades instead of crashing.",
          "Treat the cache as optional: a miss must fall back to the source of truth correctly.",
        ],
        code: redisCacheExample,
      },
      {
        id: "cache-patterns",
        title: "Cache patterns & key design",
        blurb:
          "Cache-aside, read-through, write-through, write-behind. Versioned keys make invalidation tractable.",
        points: [
          "Cache-aside is the default: read cache, load on miss, populate with TTL; keep writes to the database first.",
          "Include the entity version or a schema version in keys so deploys do not serve stale shapes.",
          "For hot keys, add jitter to TTLs to avoid synchronized expiry storms.",
        ],
      },
      {
        id: "invalidation",
        title: "Invalidation & consistency",
        blurb:
          "There are only two hard things in computer science, and stale cache is one of them.",
        points: [
          "Delete on write, do not update in place; the next read rebuilds the entry from truth.",
          "Accept bounded staleness for feeds and counters; require strong reads for money and permissions.",
          "Beware the thundering herd: single-flight rebuilds or stale-while-revalidate protect the database.",
        ],
      },
      {
        id: "search",
        title: "Search engines",
        blurb:
          "Elasticsearch, OpenSearch or Solr for relevance, faceting and large-scale text queries that SQL cannot serve well.",
        points: [
          "Keep the search index derived from the database; index asynchronously and make reindexing repeatable.",
          "Design analyzers and mappings up front — changing them later usually means a full rebuild.",
          "Use SQL full-text search or Postgres trigram indexes before adding a second system.",
        ],
      },
      {
        id: "rate-limiting",
        title: "Rate limiting & quotas",
        blurb:
          "Token bucket, leaky bucket, fixed vs sliding window. Protect the system and give clients clear feedback.",
        points: [
          "Return 429 with Retry-After and document the limit; silent throttling creates support tickets.",
          "Counters belong in Redis when several instances must share the budget.",
          "Separate per-user, per-key and global limits — one abusive client should not starve everyone.",
        ],
      },
    ],
  },
  {
    id: "testing",
    number: "06",
    title: "Testing & delivery",
    tagline: "Ship on evidence, not on hope",
    summary:
      "A test pyramid, a real database in integration tests, and a pipeline that runs the same checks locally and in CI. Tests are how you refactor safely and how you sleep after a deploy.",
    topics: [
      {
        id: "unit-testing",
        title: "Unit testing",
        blurb:
          "JUnit 5, AssertJ and Mockito for fast, deterministic tests of business rules without infrastructure.",
        points: [
          "Test behaviour and edge cases (empty, boundary, invalid), not private methods or implementation details.",
          "Mock at architectural boundaries (HTTP, clock, repositories), not every internal call.",
          "Keep them fast: no Spring context, no network, no sleep — a slow suite stops being run.",
        ],
        code: unitTestExample,
      },
      {
        id: "integration-testing",
        title: "Integration testing",
        blurb:
          "MockMvc plus Testcontainers gives you the real framework, real SQL and real serialization.",
        points: [
          "Test from the HTTP boundary so validation, security and transaction behaviour are exercised together.",
          "Use Testcontainers for PostgreSQL/Redis/Kafka rather than pretending H2 behaves the same.",
          "Cover the failure paths: validation errors, not-found, duplicate requests, unauthorized access.",
        ],
        code: integrationTestExample,
      },
      {
        id: "functional-testing",
        title: "Functional & end-to-end testing",
        blurb:
          "A few tests through the deployed stack prove the wiring. Keep them few, stable and meaningful.",
        points: [
          "Reserve E2E for critical journeys (sign up, pay, cancel) — they are slow and flaky by nature.",
          "Seed data through APIs or fixtures, not by reaching into the database.",
          "Use contract tests between services so deploy order cannot break consumers.",
        ],
      },
      {
        id: "test-data",
        title: "Test data & isolation",
        blurb:
          "Each test owns its data: unique identifiers, rolled-back transactions or truncated tables between tests.",
        points: [
          "Avoid shared mutable fixtures; parallel test runs expose hidden ordering assumptions.",
          "Build data through factories/builders with sensible defaults and explicit overrides.",
          "Never point tests at a production database; use ephemeral containers or dedicated schemas.",
        ],
      },
      {
        id: "ci-cd",
        title: "CI / CD",
        blurb:
          "Automate build, test, image and deploy. Make the pipeline the only path to production.",
        points: [
          "Run the same command locally and in CI (mvn verify / ./gradlew build) so 'works on my machine' disappears.",
          "Build the artifact once, promote the same image through environments.",
          "Add a rollback path and health checks before you need them at 2 a.m.",
        ],
        code: ciExample,
      },
      {
        id: "quality-gates",
        title: "Static analysis & quality gates",
        blurb:
          "SpotBugs, Checkstyle, dependency scanning and coverage trends catch entire classes of defects.",
        points: [
          "Fail the build on new high-severity findings rather than fixing a legacy backlog overnight.",
          "Scan dependencies for known CVEs and pin versions; upgrade in small, regular batches.",
          "Coverage is a signal, not a target — untested error paths matter more than a percentage.",
        ],
      },
    ],
  },
  {
    id: "security",
    number: "07",
    title: "Security",
    tagline: "Assume hostile input, untrusted networks and curious logs",
    summary:
      "Security is not a phase at the end; it is a property of every endpoint, header, query and log line. Learn the OWASP risks, how TLS works, how to store passwords, and how to fail safely.",
    topics: [
      {
        id: "tls",
        title: "HTTPS, SSL/TLS",
        blurb:
          "Certificates, handshakes, rotation and HSTS. Encryption in transit is table stakes, including inside your network.",
        points: [
          "Terminate TLS at the edge or load balancer, redirect all HTTP to HTTPS, and send HSTS with a long max-age.",
          "Automate certificate renewal (ACME) and monitor expiry — an expired cert is a self-inflicted outage.",
          "Use mTLS or a service mesh for sensitive service-to-service traffic when the threat model requires it.",
        ],
      },
      {
        id: "hashing",
        title: "Hashing & password storage",
        blurb:
          "MD5/SHA are fast hashes — unsuitable for passwords. Use BCrypt, scrypt or Argon2 with a per-password salt.",
        points: [
          "Never encrypt passwords reversibly; store a slow, salted hash and compare with a constant-time check.",
          "Tune work factors to your hardware and plan to rehash on login when hardware improves.",
          "Use SHA-256 for integrity checks, HMAC for signatures, and a real KMS for encryption keys.",
        ],
        code: passwordExample,
      },
      {
        id: "owasp",
        title: "OWASP risks",
        blurb:
          "Broken access control, injection, insecure design, misconfiguration, vulnerable components, auth failures — the recurring top ten.",
        points: [
          "Always use parameterized queries; string-built SQL is still the most reliable way to get breached.",
          "Enforce authorization server-side on every object, and return 404 rather than leaking existence.",
          "Keep dependencies patched, disable debug endpoints, and never ship default credentials.",
        ],
      },
      {
        id: "cors",
        title: "CORS & browser boundaries",
        blurb:
          "CORS is a browser policy, not server security. Understand origins, credentials and preflight.",
        points: [
          "Allowlist exact origins; wildcard plus credentials is invalid and usually a sign of confusion.",
          "CORS does not stop curl or server-to-server calls — keep tokens and authorization checks server-side.",
          "SameSite cookies plus CSRF tokens for cookie-based auth; bearer tokens avoid browser auto-send.",
        ],
      },
      {
        id: "headers",
        title: "Security headers & CSP",
        blurb:
          "Content-Security-Policy, X-Content-Type-Options, Referrer-Policy and frame protections reduce browser attack surface.",
        points: [
          "Start CSP in report-only mode, then tighten to an explicit allowlist of scripts and origins.",
          "Set nosniff and frame-ancestors to stop content-type confusion and clickjacking.",
          "Keep API responses JSON-only with explicit content types; avoid reflecting unsanitized input.",
        ],
      },
      {
        id: "secrets",
        title: "Secrets management",
        blurb:
          "Environment variables or a secrets manager, never the repository. Rotate, scope and audit access.",
        points: [
          "Different credentials per environment and per service; revoke old keys after rotation.",
          "Prefer short-lived workload identity or IAM roles over long-lived static keys.",
          "Scan commits and images for secrets, and treat a leaked key as compromised immediately.",
        ],
      },
      {
        id: "hardening",
        title: "Server hardening & failure modes",
        blurb:
          "Least privilege, minimal images, patched runtimes, timeouts, and safe error handling under attack.",
        points: [
          "Run containers as non-root with a read-only filesystem and no unnecessary capabilities.",
          "Set connection/read timeouts everywhere; an unbounded call is a denial-of-service waiting to happen.",
          "Fail closed for authorization and fail open only for non-critical features, deliberately.",
        ],
      },
    ],
  },
  {
    id: "architecture",
    number: "08",
    title: "Architecture & messaging",
    tagline: "Boundaries first, distribution second",
    summary:
      "Start with a modular monolith, split only when boundaries and scaling demand it. Then learn async communication, real-time delivery, and the operational pieces — containers, orchestration and reverse proxies — that run it all.",
    topics: [
      {
        id: "monolith",
        title: "Monolith, modular monolith, microservices",
        blurb:
          "One deployable with clear modules is usually the right start. Microservices trade complexity for independent scaling and ownership.",
        points: [
          "A well-modularised monolith has clear domain boundaries and can be split later; a big ball of mud cannot.",
          "Microservices add network failures, eventual consistency, versioning and operational overhead.",
          "Split along business capabilities with their own data, not by technical layer.",
        ],
      },
      {
        id: "soa-mesh",
        title: "SOA & service mesh",
        blurb:
          "Service-oriented design and the infrastructure layer (mTLS, retries, telemetry) that connects many services.",
        points: [
          "A mesh moves cross-cutting network concerns out of application code into sidecars or ambient proxies.",
          "Use it when service count and policy complexity justify the platform cost, not for three services.",
          "Keep retries, timeouts and circuit breaking consistent across services to avoid retry storms.",
        ],
      },
      {
        id: "twelve-factor",
        title: "Twelve-factor apps",
        blurb:
          "Config in the environment, stateless processes, disposability, logs as streams, dev/prod parity.",
        points: [
          "Stateless app instances can be replaced at any time; session state belongs in a shared store.",
          "Build once, release everywhere; config differences live in environment variables.",
          "Treat logs as event streams to stdout and let the platform aggregate them.",
        ],
      },
      {
        id: "kafka",
        title: "Kafka & event streaming",
        blurb:
          "Durable, ordered, replayable logs for events between services. Partitioning is your scaling unit.",
        points: [
          "Choose keys carefully: ordering is guaranteed per partition, not per topic.",
          "Consumers must be idempotent and tolerate duplicates and replays; at-least-once is the normal guarantee.",
          "Use the outbox pattern to publish reliably after a database commit.",
        ],
        code: kafkaProducerExample,
      },
      {
        id: "rabbitmq",
        title: "Queues & RabbitMQ",
        blurb:
          "Work queues, routing, acknowledgements and dead-letter queues for background jobs and decoupling.",
        points: [
          "Ack only after the work succeeds; use dead-letter queues plus retry budgets for poison messages.",
          "Queues smooth spikes and decouple latency; they do not remove the need to handle failure.",
          "Keep messages small and versioned; consumers may be older than producers during a rollout.",
        ],
      },
      {
        id: "realtime",
        title: "Real-time: WebSockets, SSE, polling",
        blurb:
          "Pick the simplest transport that meets the latency requirement: polling, long polling, SSE or full duplex.",
        points: [
          "SSE is ideal for one-way updates over plain HTTP; WebSockets for bidirectional, low-latency interaction.",
          "Authenticate the handshake, authorize subscriptions per room, and cap connections per user.",
          "Persist authoritative state in the database; push events are hints, not the source of truth.",
        ],
        code: websocketExample,
      },
      {
        id: "containers",
        title: "Docker, containers & LXC",
        blurb:
          "Package once, run anywhere; orchestrate with health checks, rolling deploys and resource limits. Containers are not the same thing as VMs or LXC.",
        points: [
          "A container shares the host kernel and isolates with namespaces and cgroups; a VM runs a whole guest OS, so containers start faster and cost less.",
          "LXC/LXD gives you long-lived, system-like containers with their own init — closer to a lightweight VM, and a fine fit for legacy services.",
          "Multi-stage builds keep images small; pin base images, scan them for vulnerabilities and run as a non-root user.",
          "Kubernetes needs requests/limits, readiness and liveness probes, and a plan for persistent data.",
        ],
        code: dockerExample,
      },
      {
        id: "web-servers",
        title: "Nginx, Caddy & Apache",
        blurb:
          "A reverse proxy in front of your app: TLS, compression, static files, caching, routing and backpressure.",
        points: [
          "Nginx is the default: event-driven, excellent static/TLS handling, `proxy_pass`, gzip/brotli and rate limiting at the edge.",
          "Caddy wins on simplicity — automatic HTTPS certificates, a tiny config and sane defaults; Apache remains common with `.htaccess`-based legacy apps.",
          "Set proxy timeouts, body limits and forwarded headers deliberately; defaults are often too generous and break client IP logging.",
          "Serverless platforms remove server management but add cold starts, execution limits and vendor coupling.",
        ],
      },
    ],
  },
  {
    id: "scale",
    number: "09",
    title: "Scale, reliability & observability",
    tagline: "Design for failure, then measure everything",
    summary:
      "Scaling is mostly about removing single points of failure and knowing what 'healthy' means. Learn load balancing, database scaling, mitigation patterns, and the metrics, logs and traces that tell you the truth.",
    topics: [
      {
        id: "scaling-basics",
        title: "Scaling fundamentals",
        blurb:
          "Vertical vs horizontal scaling, statelessness, session stores and capacity planning.",
        points: [
          "Scale out stateless instances behind a load balancer; move sessions and files to shared services.",
          "Find the bottleneck first — CPU, memory, connections, locks or a downstream dependency.",
          "Load test with realistic traffic shapes before an event, and keep a baseline to compare against.",
        ],
      },
      {
        id: "load-balancing",
        title: "Load balancing & health checks",
        blurb:
          "Round robin, least connections, consistent hashing, and readiness vs liveness.",
        points: [
          "Readiness decides traffic, liveness decides restarts — mixing them up causes outage loops.",
          "Drain connections gracefully on shutdown; in-flight requests should finish.",
          "Sticky sessions are a smell; if you need them, document why and plan an exit.",
        ],
      },
      {
        id: "db-scaling",
        title: "Scaling databases",
        blurb:
          "Read replicas, connection pooling, partitioning, sharding and the CAP trade-off.",
        points: [
          "Replicas scale reads but introduce replication lag; route reads that can tolerate staleness.",
          "Sharding is a last resort with operational cost — choose a high-cardinality key and plan resharding.",
          "CAP is a trade-off under partition: decide per operation whether consistency or availability wins.",
        ],
      },
      {
        id: "failure-modes",
        title: "Failure modes",
        blurb:
          "Timeouts, retries, partial failures, cascading failures and thundering herds. Design the blast radius.",
        points: [
          "Every network call needs a timeout; retries need jitter and a budget to avoid amplification.",
          "Isolate bulkheads so one slow dependency cannot consume all threads or connections.",
          "Test failure paths (kill a dependency, add latency) before production teaches you.",
        ],
      },
      {
        id: "mitigation",
        title: "Mitigation strategies",
        blurb:
          "Circuit breakers, throttling, backpressure, graceful degradation and load shifting.",
        points: [
          "A circuit breaker fails fast while a dependency is unhealthy, then probes for recovery.",
          "Degrade non-essential features (recommendations, avatars) instead of failing the checkout.",
          "Shift load in time (queues, scheduled jobs) and in space (replicas, regions) where possible.",
        ],
        code: resilienceExample,
      },
      {
        id: "observability",
        title: "Observability: metrics, logs, traces",
        blurb:
          "Spring Boot Actuator, Micrometer and OpenTelemetry give you the three pillars without guessing.",
        points: [
          "Instrument golden signals: latency, traffic, errors and saturation, per endpoint and dependency.",
          "Correlate logs with trace and span ids; structured JSON logs make queries possible.",
          "Alert on user-visible symptoms (error rate, p95 latency), not on raw CPU alone.",
        ],
        code: observabilityExample,
      },
      {
        id: "profiling",
        title: "Profiling & performance work",
        blurb:
          "Measure, form a hypothesis, change one thing. JFR, async-profiler, heap dumps and query plans.",
        points: [
          "Profile in an environment that resembles production; synthetic micro-benchmarks mislead.",
          "Watch GC pauses, thread pools, connection pools and lock contention before adding hardware.",
          "Record the before/after numbers — an unmeasured optimisation is a guess.",
        ],
      },
    ],
  },
  {
    id: "ai",
    number: "10",
    title: "AI-augmented backend",
    tagline: "The 2026 additions: LLM features and AI-assisted delivery",
    summary:
      "Modern backends increasingly expose AI features and are built with AI tools. Learn the integration patterns — structured outputs, streaming, function calling, RAG — and the guardrails: cost, latency, privacy and evaluation.",
    topics: [
      {
        id: "llm-basics",
        title: "How LLMs work (enough to build)",
        blurb:
          "Tokens, context windows, temperature, embeddings and why outputs are probabilistic.",
        points: [
          "Models predict tokens; they do not query your database or know your private facts unless you provide them.",
          "Context is a budget: more retrieved text can improve answers and increase cost and latency.",
          "Design for non-determinism: validate, retry, fall back, and show sources.",
        ],
      },
      {
        id: "prompting",
        title: "Prompting & structured outputs",
        blurb:
          "Instructions, few-shot examples, JSON schemas and refusing to answer when evidence is missing.",
        points: [
          "Ask for a schema, validate it server-side, and treat parse failures as a normal error path.",
          "Give the model the retrieved facts and require citations; do not let it invent policy.",
          "Keep prompts versioned in code and evaluate changes against a fixed test set.",
        ],
        code: llmExample,
      },
      {
        id: "integration",
        title: "Integration patterns",
        blurb:
          "Server-side API calls, streaming responses, function/tool calling and timeouts on every call.",
        points: [
          "Never expose the provider key to the browser; the backend proxies and rate-limits.",
          "Stream tokens to the client for perceived speed, but keep a non-streaming fallback.",
          "Set per-request token budgets, timeouts and retries; log usage per user for cost control.",
        ],
      },
      {
        id: "rag",
        title: "RAG & embeddings",
        blurb:
          "Chunk documents, embed them, store vectors, retrieve the best matches, then answer with citations.",
        points: [
          "Retrieval quality dominates answer quality; chunk by meaning and keep metadata for filtering.",
          "Re-embed when the model or chunking changes; version your index alongside the app.",
          "Evaluate retrieval and answer accuracy separately so you know what to fix.",
        ],
      },
      {
        id: "agents-mcp",
        title: "Agents & MCP",
        blurb:
          "Tool-using agents and the Model Context Protocol for connecting models to systems safely.",
        points: [
          "Give agents the smallest useful toolset and require explicit authorization for side effects.",
          "Log every tool call with inputs and outputs; agents need auditability more than chat UIs do.",
          "Human-in-the-loop for irreversible actions: payments, deletions, access changes.",
        ],
      },
      {
        id: "ai-refactoring",
        title: "AI refactoring, tests & documentation",
        blurb:
          "Models are genuinely useful for restructuring code, writing tests and keeping docs current — if the compiler and test suite stay in charge.",
        points: [
          "Refactor in small, test-covered steps: one change, run the suite, read the diff, commit. Never accept a sweeping rewrite you cannot explain.",
          "Generate tests for existing behaviour, then fix the assertions yourself — coverage without meaningful assertions is noise.",
          "Draft READMEs, ADRs and API descriptions from the code and OpenAPI spec, but verify accuracy, security notes and every command before publishing.",
        ],
      },
      {
        id: "ai-workflow",
        title: "AI in the delivery workflow",
        blurb:
          "Copilot, Cursor, Claude Code for scaffolding, tests, migrations and reviews — with guardrails.",
        points: [
          "Use AI for the boring 60%, spend your attention on boundaries, security and failure handling.",
          "Never send secrets, customer data or unreleased code to unapproved tools.",
          "Keep tests and reviews as the safety net; velocity without verification is debt.",
        ],
      },
    ],
  },
];

export const allTopics = phases.flatMap((phase) =>
  phase.topics.map((topic) => ({
    ...topic,
    ...(topicDetails[topic.id] ?? {}),
    phaseId: phase.id,
    phaseTitle: phase.title,
    phaseNumber: phase.number,
  })),
);

export const totalTopics = allTopics.length;

export const stackChips = [
  "Java 21",
  "Spring Boot 3",
  "PostgreSQL",
  "Redis",
  "Kafka",
  "Docker",
  "Kubernetes",
  "GitHub Actions",
  "OpenTelemetry",
  "REST",
  "gRPC",
  "JUnit 5",
];
