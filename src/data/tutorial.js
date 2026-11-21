// A zero-to-deployed Spring Boot tutorial that builds one real project:
// the "Shortly" link shortener from the beginner tier of the projects track.
// Every chapter ends with a checkpoint you can run, so a complete beginner can
// follow along without opening another tab.

export const tutorialMeta = {
  title: "Spring Boot from zero to deployed",
  project: "Shortly — a link shortener with click analytics",
  projectId: "link-shortener",
  totalTime: "about 12–16 focused hours",
  prerequisites: [
    "JDK 21 installed (`java -version` prints 21).",
    "An editor with Java support — IntelliJ IDEA Community, VS Code with the Java pack, or Eclipse.",
    "Docker Desktop, for the database and for the container chapter.",
    "curl (built into macOS/Linux; on Windows use Git Bash or PowerShell's curl alias).",
    "No Spring experience needed. You should be able to read a Java class and run a terminal command.",
  ],
  outcome:
    "A running API with a real PostgreSQL schema, validated endpoints, redirects, click analytics, tests, a Docker image and a CI pipeline — the same code the beginner project asks for.",
};

const appExample = {
  file: "src/main/java/dev/shortly/ShortlyApplication.java",
  lang: "java",
  code: `package dev.shortly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShortlyApplication {

  public static void main(String[] args) {
    SpringApplication.run(ShortlyApplication.class, args);
  }
}`,
};

const pomExample = {
  file: "pom.xml — the dependencies that matter",
  lang: "xml",
  code: `<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.4.1</version>
</parent>

<properties>
  <java.version>21</java.version>
</properties>

<dependencies>
  <!-- HTTP endpoints, JSON, embedded Tomcat -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <!-- Bean Validation: @NotBlank, @Size, @Pattern -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  <!-- JPA + Hibernate: entities and repositories -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <!-- Flyway: versioned SQL migrations -->
  <dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
  </dependency>
  <dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
  </dependency>
  <!-- Driver is runtime-only: your code never imports it -->
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
  </dependency>
  <!-- Health, metrics, info -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
  <!-- Tests: JUnit 5 + AssertJ + Mockito + MockMvc -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
  <!-- Real PostgreSQL inside tests -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>`,
};

const firstControllerExample = {
  file: "HealthController.java + your first curl",
  lang: "java",
  code: `package dev.shortly.web;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

  @GetMapping("/health")
  public Map<String, Object> health() {
    return Map.of("status", "ok", "time", Instant.now().toString());
  }
}

// Run it:
//   ./mvnw spring-boot:run
// Then in another terminal:
//   curl -i http://localhost:8080/health
//
// HTTP/1.1 200
// Content-Type: application/json
// {"status":"ok","time":"2026-11-21T09:12:44.512Z"}`,
};

const configExample = {
  file: "src/main/resources/application.yml",
  lang: "yaml",
  code: `spring:
  application:
    name: shortly
  datasource:
    # Defaults for local work; production overrides them with env vars.
    url: \${DB_URL:jdbc:postgresql://localhost:5432/shortly}
    username: \${DB_USER:shortly}
    password: \${DB_PASSWORD:shortly}
  jpa:
    open-in-view: false      # do not lazy-load while serialising JSON
    hibernate:
      ddl-auto: validate     # Flyway owns the schema, Hibernate only checks it
    properties:
      hibernate:
        jdbc:
          time_zone: UTC
  flyway:
    enabled: true
  threads:
    virtual:
      enabled: true          # Java 21 virtual threads for request handling

server:
  port: \${PORT:8080}
  shutdown: graceful

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      probes:
        enabled: true

logging:
  pattern:
    level: "%5p [traceId=%X{traceId:-}]"`,
};

const migrationExample = {
  file: "src/main/resources/db/migration/V1__create_links.sql",
  lang: "sql",
  code: `create table links (
  id           uuid primary key,
  slug         varchar(12) not null unique,
  target_url   text not null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz,
  constraint slug_is_url_safe check (slug ~ '^[A-Za-z0-9_-]{4,12}$')
);

create table clicks (
  id           bigserial primary key,
  link_id      uuid not null references links (id) on delete cascade,
  clicked_at   timestamptz not null default now(),
  user_agent   text,
  referrer     text
);

-- "clicks per link, newest first" without scanning the whole table
create index clicks_link_time_idx on clicks (link_id, clicked_at desc);

-- handy for cleaned-up links
create index links_expires_idx on links (expires_at) where expires_at is not null;`,
};

