import { ServicePage, serviceMetadata } from "@/components/site/service-page";

export function generateMetadata() { return serviceMetadata("facebook-marketing"); }

export default function Page() { return <ServicePage slug="facebook-marketing" />; }
