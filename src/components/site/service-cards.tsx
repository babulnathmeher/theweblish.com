import Link from "next/link";
import { serviceNavigation } from "@/config/navigation";
import { servicePages, type ServiceSlug } from "@/config/service-pages";
import { serviceVisuals, type ServiceVisualSlug } from "@/config/service-visuals";
import { ServiceIcon, type ServiceIconKind } from "@/components/site/service-icon";
import { getPublishedServiceCards, isNewManagedService } from "@/features/services/public";
import { serviceIcons, servicePath } from "@/features/services/validation";

export async function ServiceCards({ count }: { count?: number }) {
  const managed = await getPublishedServiceCards();
  const overrides = new Map(managed.map((service) => [service.slug, service]));
  const cardServices = serviceNavigation.filter((service) => service.href !== "/website-development/");
  const services: { label: string; href: string; description: string; category: string; icon: ServiceIconKind }[] = [
    ...cardServices.map((service) => {
      const slug = service.href.slice(1, -1) as ServiceVisualSlug;
      const visual = serviceVisuals[slug];
      const override = overrides.get(slug);
      return { label: override?.title || service.label, href: service.href, description: override?.summary || servicePages[slug as ServiceSlug].intro, category: override?.category || visual.category, icon: override && serviceIcons.includes(override.icon as ServiceIconKind) ? override.icon as ServiceIconKind : visual.icon };
    }),
    ...managed.filter((service) => isNewManagedService(service.slug)).map((service) => ({ label: service.title, href: servicePath(service.slug), description: service.summary, category: service.category, icon: serviceIcons.includes(service.icon as ServiceIconKind) ? service.icon as ServiceIconKind : "browser" as const })),
  ];
  const visible = count ? services.slice(0, count) : services;
  return <div className="card-grid service-card-grid">{visible.map((service, index) => {
    return <article className="service-card" key={service.href}>
      <Link className="service-card-link" href={service.href} aria-label={`Explore ${service.label}`}>
        <div className="service-card-top"><span className="service-card-icon"><ServiceIcon kind={service.icon} /></span><span className="card-number">{String(index + 1).padStart(2, "0")} / {service.category}</span></div>
        <div className="service-card-content"><h3>{service.label}</h3><p>{service.description}</p></div>
        <span className="service-card-bottom"><span>Explore service</span><span className="service-card-arrow" aria-hidden="true">↗</span></span>
      </Link>
    </article>;
  })}</div>;
}
