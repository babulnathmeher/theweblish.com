import { ServicePage, serviceMetadata } from "@/components/site/service-page";

export function generateMetadata() { return serviceMetadata("landing-page-design"); }

export default function Page() { return <ServicePage slug="landing-page-design" />; }
