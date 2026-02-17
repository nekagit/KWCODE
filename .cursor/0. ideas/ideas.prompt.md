# PROMPT 03: GENERATE IDEAS.MD

Copy this prompt into Cursor with Opus 4.6 to generate `.cursor/0. ideas/ideas.md`

---

You are a visionary AI product strategist, innovation consultant, and senior engineer who has shaped product roadmaps at companies like Linear, Vercel, Stripe, Figma, and leading AI startups. You're an expert in developer tools, AI-augmented workflows, and cutting-edge UX patterns for 2025-2026.

## YOUR TASK

Generate a **comprehensive, inspiring, and actionable `ideas.md`** file that serves as the innovation roadmap and R&D backlog for this project. This document should capture the ambitious vision while remaining technically grounded and prioritized.

## PROJECT CONTEXT ANALYSIS

**FIRST, deeply understand the current project:**

1. **Identify the Core Problem Space**
   - What problem does this project solve?
   - Who are the primary users?
   - What's the current scope (MVP vs. mature product)?
   - What's the unique value proposition?

2. **Analyze the Current Feature Set**
   - List existing features
   - Identify gaps in the user journey
   - Find pain points that could be smoothed
   - Spot opportunities for AI enhancement

3. **Map the Competitive Landscape**
   - What similar tools exist?
   - What do they do well?
   - What do they miss?
   - What could differentiate THIS project?

4. **Assess Technical Capabilities**
   - Current tech stack
   - Integration points
   - AI capabilities in use
   - Available APIs and services

**OUTPUT this analysis in a brief section at the top of ideas.md as "Project Context & Current State"**

---

## REQUIRED SECTIONS

Generate an ideas.md with the following structure. Be AMBITIOUS yet PRAGMATIC.

### 1. VISION STATEMENT

**North Star (12-18 Months)**

Write a compelling 4-6 sentence vision statement that answers:
- What does this project become?
- How does it transform the user's workflow?
- What makes it irreplaceable?
- What emotional response should users have?

Example structure:
> "[Project Name] becomes the [category-defining description] that [transformation statement]. Unlike [competitors], it [unique differentiator]. Users feel [emotional benefit] because [reason]. The vision is [bold outcome statement].

**Key Differentiators (Top 3)**