const entityExample = {
  file: "Link.java + LinkRepository.java",
  lang: "java",
  code: `package dev.shortly.link;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "links")
public class Link {

  @Id
  private UUID id;

  @Column(nullable = false, unique = true, length = 12)
  private String slug;

  @Column(name = "target_url", nullable = false)
  private String targetUrl;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "expires_at")
  private Instant expiresAt;

  protected Link() {} // JPA needs a no-arg constructor

  public static Link create(String slug, String targetUrl, Instant expiresAt) {
    var link = new Link();
    link.id = UUID.randomUUID();
    link.slug = slug;
    link.targetUrl = targetUrl;
    link.createdAt = Instant.now();
    link.expiresAt = expiresAt;
    return link;
  }

  public boolean isExpired(Instant now) {
    return expiresAt != null && expiresAt.isBefore(now);
  }

  public UUID getId() { return id; }
  public String getSlug() { return slug; }
  public String getTargetUrl() { return targetUrl; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getExpiresAt() { return expiresAt; }
}

// ---------------------------------------------------------------

package dev.shortly.link;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LinkRepository extends JpaRepository<Link, UUID> {

  Optional<Link> findBySlug(String slug);

  boolean existsBySlug(String slug);
}`,
};

const slugServiceExample = {
  file: "SlugGenerator.java + LinkService.java",
  lang: "java",
  code: `package dev.shortly.link;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class SlugGenerator {

  private static final String ALPHABET =
      "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final int LENGTH = 7;

  private final SecureRandom random = new SecureRandom();

  public String next() {
    var builder = new StringBuilder(LENGTH);
    for (int i = 0; i < LENGTH; i++) {
      builder.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
    }
    return builder.toString();
  }
}

// ---------------------------------------------------------------

package dev.shortly.link;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LinkService {

  private static final int MAX_ATTEMPTS = 5;

  private final LinkRepository links;
  private final SlugGenerator slugs;

  public LinkService(LinkRepository links, SlugGenerator slugs) {
    this.links = links;
    this.slugs = slugs;
  }

  @Transactional
  public Link create(String targetUrl, Integer ttlDays) {
    var expiresAt = ttlDays == null
        ? null
        : Instant.now().plus(ttlDays, ChronoUnit.DAYS);

    // A 7-character slug has ~3.5e12 combinations, but collisions are
    // still possible: retry instead of assuming uniqueness.
    for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      var slug = slugs.next();
      if (!links.existsBySlug(slug)) {
        return links.save(Link.create(slug, targetUrl, expiresAt));
      }
    }
    throw new SlugExhaustedException();
  }

  @Transactional(readOnly = true)
  public Link resolve(String slug) {
    return links.findBySlug(slug)
        .filter(link -> !link.isExpired(Instant.now()))
        .orElseThrow(() -> new LinkNotFoundException(slug));
  }
}`,
};

const controllerExample = {
  file: "LinkController.java + DTOs",
  lang: "java",
  code: `package dev.shortly.web;

import dev.shortly.link.Link;
import dev.shortly.link.LinkService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.time.Instant;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/links")
public class LinkController {

  private final LinkService links;

  public LinkController(LinkService links) {
    this.links = links;
  }

  @PostMapping
  public ResponseEntity<LinkResponse> create(@Valid @RequestBody CreateLinkRequest request) {
    var link = links.create(request.url(), request.ttlDays());

    return ResponseEntity
        .created(URI.create("/api/v1/links/" + link.getSlug()))
        .body(LinkResponse.from(link));
  }
}

// The redirect lives at the root, not under /api: short URLs must stay short.
@RestController
class RedirectController {

  private final LinkService links;

  RedirectController(LinkService links) {
    this.links = links;
  }

  @GetMapping("/{slug:[A-Za-z0-9_-]{4,12}}")
  public ResponseEntity<Void> redirect(@PathVariable String slug) {
    var link = links.resolve(slug);

    return ResponseEntity.status(HttpStatus.FOUND)          // 302
        .location(URI.create(link.getTargetUrl()))
        .cacheControl(CacheControl.noStore())
        .build();
  }
}

// ---------------------------------------------------------------

package dev.shortly.web;

import jakarta.validation.constraints.*;
import java.time.Instant;

public record CreateLinkRequest(
    @NotBlank
    @Size(max = 2048)
    @Pattern(regexp = "^https?://.+", message = "must start with http:// or https://")
    String url,

    @Min(1) @Max(365)
    Integer ttlDays) {}

record LinkResponse(String slug, String shortUrl, String targetUrl,
                    Instant createdAt, Instant expiresAt) {

  static LinkResponse from(dev.shortly.link.Link link) {
    return new LinkResponse(
        link.getSlug(),
        "http://localhost:8080/" + link.getSlug(),
        link.getTargetUrl(),
        link.getCreatedAt(),
        link.getExpiresAt());
  }
}`,
};

