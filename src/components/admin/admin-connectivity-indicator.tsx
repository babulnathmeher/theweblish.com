"use client";

import { useEffect, useState } from "react";

type ConnectionState = "checking" | "online" | "offline";

export function AdminConnectivityIndicator() {
  const [connection, setConnection] = useState<ConnectionState>("checking");

  useEffect(() => {
    const updateConnection = () => setConnection(navigator.onLine ? "online" : "offline");
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  const label = connection === "online" ? "Online" : connection === "offline" ? "Offline" : "Checking";

  return <span className={`admin-topbar-live is-${connection}`} role="status" aria-live="polite" title="Browser network connection status">
    <span className="admin-topbar-signal" aria-hidden="true" />
    <span>{label}</span>
  </span>;
}
