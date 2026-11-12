import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto max-w-4xl p-8"><h1 className="text-3xl font-bold">Page not found</h1><p className="mt-4">The requested page is unavailable.</p><Link className="mt-6 inline-block underline" href="/">Return home</Link></main>;
}
