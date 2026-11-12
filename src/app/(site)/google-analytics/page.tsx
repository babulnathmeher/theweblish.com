import { ServicePage, serviceMetadata } from "@/components/site/service-page";

export function generateMetadata() { return serviceMetadata("google-analytics"); }

export default function Page() { return <ServicePage slug="google-analytics" />; }
