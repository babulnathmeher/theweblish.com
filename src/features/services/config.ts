import "server-only";

export function serviceCmsEnabled() {
  return process.env.SERVICE_CMS_ENABLED === "true";
}
