import { ServicePage, serviceMetadata } from "@/components/site/service-page";

export function generateMetadata() { return serviceMetadata("logo-design"); }

export default function Page() { return <ServicePage slug="logo-design" />; }