const errorExample = {
  file: "ApiExceptionHandler.java",
  lang: "java",
  code: `package dev.shortly.web;

import dev.shortly.link.LinkNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(LinkNotFoundException.class)
  public ProblemDetail notFound(LinkNotFoundException ex) {
    var problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    problem.setTitle("Link not found");
    problem.setProperty("code", "LINK_NOT_FOUND");
    return problem;
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail invalid(MethodArgumentNotValidException ex) {
    var problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_REQUEST, "One or more fields are invalid");

    problem.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(
            error -> error.getField(),
            error -> error.getDefaultMessage() == null
                ? "invalid" : error.getDefaultMessage(),
            (first, second) -> first)));

    return problem;
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail unexpected(Exception ex, HttpServletRequest request) {
    // Log the details, never return them.
    org.slf4j.LoggerFactory.getLogger(ApiExceptionHandler.class)
        .error("unhandled error on {}", request.getRequestURI(), ex);

    var problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
    problem.setProperty("code", "INTERNAL_ERROR");
    return problem;
  }
}

// curl -s -X POST localhost:8080/api/v1/links \\
//   -H 'Content-Type: application/json' \\
//   -d '{"url":"not-a-url"}' | jq
// {
//   "type": "about:blank",
//   "title": "Bad Request",
//   "status": 400,
//   "detail": "One or more fields are invalid",
//   "errors": { "url": "must start with http:// or https://" }
// }`,
};

const clicksExample = {
  file: "ClickRecorder.java + ClickRepository.java",
  lang: "java",
  code: `package dev.shortly.click;

import dev.shortly.link.Link;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClickRecorder {

  private static final Logger log = LoggerFactory.getLogger(ClickRecorder.class);
  private final ClickRepository clicks;

  public ClickRecorder(ClickRepository clicks) {
    this.clicks = clicks;
  }

  // Analytics must never break the redirect: log and move on if it fails.
  // Read the headers on the request thread: the servlet request is recycled
  // once the response completes, so it must not be used inside @Async.
  @Async
  @Transactional
  public void recordAsync(Link link, String userAgent, String referrer) {
    try {
      clicks.save(Click.of(
          link.getId(),
          Instant.now(),
          truncate(userAgent, 500),
          truncate(referrer, 500)));
    } catch (RuntimeException ex) {
      log.warn("could not record click for {}", link.getSlug(), ex);
    }
  }

  private static String truncate(String value, int max) {
    return value == null || value.length() <= max ? value : value.substring(0, max);
  }
}

// ---------------------------------------------------------------

package dev.shortly.click;

import java.time.*;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClickRepository extends JpaRepository<Click, Long> {

  @Query(value = """
      select cast(date_trunc('day', clicked_at) as date) as day, count(*) as clicks
      from clicks
      where link_id = :linkId
      group by 1
      order by 1 desc
      limit 30
      """, nativeQuery = true)
  List<DailyClicks> last30Days(@Param("linkId") UUID linkId);

  interface DailyClicks {
    java.sql.Date getDay();
    long getClicks();
  }
}`,
};

const testExample = {
  file: "SlugGeneratorTest.java + LinkApiIT.java",
  lang: "java",
  code: `package dev.shortly.link;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.HashSet;
import org.junit.jupiter.api.Test;

class SlugGeneratorTest {

  private final SlugGenerator generator = new SlugGenerator();

  @Test
  void generates_url_safe_slugs_of_fixed_length() {
    for (int i = 0; i < 1_000; i++) {
      assertThat(generator.next()).matches("^[A-Za-z0-9_-]{7}$");
    }
  }

  @Test
  void is_unlikely_to_repeat_in_a_small_batch() {
    var seen = new HashSet<String>();
    for (int i = 0; i < 1_000; i++) {
      assertThat(seen.add(generator.next())).isTrue();
    }
  }
}

// ---------------------------------------------------------------

package dev.shortly;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class LinkApiIT {

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:16-alpine");

  @Autowired MockMvc mvc;

  @Test
  void creates_a_link_and_redirects_to_it() throws Exception {
    var body = """
        {"url": "https://spring.io/guides", "ttlDays": 7}
        """;

    var created = mvc.perform(post("/api/v1/links")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.slug").isNotEmpty())
        .andReturn();

    var slug = com.jayway.jsonpath.JsonPath
        .read(created.getResponse().getContentAsString(), "$.slug");

    mvc.perform(get("/" + slug))
        .andExpect(status().isFound())
        .andExpect(header().string("Location", "https://spring.io/guides"));
  }

  @Test
  void rejects_a_url_without_a_scheme() throws Exception {
    mvc.perform(post("/api/v1/links")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\\"url\\": \\"example.com\\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.url").exists());
  }
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

# Runtime stage: small, no build tools, non-root
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]`,
};

