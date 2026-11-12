export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const signatures = [
  { mime: "image/png", extension: "png", matches: (data: Uint8Array) => data.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => data[i] === byte) },
  { mime: "image/jpeg", extension: "jpg", matches: (data: Uint8Array) => data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255 },
  { mime: "image/webp", extension: "webp", matches: (data: Uint8Array) => data.length >= 12 && Buffer.from(data.subarray(0, 4)).toString() === "RIFF" && Buffer.from(data.subarray(8, 12)).toString() === "WEBP" },
] as const;

export function validateImage(data: Uint8Array, declaredType: string) {
  if (!data.length || data.length > MAX_IMAGE_BYTES) return { ok: false as const, error: "Image must be between 1 byte and 5 MB." };
  const match = signatures.find((signature) => signature.mime === declaredType && signature.matches(data));
  if (!match) return { ok: false as const, error: "Upload a PNG, JPEG, or WebP image." };
  return { ok: true as const, extension: match.extension, mimeType: match.mime };
}
