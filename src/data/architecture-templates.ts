/**
 * Static architecture templates (DDD, microservices, etc.) for the Architecture tab.
 */
import type { ArchitectureTemplate, ArchitectureCategory } from "@/types/architecture";

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplate[] = [
  {
    name: "Domain-Driven Design (DDD)",
    category: "ddd",
    description: "Design software around the business domain; use ubiquitous language, bounded contexts, and aggregates.",
    practices: "- Ubiquitous language: same terms in code and domain\n- Bounded contexts: explicit boundaries per subdomain\n- Entities, value objects, aggregates, domain events\n- Anti-corruption layer at context boundaries\n- Domain experts and devs collaborate",
    scenarios: "Complex business logic; multiple subdomains; long-lived projects; when domain clarity matters more than tech flexibility.",
  },
  {
    name: "Test-Driven Development (TDD)",
    category: "tdd",
    description: "Write failing tests first, then minimal code to pass, then refactor. Red–green–refactor.",
    practices: "- Write a failing test before production code\n- Small steps; one behavior per test\n- Refactor after green; keep tests passing\n- Prefer unit tests for logic; integration where needed\n- Fast feedback; avoid testing implementation details",
    scenarios: "New features; bug fixes; legacy code changes; when you want high coverage and design pressure from tests.",
  },
  {
    name: "Behavior-Driven Development (BDD)",
    category: "bdd",
    description: "Specify behavior in natural language (Given/When/Then); align devs, QA, and stakeholders.",
    practices: "- Scenarios in plain language: Given, When, Then\n- Focus on behavior, not implementation\n- Shared specs (e.g. Gherkin) as living documentation\n- Automate scenarios as acceptance tests\n- Collaborate on examples before coding",
    scenarios: "Acceptance criteria; cross-team alignment; regression-safe flows; when non-devs need to read specs.",
  },
  {
    name: "DRY (Don't Repeat Yourself)",
    category: "dry",
    description: "Every piece of knowledge should have a single, unambiguous representation in the system.",
    practices: "- Extract repeated logic into functions/modules\n- Parameterize instead of copy-paste\n- Single source of truth for config and constants\n- Don’t over-abstract too early (Rule of Three)\n- Balance with readability and locality",
    scenarios: "Repeated business rules; shared validation; config and constants; when duplication causes drift and bugs.",
  },
  {
    name: "SOLID principles",
    category: "solid",
    description: "Five object-oriented design principles: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion.",
    practices: "- SRP: One reason to change per class\n- OCP: Open for extension, closed for modification\n- LSP: Subtypes must be substitutable for base types\n- ISP: Many specific interfaces over one general\n- DIP: Depend on abstractions, not concretions",
    scenarios: "OOP codebases; libraries and frameworks; when you need testability and flexibility over time.",
  },
  {
    name: "KISS (Keep It Simple, Stupid)",
    category: "kiss",
    description: "Prefer the simplest solution that works; avoid unnecessary complexity.",
    practices: "- Solve the problem in front of you\n- Avoid premature abstraction and patterns\n- Prefer clear, linear code over clever tricks\n- Delete code you don’t need\n- Simple doesn’t mean naive",
    scenarios: "MVP; small teams; when maintenance and onboarding matter more than flexibility.",
  },
  {
    name: "YAGNI (You Aren't Gonna Need It)",
    category: "yagni",
    description: "Don’t implement functionality until it’s actually required.",
    practices: "- No speculative features or “might need later” code\n- Add abstractions when you have at least two real uses\n- Defer generic frameworks until concrete needs appear\n- Refactor when requirements emerge, not in advance",
    scenarios: "Early stage products; uncertain requirements; when over-engineering is a risk.",
  },
  {
    name: "Clean Architecture",
    category: "clean",
    description: "Layers of concentric circles: entities innermost, use cases, interface adapters, frameworks outermost. Dependencies point inward.",
    practices: "- Dependency rule: inner layers don’t know outer layers\n- Entities: enterprise business rules\n- Use cases: application-specific rules\n- Interface adapters: controllers, presenters, gateways\n- Frameworks & drivers: UI, DB, HTTP",
    scenarios: "Long-lived apps; multiple UIs or data sources; when testability and independence from frameworks matter.",
  },
  {
    name: "Hexagonal (Ports & Adapters)",
    category: "hexagonal",
    description: "Core domain in the center; ports define interfaces; adapters implement them (HTTP, DB, messaging).",
    practices: "- Ports: interfaces for incoming (API) and outgoing (DB, external)\n- Adapters: implement ports (REST controller, repository impl)\n- Core has no framework or IO dependencies\n- Test core with in-memory adapters\n- One primary, many secondary adapters",
    scenarios: "Multiple entry points (API, CLI, jobs); swap DB or external services; test domain in isolation.",
  },
  {
    name: "CQRS (Command Query Responsibility Segregation)",
    category: "cqrs",
    description: "Separate read and write models; commands change state, queries return data. Often paired with event sourcing.",
    practices: "- Commands: intent to change; no return value (or id)\n- Queries: return data; no side effects\n- Different models for read vs write if needed\n- Eventually consistent read models; sync via events or jobs\n- Don’t use for trivial CRUD unless scaling reads",
    scenarios: "High read/write asymmetry; complex read models; audit and replay; when write and read optimizations differ.",
  },
  {
    name: "Event Sourcing",
    category: "event_sourcing",
    description: "Store state changes as a log of events; current state is derived by replaying events.",
    practices: "- Append-only event store; events immutable\n- Aggregate state = fold over events\n- Snapshots for performance when needed\n- Event versioning and schema evolution\n- Use for audit, replay, and multiple read models",
    scenarios: "Audit requirements; temporal queries; replay and debugging; CQRS read models; collaboration and integration.",
  },
  {
    name: "Microservices",
    category: "microservices",
    description: "Small, autonomous services around business capabilities; independent deployability and tech diversity.",
    practices: "- One bounded context or capability per service\n- Own data; communicate via API or events\n- Design for failure; circuit breakers, timeouts\n- Independent deploy and scale\n- Start modular monolith; split when boundaries are clear",
    scenarios: "Large teams; independent release cycles; different scaling or tech per area; when operational complexity is acceptable.",
  },
  {
    name: "REST API design",
    category: "rest",
    description: "Resource-oriented HTTP APIs: nouns as URLs, verbs as methods, stateless, HATEOAS optional.",
    practices: "- Resources and collections: /users, /users/123\n- GET idempotent; POST create; PUT/PATCH update; DELETE remove\n- Status codes: 200, 201, 204, 400, 401, 404, 500\n- Versioning: URL or header; consistent\n- Pagination, filtering, sparse fields for large lists",
    scenarios: "Public or partner APIs; CRUD-heavy; when HTTP caching and tooling (browsers, proxies) are useful.",
  },
  {
    name: "GraphQL API design",
    category: "graphql",
    description: "Single endpoint; client-defined queries and fields; strong typing and introspection.",
    practices: "- Schema-first; types and resolvers\n- Clients request only needed fields (no over/under fetch)\n- Mutations for writes; subscriptions for real-time\n- N+1: DataLoader or batching\n- Auth and rate limiting at resolver or gateway",
    scenarios: "Mobile or many clients; flexible query needs; when one size doesn’t fit all and you can afford complexity.",
  },
  {
    name: "Scenario: High-throughput API",
    category: "scenario",
    description: "Guidelines for APIs that must handle high request volume and low latency.",
    practices: "- Caching: HTTP cache, application cache, read-through\n- Async and non-blocking I/O where possible\n- Connection pooling; limit payload size\n- Rate limiting and backpressure\n- Observability: metrics, tracing, structured logs",
    scenarios: "Public APIs; real-time or near-real-time; traffic spikes; cost-sensitive scaling.",
  },
  {
    name: "Scenario: Secure by default",
    category: "scenario",
    description: "Security practices for auth, data, and deployment.",
    practices: "- Auth: tokens, expiry, refresh; principle of least privilege\n- Input validation and output encoding; parameterized queries\n- HTTPS only; secure headers (CSP, HSTS, etc.)\n- Secrets in env/vault; no secrets in code or logs\n- Dependency scanning and updates",
    scenarios: "User data; regulated domains; public-facing services; zero-trust environments.",
  },
];