const composeExample = {
  file: "compose.yaml",
  lang: "yaml",
  code: `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: shortly
      POSTGRES_USER: shortly
      POSTGRES_PASSWORD: shortly
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shortly"]
      interval: 5s
      timeout: 3s
      retries: 10

  api:
    build: .
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_URL: jdbc:postgresql://db:5432/shortly
      DB_USER: shortly
      DB_PASSWORD: shortly
    ports:
      - "8080:8080"

volumes:
  db-data:`,
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
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "21"
          cache: maven
      - name: Unit + integration tests
        run: mvn -B verify
      - name: Build image
        run: docker build -t shortly:\${{ github.sha }} .
      # Deploy only from main; the image is the artifact you tested.
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: echo "push shortly:\${{ github.sha }} to your registry, then roll out"
        env:
          DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`,
};

const clickEntityExample = {
  file: "Click.java",
  lang: "java",
  code: `package dev.shortly.click;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "clicks")
public class Click {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "link_id", nullable = false)
  private UUID linkId;

  @Column(name = "clicked_at", nullable = false)
  private Instant clickedAt;

  @Column(name = "user_agent", length = 500)
  private String userAgent;

  @Column(length = 500)
  private String referrer;

  protected Click() {}

  public static Click of(UUID linkId, Instant clickedAt,
                         String userAgent, String referrer) {
    var click = new Click();
    click.linkId = linkId;
    click.clickedAt = clickedAt;
    click.userAgent = userAgent;
    click.referrer = referrer;
    return click;
  }
}`,
};

const exceptionsExample = {
  file: "LinkNotFoundException.java + SlugExhaustedException.java",
  lang: "java",
  code: `package dev.shortly.link;

public class LinkNotFoundException extends RuntimeException {

  public LinkNotFoundException(String slug) {
    super("No link for slug " + slug);
  }
}

// ---------------------------------------------------------------

package dev.shortly.link;

public class SlugExhaustedException extends RuntimeException {

