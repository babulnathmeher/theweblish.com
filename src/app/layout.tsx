import type { Metadata } from "next";
import { siteUrl } from "@/config/site";
import "./globals.css";
import "./admin-toast.css";
import { AdminToastProvider } from "@/components/admin/admin-toast";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "The Weblish", template: "%s | The Weblish" },
  description: "The Weblish website.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AdminToastProvider>{children}</AdminToastProvider></body></html>;
}
