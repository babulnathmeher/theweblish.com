"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const PAGE_SIZES = [10, 25, 50, 100] as const;

export function TablePagination({ path, filters, page, perPage, total, label }: {
  path: string;
  filters: Record<string, string>;
  page: number;
  perPage: number;
  total: number;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pages = Math.max(1, Math.ceil(total / perPage));
  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  function href(nextPage: number, nextSize = perPage) {
    const params = new URLSearchParams(filters);
    params.set("perPage", String(nextSize));
    if (nextPage > 1) params.set("page", String(nextPage));
    return `${path}?${params.toString()}`;
  }

  return <div className="admin-table-pagination" aria-label={`${label} pagination`}>
    <label className="admin-table-page-size">
      <span className="sr-only">Rows per page</span>
      <select
        aria-label={`${label} per page`}
        value={perPage}
        disabled={pending}
        onChange={(event) => {
          const size = Number(event.target.value);
          if (PAGE_SIZES.includes(size as typeof PAGE_SIZES[number])) {
            startTransition(() => router.push(href(1, size)));
          }
        }}
      >{PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}</select>
    </label>
    <span className="admin-table-page-count" aria-live="polite">{first}–{last} of {total}</span>
    <nav aria-label={`${label} pages`}>
      {page > 1 ? <Link href={href(page - 1)} aria-label={`Previous ${label} page`}>‹</Link> : <span aria-hidden="true" className="is-disabled">‹</span>}
      {page < pages ? <Link href={href(page + 1)} aria-label={`Next ${label} page`}>›</Link> : <span aria-hidden="true" className="is-disabled">›</span>}
    </nav>
  </div>;
}
