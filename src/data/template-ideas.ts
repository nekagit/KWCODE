/**
 * Template ideas (predefined SaaS, webapp, etc.) for the Ideas page and prompts.
 */
/** Idea category for template ideas (matches IdeaRecord) */
export type TemplateIdeaCategory =
  | "saas"
  | "iaas"
  | "paas"
  | "website"
  | "webapp"
  | "webshop"
  | "other";

export interface TemplateIdea {
  id: string;
  title: string;
  description: string;
  category: TemplateIdeaCategory;
}

/** 10 template ideas users can pick to generate a full project with AI */
export const TEMPLATE_IDEAS: TemplateIdea[] = [
  {
    id: "template-saas-dashboard",
    title: "SaaS analytics dashboard",
    description:
      "A webapp for teams to view metrics, charts, and KPIs. Role-based access, filters, export to CSV/PDF, and real-time updates.",
    category: "saas",
  },
  {
    id: "template-qr-business-card",
    title: "QR digital business card",
    description:
      "A webapp that lets users design and share digital business cards with QR codes. Customizable layout, links, and contact info.",
    category: "webapp",
  },
  {
    id: "template-task-board",
    title: "Team task board (Kanban)",
    description:
      "A Trello-like board with lists, cards, drag-and-drop, due dates, labels, and optional comments. For small teams or personal use.",
    category: "webapp",
  },
  {
    id: "template-event-calendar",
    title: "Event calendar & booking",
    description:
      "Public calendar with events, sign-up, and optional payments. Good for workshops, classes, or community meetups.",
    category: "webapp",
  },
  {
    id: "template-docs-site",
    title: "Documentation / docs site",
    description:
      "A docs site with sidebar nav, search, versioning, and code snippets. Aimed at API or product documentation.",
    category: "website",
  },
  {
    id: "template-landing-saas",
    title: "SaaS landing page",
    description:
      "Landing page for a SaaS product: hero, features, pricing, testimonials, FAQ, and CTA. Conversion-focused.",
    category: "website",
  },
  {
    id: "template-mini-ecommerce",
    title: "Mini e‑commerce / webshop",
    description:
      "Small webshop with product list, detail page, cart, and checkout. Inventory and orders for a single vendor.",
    category: "webshop",
  },
  {
    id: "template-api-portal",
    title: "API developer portal",
    description:
      "Portal for API consumers: API keys, docs, usage stats, and logs. For B2B or internal API products.",
    category: "saas",
  },
  {
    id: "template-community-forum",
    title: "Community forum / Q&A",
    description:
      "Forum with topics, threads, replies, upvotes, and basic moderation. For support communities or knowledge bases.",
    category: "webapp",
  },
  {
    id: "template-internal-tool",
    title: "Internal ops tool",
    description:
      "Internal tool for ops: CRUD on core entities, simple reports, and audit log. For small teams managing data or workflows.",
    category: "webapp",
  },
];
