export function LoadingSpinner({ label, dark = false }: { label: string; dark?: boolean }) {
  return <div className={`loading-spinner${dark ? " loading-spinner-dark" : ""}`} role="status">
    <span className="loading-spinner-ring" aria-hidden="true" />
    <span className="loading-spinner-label">{label}</span>
  </div>;
}
