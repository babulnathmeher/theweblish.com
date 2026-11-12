export type ServiceIconKind =
  | "browser"
  | "layout"
  | "landing"
  | "identity"
  | "code"
  | "editor"
  | "search"
  | "megaphone"
  | "social"
  | "analytics";

export function ServiceIcon({ kind, className = "" }: { kind: ServiceIconKind; className?: string }) {
  const artwork = {
    browser: <><rect x="5" y="8" width="38" height="31" rx="4" /><path d="M5 16h38M11 12h.01M16 12h.01M21 12h.01M12 32l8-9 6 6 5-5 5 8" /></>,
    layout: <><rect x="5" y="7" width="38" height="34" rx="4" /><path d="M5 17h38M18 17v24M24 24h12M24 31h8M11 12h.01M16 12h.01" /></>,
    landing: <><rect x="8" y="5" width="32" height="38" rx="4" /><path d="M15 13h18M15 19h12M15 26h18M15 32h11M31 32l3 3-3 3" /></>,
    identity: <><path d="M24 5 38 13v22L24 43 10 35V13L24 5Z" /><path d="m24 14 8 5v10l-8 5-8-5V19l8-5ZM24 14v20M16 19l16 10M32 19 16 29" /></>,
    code: <><rect x="5" y="8" width="38" height="31" rx="4" /><path d="M5 16h38m-26 9-5 5 5 5m14-10 5 5-5 5m-5-12-4 14" /></>,
    editor: <><rect x="9" y="5" width="30" height="38" rx="4" /><path d="M16 14h16M16 21h16M16 28h10M16 35h16M32 27v9" /></>,
    search: <><circle cx="21" cy="21" r="12" /><path d="m30 30 12 12M16 24l4-5 4 3 4-6" /></>,
    megaphone: <><path d="M8 19h10l21-9v28l-21-9H8a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4ZM18 29l4 12h8l-5-15M39 17l5-3M39 31l5 3" /></>,
    social: <><circle cx="12" cy="24" r="5" /><circle cx="35" cy="12" r="5" /><circle cx="35" cy="36" r="5" /><path d="m16 21 14-7M16 27l14 7" /></>,
    analytics: <><path d="M6 40h37M9 35V22h7v13m7 0V14h7v21m7 0V7h7v28m-28-21 9-5 9 3 10-7" /></>,
  }[kind];

  return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{artwork}</svg>;
}
