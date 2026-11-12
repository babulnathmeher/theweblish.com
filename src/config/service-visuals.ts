import type { ServiceIconKind } from "@/components/site/service-icon";
import type { ServiceSlug } from "@/config/service-pages";

export type ServiceVisualSlug = ServiceSlug | "website-development";

export const serviceVisuals = {
  "website-development": { icon: "browser", category: "Websites" },
  "web-design-company-in-bhubaneswar": { icon: "layout", category: "Design" },
  "landing-page-design": { icon: "landing", category: "Design" },
  "logo-design": { icon: "identity", category: "Identity" },
  "web-development-company-in-bhubaneswar": { icon: "code", category: "Development" },
  "wordpress-development-company-in-bhubaneswar": { icon: "editor", category: "Development" },
  "seo-company-in-bhubaneswar": { icon: "search", category: "Marketing" },
  "marketing-company-in-bhubaneswar": { icon: "megaphone", category: "Marketing" },
  "facebook-marketing": { icon: "social", category: "Marketing" },
  "google-analytics": { icon: "analytics", category: "Measurement" },
} satisfies Record<ServiceVisualSlug, { icon: ServiceIconKind; category: string }>;