  public SlugExhaustedException() {
    super("Could not allocate a unique slug");
  }
}`,
};

export const chapters = [
  {
    id: "ch-01",
    number: "01",
    title: "Set up the project",
    tagline: "JDK, Spring Initializr, and the first successful run",
    time: "45 min",
    goal:
      "Create a Spring Boot project that starts, connects to nothing yet, and answers an HTTP request. Getting the toolchain right once saves days of confusion later.",
    steps: [
      "Install JDK 21 and confirm with `java -version`. Spring Boot 3.4 requires Java 17+, and all examples here use 21.",
      "Go to start.spring.io (or use your IDE's Spring Boot wizard) and pick: Maven, Java, Spring Boot 3.4.x, group `dev.shortly`, artifact `shortly`, dependencies Spring Web, Validation, Spring Data JPA, PostgreSQL Driver, Flyway Migration and Spring Boot Actuator.",
      "Unzip, open the folder in your editor, and let Maven import. The first import downloads dependencies and can take a few minutes.",
      "Run `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`). The log ends with 'Started ShortlyApplication' and Tomcat listening on 8080.",
      "Add the health controller below, restart, and call it with curl. If you see JSON, your whole loop — edit, compile, run, request — works.",
    ],
    code: firstControllerExample,
    extraCode: pomExample,
    checkpoint:
      "`curl -i localhost:8080/health` returns 200 with a JSON body, and the app starts again after a restart without manual fixes.",
    pitfalls: [
      "Port 8080 already in use: stop the other process or set `server.port=8081`.",
      "`java -version` printing 17 or 8: set JAVA_HOME to the JDK 21 install and reopen the terminal.",
    ],
    projectMilestone: "Project skeleton exists and runs.",
  },
  {
    id: "ch-02",
    number: "02",
    title: "Understand what a controller does",
    tagline: "Routing, JSON, and reading a request",
    time: "40 min",
    goal:
      "Learn the request path in Spring MVC: Tomcat accepts the socket, DispatcherServlet picks a handler by method and path, Jackson serialises the return value. Everything else is a variation of this.",
    steps: [
      "`@RestController` means 'the return value is the response body', not a view name.",
      "`@GetMapping(\"/health\")` maps GET requests for that exact path. Change it to `/status` and watch the old URL start returning 404.",
      "Add a second method with `@GetMapping(\"/hello/{name}\")` and a `@PathVariable String name`. Call `/hello/ana`.",
      "Return a `record` instead of a Map, then add an unknown field — Jackson ignores it by default. That default is a hint that input needs validation.",
      "Open the app's log after each request; Spring logs the mapping at startup, which is the fastest way to see every route you have.",
    ],
    code: appExample,
    checkpoint:
      "You can explain why `/health` returns JSON without any serialisation code, and you have a route with a path variable working.",
    pitfalls: [
      "Two methods mapped to the same method+path fail at startup with an ambiguous mapping error — that is a feature.",
      "Returning a `String` from a `@RestController` writes text, not JSON, unless you return an object.",
    ],
    projectMilestone: "Routing understood; health endpoint in place.",
  },
  {
    id: "ch-03",
    number: "03",
    title: "Configuration and project layout",
    tagline: "One application.yml, environment variables, package by feature",
    time: "45 min",
    goal:
      "Replace hard-coded values with configuration that differs per environment, and arrange packages so the project stays readable as it grows.",
    steps: [
      "Create `src/main/resources/application.yml` with the content below. Note the `${DB_URL:default}` syntax: an environment variable with a local fallback.",
      "Create packages `dev.shortly.link`, `dev.shortly.click` and `dev.shortly.web`. Business code goes in the feature package; HTTP code goes in `web`.",
      "Start PostgreSQL locally with `docker run --name shortly-db -e POSTGRES_DB=shortly -e POSTGRES_USER=shortly -e POSTGRES_PASSWORD=shortly -p 5432:5432 -d postgres:16-alpine`.",
      "Restart the app. It should connect; the startup log shows HikariPool starting. If it fails, the error tells you whether it is the URL, user or password.",
      "Read the config once more: `ddl-auto: validate` means Hibernate will refuse to start if the schema does not match the entities — exactly what you want.",
    ],
    code: configExample,
    checkpoint:
      "The app starts against a real PostgreSQL, and changing `PORT=9090` in the environment moves the server without touching code.",
    pitfalls: [
      "Leaving `ddl-auto: update` in a real project eventually mutates the schema silently.",
      "Passwords committed in application.yml are in git history forever; use environment variables.",
    ],
    projectMilestone: "Environment-based config and feature packages.",
  },
  {
    id: "ch-04",
    number: "04",
    title: "Design the database schema",
    tagline: "Two tables, constraints, and indexes that match the queries",
    time: "60 min",
    goal:
      "Write the schema before the Java code. Constraints and indexes are cheaper to get right now than after data exists.",
    steps: [
      "Create `src/main/resources/db/migration/V1__create_links.sql` with the SQL below.",
      "Restart the app. Flyway runs the migration on startup and records it in `flyway_schema_history`. Check with `docker exec -it shortly-db psql -U shortly -d shortly -c '\\dt'`.",
      "Note the CHECK constraint on the slug: the database rejects bad data even if application code has a bug.",
      "Note the index `(link_id, clicked_at desc)`: it serves 'clicks for this link, newest first' without scanning.",
      "Think about the unique index on `slug` — it is what actually prevents duplicates when two requests race; an application-level check alone cannot.",
    ],
    code: migrationExample,
    checkpoint:
      "`\\dt` lists links, clicks and flyway_schema_history, and inserting a row with an invalid slug is rejected by the database.",
    pitfalls: [
      "Never edit a migration that has already run; add `V2__...sql` instead.",
      "`text` with a separate length check is usually better than guessing varchar sizes, but slugs are fixed by design.",
    ],
    projectMilestone: "Project requirement: real schema with a unique slug index.",
  },
  {
    id: "ch-05",
    number: "05",
    title: "Entities and repositories",
    tagline: "Map the tables, then let Spring Data write the queries",
    time: "60 min",
    goal:
      "Turn the schema into a JPA entity with a protected no-arg constructor and factory method, then get queries for free from a repository interface.",
    steps: [
      "Create `Link` in `dev.shortly.link` with the mapping below. Keep fields private, the constructor protected, and creation behind a static factory.",
      "Create `LinkRepository extends JpaRepository<Link, UUID>` with `findBySlug` and `existsBySlug`. Spring Data derives the SQL from the method name.",
      "Add a `CommandLineRunner` temporarily (or a test) that saves one link and reads it back, so you see it work before adding HTTP.",
      "Verify rows in psql with `select * from links;`. Notice the column names come from `@Column(name=...)`, not the Java field names.",
      "Do not add setters. An entity that can be mutated anywhere is how invariants get lost.",
    ],
    code: entityExample,
    checkpoint:
      "A link saved through the repository appears in PostgreSQL and is returned by `findBySlug`.",
    pitfalls: [
      "Missing no-arg constructor: Hibernate fails at startup with a confusing instantiation error.",
      "Using `@Data`/Lombok on entities generates `equals`/`hashCode` over mutable fields and breaks collections.",
    ],
    projectMilestone: "Persistence layer for links.",
  },
  {
    id: "ch-06",
    number: "06",
    title: "Business logic: slugs and transactions",
    tagline: "Secure randomness, collision retries, one transaction per use case",
    time: "60 min",
    goal:
      "Generate short, URL-safe, unguessable slugs and handle the rare collision. Put the rule in a service, not a controller.",
    steps: [
      "Create `SlugGenerator` with `SecureRandom` and an alphabet that omits look-alike characters (0/O, 1/l/I). Seven characters gives about 3.5 trillion combinations.",
      "Create `LinkService.create(url, ttlDays)` that retries a few times if `existsBySlug` is true, then saves.",
      "Why both the check and the unique index? The check keeps the common case cheap; the index is the real guarantee when two requests race.",
      "Add `@Transactional` on write methods and `@Transactional(readOnly = true)` on reads. Verify with SQL logging that a failed create rolls back.",
      "Compute `expiresAt` from `ttlDays` in UTC. Never store local times.",
    ],
    code: slugServiceExample,
    checkpoint:
      "Creating three links produces three different slugs, and the expiry date is exactly N days from now in UTC.",
    pitfalls: [
      "`java.util.Random` is predictable and must never generate identifiers.",
      "Catching the unique-constraint exception requires a new transaction; retrying inside the failed one does not work.",
      "Self-invoking a `@Transactional` method inside the same class bypasses the proxy.",
      "The `existsBySlug` check is not race-free: two simultaneous requests can both pass it. The unique index stops the duplicate, so catch `DataIntegrityViolationException` and retry with a new transaction (or return 409) instead of trusting the check.",
    ],
    projectMilestone: "Project requirement: unique slug generation and expiry.",
  },
  {
    id: "ch-07",
    number: "07",
    title: "Build the REST API",
    tagline: "POST with validation, 201 + Location, and a root-level redirect",
    time: "75 min",
    goal:
      "Expose the service over HTTP with correct status codes and separate request/response records, while keeping short URLs short.",
    steps: [
      "Create the DTO records. `CreateLinkRequest` carries only what a client may set — never bind the entity directly.",
      "`POST /api/v1/links` validates, creates, and returns 201 with a `Location` header pointing at the new resource.",
      "The redirect endpoint is mapped at `/{slug}` with a regex pattern, so it does not swallow `/api`, `/health` or `/actuator`.",
      "Return 302 (`FOUND`) and `Cache-Control: no-store` so browsers and CDNs do not cache the redirect forever.",
      "Test the whole path with curl: create, then `curl -i -L localhost:8080/<slug>` and watch the redirect happen.",
    ],
    code: controllerExample,
    checkpoint:
      "POST returns 201 with a slug; GET `/{slug}` returns 302 with the original URL in `Location`; an unknown slug returns 404.",
    pitfalls: [
      "A catch-all `/{slug}` mapping can shadow your API routes — constrain it with a regex.",
      "Returning 200 from a create hides the difference between success and a no-op.",
    ],
    projectMilestone: "Project requirement: create + redirect endpoints.",
  },
  {
    id: "ch-08",
    number: "08",
    title: "Validation and error responses",
    tagline: "One error shape for every failure the client can cause",
    time: "50 min",
    goal:
      "Reject bad input with useful messages and return the same RFC 9457 shape everywhere, so clients write one error handler instead of ten.",
    steps: [
      "The annotations on the DTO are Bean Validation: `@NotBlank`, `@Size`, `@Pattern`, `@Min`/`@Max`.",
      "`@Valid` on the parameter is what triggers them; without it the annotations are decoration.",
      "Create `LinkNotFoundException` and `SlugExhaustedException` in the feature package — exceptions are part of the domain.",
      "Add `@RestControllerAdvice` with handlers for your exceptions and for validation failures. Use `ProblemDetail`, the Spring implementation of RFC 9457.",
      "Verify with curl: a bad URL gives 400 with an `errors` map; a missing slug gives 404 with `code: LINK_NOT_FOUND`.",
    ],
    code: errorExample,
    extraCode: exceptionsExample,
    checkpoint:
      "No endpoint ever returns a stack trace, and every client error has a stable `code` and a readable `detail`.",
    pitfalls: [
      "A generic `Exception` handler that returns 400 for everything hides real server bugs; return 500 and log it.",
      "Logging the request body can leak passwords into your log aggregator.",
    ],
    projectMilestone: "Project requirement: validated input and problem responses.",
  },
  {
    id: "ch-09",
    number: "09",
    title: "Click analytics that cannot break redirects",
    tagline: "Record asynchronously, aggregate in SQL",
    time: "60 min",
    goal:
      "Count visits without adding latency or a failure mode to the redirect. Analytics is a side effect: it may fail, the redirect may not.",
    steps: [
      "Create the `Click` entity for the `clicks` table and `ClickRepository` with the native aggregation query.",
      "Add `@EnableAsync` to the application class and make `ClickRecorder.recordAsync` run off the request thread.",
      "Call the recorder from the redirect controller with `link.getId()`, `request.getHeader(\"User-Agent\")` and `request.getHeader(\"Referer\")`. Read the headers before handing off — the request object is recycled once the response completes, so it must never be used inside an `@Async` method.",
      "Add `GET /api/v1/links/{slug}/stats` returning total clicks and the daily breakdown. Verify with a few curls.",
      "Optional but recommended: pass a bounded `TaskExecutor` so a traffic spike cannot create unlimited threads.",
    ],
    code: clicksExample,
    extraCode: clickEntityExample,
    checkpoint:
      "Ten redirects produce ten click rows, the stats endpoint reports them grouped by day, and stopping the database does not stop redirects from working.",
    pitfalls: [
      "`@Async` on a private method or a self-invoked method silently runs synchronously.",
      "Annotating a repository save in the request path makes the redirect fail when analytics fails.",
    ],
    projectMilestone: "Project requirement: click counting and stats.",
  },
  {
    id: "ch-10",
    number: "10",
    title: "Tests: unit and integration",
    tagline: "JUnit, AssertJ, MockMvc and a real PostgreSQL",
    time: "75 min",
    goal:
      "Prove the slug rules with fast unit tests and the HTTP contract with an integration test against a real database — the same checks your CI will run.",
    steps: [
      "Write `SlugGeneratorTest` first. It needs no Spring context, so it runs in milliseconds.",
      "Add `spring-boot-testcontainers` and `org.testcontainers:postgresql` (test scope) and write `LinkApiIT` with `@SpringBootTest`, `@AutoConfigureMockMvc` and `@Testcontainers`.",
      "`@ServiceConnection` wires the container's URL into the app automatically — no `@DynamicPropertySource` needed with Boot 3.1+.",
      "Cover the unhappy paths: invalid URL, unknown slug, expired link. Those are the cases that break in production.",
      "Run `./mvnw verify` and confirm both test classes are reported. Docker must be running for the integration test.",
    ],
    code: testExample,
    checkpoint:
      "`./mvnw verify` passes from a clean clone with only Docker installed, and breaking the validation rule makes a test fail.",
    pitfalls: [
      "Tests sharing one database row fail when run in parallel; each test should create its own data.",
      "Using H2 instead of PostgreSQL lets SQL that production rejects pass in CI.",
    ],
    projectMilestone: "Project requirement: integration test for create → redirect.",
  },
  {
    id: "ch-11",
    number: "11",
    title: "Make it observable and production-ready",
    tagline: "Health probes, metrics, structured logs, graceful shutdown",
    time: "40 min",
    goal:
      "Give operators the signals they need: is it alive, is it ready, how slow is it, and what happened in that failing request.",
    steps: [
      "Actuator is already a dependency; the config in chapter 3 exposes `health`, `info` and `metrics` only. Check `/actuator/health`.",
      "Enable readiness and liveness groups (`management.endpoint.health.probes.enabled=true`) so Kubernetes or a platform can distinguish 'starting' from 'broken'.",
      "Add the log pattern with a trace id placeholder. When you add Micrometer Tracing later it fills in automatically; until then it prints a dash.",
      "Confirm graceful shutdown is on. In-flight requests finish instead of being killed mid-response.",
      "Never expose `env`, `heapdump` or `threaddump` publicly — they leak configuration and memory.",
    ],
    code: configExample,
    checkpoint:
      "`/actuator/health` reports `UP`, `/actuator/health/readiness` exists, and logs include a consistent level and logger name.",
    pitfalls: [
      "A liveness probe that checks the database restarts healthy instances during a database blip.",
      "Exposing all actuator endpoints with `include: '*'` is a common and serious misconfiguration.",
    ],
    projectMilestone: "Health endpoint and production config.",
  },
  {
    id: "ch-12",
    number: "12",
    title: "Containerise the app",
    tagline: "Multi-stage Dockerfile, compose with PostgreSQL, non-root runtime",
    time: "60 min",
    goal:
      "Produce one image that runs anywhere and a compose file that starts the app plus its database with one command.",
    steps: [
      "Add the Dockerfile below at the repository root. The first stage builds with Maven; the second ships only a JRE and the jar.",
      "Add a `.dockerignore` with `target`, `.git`, `.idea` and `*.iml` so the build context stays small.",
      "Add `compose.yaml`. `depends_on` with `condition: service_healthy` waits for PostgreSQL before starting the API.",
      "Run `docker compose up --build`. Flyway migrates the fresh database automatically on startup.",
      "Verify `docker compose exec api id` shows a non-root user, and that `/actuator/health` answers through the mapped port.",
    ],
    code: dockerExample,
    extraCode: composeExample,
    checkpoint:
      "`docker compose up` starts db and api from scratch, migrations run, and the redirect endpoint works from the container.",
    pitfalls: [
      "`COPY . .` before `mvn dependency:go-offline` re-downloads dependencies on every source change.",
      "Using a full JDK in the runtime stage doubles the image size for no benefit.",
    ],
    projectMilestone: "Project requirement: Docker image running as non-root.",
  },
  {
    id: "ch-13",
    number: "13",
    title: "CI and a real deployment",
    tagline: "One pipeline, one artifact, one health-checked rollout",
    time: "60 min",
    goal:
      "Automate exactly what you ran locally, then deploy the artifact you tested behind a reverse proxy with TLS.",
    steps: [
      "Add `.github/workflows/ci.yml`. It runs `mvn -B verify` (including Testcontainers) and builds the image on every push and PR.",
      "Push the image to a registry (GHCR is free for public repos) tagged with the commit SHA. Never deploy `latest`.",
      "Deploy by running that exact image with environment variables for `DB_URL`, `DB_USER` and `DB_PASSWORD`. Secrets come from the platform, not the repo.",
      "Put Nginx or Caddy in front: terminate TLS, `proxy_pass http://127.0.0.1:8080`, forward `X-Forwarded-For` and `X-Forwarded-Proto`, and set proxy timeouts above your slowest endpoint.",
      "After deploy, curl `/actuator/health` and one real redirect. If the health check fails, roll back to the previous image — that is why you tagged by SHA.",
    ],
    code: ciExample,
    checkpoint:
      "A push to main produces a green pipeline, a SHA-tagged image, and a deployed instance whose health endpoint and redirect both work over HTTPS.",
    pitfalls: [
      "Deploying a freshly built image instead of the tested one means production runs unverified code.",
      "Skipping the reverse-proxy forwarded headers makes rate limits and logs see one IP: the proxy's.",
    ],
    projectMilestone: "Project requirement: CI pipeline and deployable image.",
  },
  {
    id: "ch-14",
    number: "14",
    title: "Where to go next",
    tagline: "Harden it, then reuse the same skeleton for the next projects",
    time: "ongoing",
    goal:
      "You now have the full loop: schema, entity, service, API, errors, analytics, tests, container, pipeline. The next step is adding the concerns that make it production-shaped.",
    steps: [
      "Add rate limiting per IP on `POST /api/v1/links` (Bucket4j or a Redis counter) and return 429 with `Retry-After`.",
      "Add caching for the redirect path: Redis or Caffeine with a short TTL, evicted on delete.",
      "Add a delete and an update endpoint, then decide who is allowed to call them — you have no users yet, so this is where authentication enters.",
      "Add OpenAPI with springdoc and publish `/swagger-ui.html` in non-production only.",
      "Move on to the next beginner project (a task API) to repeat the loop without a tutorial, then the intermediate order service to meet money, idempotency and Kafka.",
    ],
    code: null,
    checkpoint:
      "You can rebuild this project from an empty folder without the tutorial, explaining each layer as you write it.",
    pitfalls: [
      "Adding microservices, Kafka and Kubernetes to a link shortener before it has users is how projects die unfinished.",
      "Skipping the tests to 'move faster' makes every later feature a gamble.",
    ],
    projectMilestone: "Beginner project complete — ready for the next tier.",
  },
];
