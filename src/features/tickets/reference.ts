import { randomBytes } from "node:crypto";

export function createTicketReference() {
  return `TW-${randomBytes(8).toString("hex").toUpperCase()}`;
}