1. **[Differentiator #1]** - Why this matters vs. alternatives
2. **[Differentiator #2]** - The unique insight
3. **[Differentiator #3]** - The unfair advantage

---

### 2. TIER 1 — HIGH-IMPACT, NEAR-TERM IDEAS (1-3 Months)

List 10-15 ideas. For EACH idea, provide:

```markdown
#### [Idea Number]. [CATCHY TITLE]

**Problem**: [What specific pain does this solve?]

**Solution**: [3-5 sentence description of the feature]

**AI Integration**: [How AI enhances this - be specific: which model, what prompts, what technique?]

**User Flow**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Technical Approach**: [High-level implementation notes]

**Dependencies**: [What must exist first?]

**Effort**: S / M / L

**Impact**: 🔥🔥🔥 (transformative) | 🔥🔥 (significant) | 🔥 (valuable)

**Success Metrics**: [How do we know this worked?]
```

**Suggested Idea Categories for Tier 1:**

**AI-Powered Automation:**
- Intelligent prompt chaining (multi-step workflows with context passing)
- Auto-categorization and tagging (ML-based classification)
- Smart scheduling and prioritization (predict effort, suggest order)
- Automated code review or quality checks
- Context-aware suggestions (recommend next action based on state)

**User Experience Improvements:**
- Advanced search with semantic understanding (vector embeddings)
- Keyboard-first workflows (command palette, shortcuts)
- Real-time collaboration features (cursor presence, live updates)
- Customizable views and dashboards (drag-drop widgets)
- Smart defaults (learn from user behavior, adjust settings)

**Developer Productivity:**
- One-click project scaffolding (opinionated templates)
- Git integration (branch-per-feature, auto-commit, PR gen)
- API playground (test endpoints, inspect responses)
- Hot reload preview (instant UI updates)
- Performance profiling (identify slow components)

**Data & Analytics:**
- Usage analytics dashboard (track feature adoption)
- Time tracking and estimates (actual vs. predicted)
- Productivity insights (bottlenecks, patterns)
- Team performance metrics (if applicable)

**Integrations:**
- OAuth providers (GitHub, GitLab, Bitbucket)
- Third-party APIs (Jira, Linear, Asana, Notion)
- Slack/Discord webhooks (notifications, bot commands)
- CI/CD pipeline triggers (deploy from app)
- Cloud storage (sync to Google Drive, Dropbox)

---

### 3. TIER 2 — MEDIUM-TERM INNOVATION (3-6 Months)

List 8-12 ideas. Same format as Tier 1, but MORE ambitious:

**Suggested Categories for Tier 2:**

**Multi-Agent Orchestration:**
- Agent collaboration workflows (architect → frontend → backend → QA)
- Parallel task execution (multiple agents working simultaneously)
- Agent memory and context sharing (shared knowledge base)
- Automated handoffs (agent A completes → agent B starts)
- Conflict resolution (when agents disagree, how to decide?)

**Advanced AI Capabilities:**
- Fine-tuned models (train on project-specific data)
- Multi-modal AI (code + images + diagrams)
- Self-improving prompts (A/B test prompt variations)
- Caching and streaming (reduce latency, progressive responses)
- Fallback strategies (GPT-4 → GPT-3.5 if rate limited)

**Knowledge Management:**
- Vector database for project docs (semantic search, RAG)
- Automated documentation generation (code → markdown)
- Decision record tracking (ADRs, why we chose X)
- Cross-project learning (insights from past projects)
- Contextual help system (AI tutor for the app)

**Workflow Automation:**
- Custom workflow builder (drag-drop nodes, triggers)
- Scheduled jobs and cron-like automation
- Event-driven architecture (webhook → action → result)
- Conditional logic (if-then rules for workflows)
- Template marketplace (share/import workflows)

**Collaboration & Sharing:**
- Session sharing (invite collaborator to live session)
- Comments and annotations (async feedback loops)
- Approval workflows (gate features on approval)
- Public sharing (share read-only project view)
- Team workspaces (multi-user, role-based access)

---

### 4. TIER 3 — MOONSHOT / R&D EXPLORATIONS (6-12 Months)

List 5-8 visionary ideas that push boundaries:

**Suggested Moonshots:**

**Self-Improving Systems:**
- AI that refactors and optimizes its own codebase
- Automated test generation from feature specs
- Self-healing error detection and auto-fix
- Continuous improvement loop (measure → learn → adapt)

**Autonomous Agents:**
- Background agent that monitors and suggests improvements
- Proactive agent (opens PRs without being asked)
- "AI pair programmer" mode (real-time collaboration)
- Agent that learns user preferences over time

**Cross-Project Intelligence:**
- Meta-learning from all projects (patterns, best practices)
- Recommendations based on similar projects
- Automatic library/tool suggestions
- Risk detection (predict failure points)

**Novel Interfaces:**
- Voice-driven project management (natural language commands)
- Visual programming / flow-based prompt authoring
- AR/VR code review (spatial code visualization)
- Gestural controls (for touch/tablet)

**Production-Grade Deployment:**
- One-click deploy to Vercel/Netlify/Railway
- Integrated CI/CD pipeline (push to production)
- Monitoring and alerting (errors, performance)
- Rollback and versioning (safe deploys)

---

### 5. TECHNICAL R&D EXPLORATIONS

List 6-10 technical deep-dives that enable future features:

**AI & ML Infrastructure:**
- **Local LLM Integration**: Running Ollama/llama.cpp models via native shell (Tauri/Electron) for offline AI
- **WebSocket Streaming**: Real-time token streaming for AI responses (improve perceived speed)
- **Vector Embeddings**: Semantic search over project knowledge base (pinecone, weaviate, or local)
- **Fine-Tuning Pipeline**: Train custom models on user data (OpenAI fine-tuning API or local)
- **Prompt Caching**: Cache frequently used prompts to reduce cost/latency

**Data & Storage:**
- **CRDT-based Collaboration**: Conflict-free real-time editing (Yjs, Automerge)
- **IndexedDB for Offline**: Fully offline-capable app with sync
- **GraphQL Subscriptions**: Real-time data updates (Apollo, urql)
- **Database Sharding**: Horizontal scaling strategy (if multi-tenant)

**Performance & Scalability:**
- **Edge Functions**: Run logic closer to users (Vercel Edge, Cloudflare Workers)
- **Service Workers**: Advanced caching and offline strategies
- **Code Splitting**: Advanced lazy loading (route-based, component-based)
- **Image Optimization**: CDN, compression, lazy loading, blur placeholders

**Developer Experience:**
- **Wasm Plugins**: User-extensible transforms running in browser sandbox
- **MCP (Model Context Protocol)**: Integrate MCP servers for richer AI tool use
- **Plugin System**: User-created extensions (API + marketplace)
- **Hot Module Replacement**: Instant code updates without refresh

**Security & Privacy:**
- **End-to-End Encryption**: User data encrypted at rest and in transit
- **Zero-Knowledge Architecture**: Server can't read user data
- **Local-First Approach**: All data stored locally, optional cloud sync
- **Audit Logs**: Track all changes for compliance

---

### 6. UX INNOVATION IDEAS

List 8-12 UX-specific innovations:

**Command & Control:**
- **Command Palette (⌘K)**: Fuzzy search across all entities, AI-powered suggestions
- **Quick Actions**: Context-sensitive shortcuts (right-click menus, hotkeys)
- **Breadcrumb Navigation**: Persistent context (where am I, how did I get here?)
- **Recent History**: Jump to recently viewed items

**Visualization & Organization:**
- **Spatial Canvas**: Infinite canvas for dragging projects, features, tickets
- **Timeline View**: Chronological view of all activity (git-style)
- **Dependency Graph**: Visualize relationships between entities
- **Mind Map Mode**: Brainstorm ideas in a tree structure

**Focus & Productivity:**
- **Focus Mode**: Hide everything except current task
- **Do Not Disturb**: Mute notifications during deep work
- **Pomodoro Timer**: Built-in time management
- **Zen Mode**: Distraction-free writing

**Personalization:**
- **Custom Dashboards**: Drag-drop widget layout
- **Themes & Styles**: Beyond light/dark (custom color schemes)
- **Layout Preferences**: Sidebar left/right, compact/comfortable density
- **AI Chat Sidebar**: Persistent chat that understands full project context

**Gamification & Motivation:**
- **Streak Tracking**: Days in a row working on projects
- **Milestones & Badges**: Celebrate accomplishments
- **Productivity Scores**: Visualize output over time
- **Leaderboards**: (If team-based) friendly competition

**Accessibility & Inclusivity:**
- **High Contrast Mode**: For visually impaired users
- **Dyslexia-Friendly Font**: OpenDyslexic option
- **Screen Reader Optimization**: Full ARIA support
- **Keyboard Navigation**: 100% keyboard-accessible

---

### 7. COMPETITIVE ANALYSIS MATRIX

Create a comparison table showing where this project stands vs. competitors:

```markdown
| Feature | [This Project] (Current) | [This Project] (Planned) | Cursor | GitHub Copilot | Windsurf | Linear | Notion | [Other Competitor] |
|---------|--------------------------|--------------------------|--------|----------------|----------|--------|--------|---------------------|
| AI Code Generation | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ? |
| Multi-Agent Workflows | ❌ | 🚧 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kanban Boards | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ? |
| Local LLM Support | ❌ | 🚧 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Real-Time Collaboration | ❌ | 🚧 | ✅ | ❌ | ✅ | ✅ | ✅ | ? |
| Native Desktop App | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ? |
| API Access | ❌ | 🚧 | ✅ | ✅ | ❌ | ✅ | ✅ | ? |
| Open Source | ❌ | ? | ❌ | ❌ | ❌ | ❌ | ❌ | ? |
| Self-Hosting | ❌ | 🚧 | ❌ | ❌ | ❌ | ❌ | ❌ | ? |
| Pricing | Free | $X/mo | $20/mo | $10/mo | ? | $8/mo | $10/mo | ? |

**Legend**: ✅ = Shipped | 🚧 = Planned | ❌ = Not Available | ? = Unknown
```

**Key Insights from Comparison:**
- [What gaps exist in the market?]
- [Where can this project lead?]
- [What features are table stakes vs. differentiators?]

---

### 8. PRIORITIZATION FRAMEWORK

Define the scoring model used to rank ideas:

**Scoring Formula:**
```
Priority Score = (Impact × Feasibility × Strategic Alignment) / Effort
```

**Definitions:**
- **Impact**: 1-5 (How much does this move the needle?)
- **Feasibility**: 1-5 (Can we build this with current tech/team?)
- **Strategic Alignment**: 1-5 (Does this advance the vision?)
- **Effort**: 1-5 (How much work required? 1=days, 5=months)

**Scoring Matrix:**

| Idea | Impact | Feasibility | Alignment | Effort | Score | Priority |
|------|--------|-------------|-----------|--------|-------|----------|
| AI Prompt Chaining | 5 | 4 | 5 | 3 | 33.3 | P0 |
| Real-Time Collab | 4 | 3 | 4 | 5 | 9.6 | P2 |
| Local LLM Support | 3 | 3 | 5 | 4 | 11.25 | P1 |
| ... | ... | ... | ... | ... | ... | ... |

**Priority Buckets:**
- **P0 (Must Have)**: Score > 25 — Build now
- **P1 (Should Have)**: Score 15-25 — Next 3-6 months
- **P2 (Nice to Have)**: Score 10-15 — Someday
- **P3 (Wishlist)**: Score < 10 — Archive for now

---

### 9. RANKED BACKLOG (TOP 15 IDEAS)

Based on the prioritization framework, list the top 15 ideas across all tiers:

1. **[Idea Name]** (Tier 1) — Priority Score: 35 — Impact: 🔥🔥🔥
2. **[Idea Name]** (Tier 1) — Priority Score: 32 — Impact: 🔥🔥🔥
3. **[Idea Name]** (Tier 2) — Priority Score: 28 — Impact: 🔥🔥
4. **[Idea Name]** (Tier 1) — Priority Score: 26 — Impact: 🔥🔥
5. ...
15. **[Idea Name]** (Tier 3) — Priority Score: 18 — Impact: 🔥

---

### 10. IDEA LIFECYCLE MANAGEMENT

**How Ideas Move Through the Pipeline:**

```
💡 Proposed → 🔍 Researched → ✅ Validated → 🚧 In Progress → 🚀 Shipped → 📊 Measured
```

**Stage Definitions:**
- **💡 Proposed**: New idea, needs research
- **🔍 Researched**: Feasibility assessed, requirements defined
- **✅ Validated**: User feedback collected, greenlit
- **🚧 In Progress**: Being built
- **🚀 Shipped**: Deployed to production
- **📊 Measured**: Success metrics tracked, iterate or pivot

**Rejection Criteria (When to Archive):**
- Low user demand (validated with surveys/interviews)
- Technical infeasibility (can't build with current stack)
- Strategic misalignment (doesn't advance vision)
- Resource constraints (team too small, timeline too long)

---

### 11. USER FEEDBACK INTEGRATION

**How to Capture & Integrate User Ideas:**

**Feedback Channels:**
- In-app feedback widget (thumbs up/down + comment)
- GitHub Issues / Discussion board
- User interviews (1-on-1, 30-minute calls)
- Surveys (quarterly, NPS + feature requests)
- Community Discord/Slack (async conversations)

**Feedback Processing:**
1. Triage weekly (tag by category: bug, feature, enhancement)
2. Cluster similar requests (find patterns)
3. Add to ideas.md (if novel and aligned)
4. Reply to user (acknowledge, set expectations)
5. Prioritize (using framework above)

**Closing the Loop:**
- When an idea ships, notify all requesters
- Share release notes highlighting community contributions
- Celebrate power users (shout-outs, beta access)

---

### 12. INNOVATION EXPERIMENTS

**Low-Risk Ways to Test Ideas:**

**A. Feature Flags**
- Ship features to 10% of users (A/B test)
- Measure engagement, collect feedback
- Roll out to 100% or roll back

**B. Prototyping**
- Build low-fidelity mockups (Figma, Excalidraw)
- Share with 5-10 users for feedback
- Iterate before coding

**C. Dogfooding**
- Use the app internally before public release
- Find pain points, rough edges
- Fix before shipping

**D. Beta Programs**
- Invite power users to test unreleased features
- Offer early access in exchange for feedback
- Build a community of advocates

**E. Spike Projects**
- Timebox research (1-2 days max)
- Prove or disprove feasibility
- Document learnings, decide go/no-go

---

### 13. RISKS & MITIGATION

**Common Risks for Ambitious Ideas:**

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| **Scope Creep** | High | High | Strict prioritization, MVP-first mindset, timeboxing |
| **Technical Debt** | Medium | High | Code reviews, refactoring sprints, automated testing |
| **User Adoption** | Medium | High | User research, beta testing, onboarding flows |
| **AI Cost Overruns** | Medium | Medium | Caching, cheaper models for low-stakes tasks, rate limiting |
| **Security Vulnerabilities** | Low | Critical | Penetration testing, security audits, bug bounty |
| **Team Burnout** | Medium | High | Sustainable pace, clear priorities, saying no to low-value work |

---

## FORMATTING REQUIREMENTS

1. **Use Markdown** with headers (##, ###, ####)
2. **Use Emojis** for visual scanning (🚀 📊 🧠 ⚡ 🎨 🔧 🌙 🔥 💡 ✅)
3. **Use Tables** for comparisons, matrices, scoring
4. **Use Code Blocks** for technical snippets (typescript, bash, mermaid)
5. **Be Inspiring** — write in an exciting, forward-thinking tone
6. **Be Specific** — no vague "improve UX" ideas, always concrete
7. **Be Pragmatic** — every idea must be buildable
8. **Length**: 600-900 lines

---

## FINAL OUTPUT STRUCTURE

```markdown
# Ideas & Innovation Roadmap — [Project Name]

**Version**: 1.0  
**Last Updated**: [Date]  
**Author**: Product Strategist & AI Innovator (AI)

---

## Project Context & Current State

[Brief analysis]

---

## 1. Vision Statement

[Content]

---

## 2. Tier 1 — High-Impact, Near-Term Ideas (1-3 Months)

[Content]

---

## 3. Tier 2 — Medium-Term Innovation (3-6 Months)

[Content]

---

## 4. Tier 3 — Moonshot / R&D Explorations (6-12 Months)

[Content]

---

## 5. Technical R&D Explorations

[Content]

---

## 6. UX Innovation Ideas

[Content]

---

## 7. Competitive Analysis Matrix

[Content]

---

## 8. Prioritization Framework

[Content]

---

## 9. Ranked Backlog (Top 15 Ideas)

[Content]

---

## 10. Idea Lifecycle Management

[Content]

---

## 11. User Feedback Integration

[Content]

---

## 12. Innovation Experiments

[Content]

---

## 13. Risks & Mitigation

[Content]

---

## Appendix: Idea Template

Use this template when proposing new ideas:

```markdown
#### [Idea Name]

**Problem**: 
**Solution**: 
**AI Integration**: 
**User Flow**: 
**Technical Approach**: 
**Dependencies**: 
**Effort**: 
**Impact**: 
**Success Metrics**: 
```

---

*This ideas document is a living roadmap. Update it as priorities shift and new opportunities emerge.*
```

---

## FINAL INSTRUCTION

Generate the complete `ideas.md` file in .cursor/0. ideas NOW. Be ambitious, inspiring, and actionable. Reference the actual project context where possible. Make it a roadmap that excites users and guides development for the next 12-18 months.