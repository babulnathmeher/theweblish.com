import "server-only";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function storageConfig() {
  const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, MEDIA_PUBLIC_BASE_URL } = process.env;
  if (!S3_ENDPOINT || !S3_REGION || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !MEDIA_PUBLIC_BASE_URL) return null;
  try {
    const endpoint = new URL(S3_ENDPOINT);
    const publicUrl = new URL(MEDIA_PUBLIC_BASE_URL);
    if (endpoint.protocol !== "https:" || publicUrl.protocol !== "https:" || endpoint.username || endpoint.password || publicUrl.username || publicUrl.password) return null;
    return { endpoint: endpoint.origin, region: S3_REGION, bucket: S3_BUCKET, accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY, publicBaseUrl: publicUrl.href.endsWith("/") ? publicUrl.href : `${publicUrl.href}/` };
  } catch { return null; }
}

export function mediaStorage(config: NonNullable<ReturnType<typeof storageConfig>>) {
  const client = new S3Client({ region: config.region, endpoint: config.endpoint, forcePathStyle: true, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } });
  return {
    async put(data: Uint8Array, mimeType: string, extension: string) {
      const key = `blog-covers/${randomUUID()}.${extension}`;
      await client.send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: data, ContentType: mimeType, CacheControl: "public, max-age=31536000, immutable" }));
      return { key, url: new URL(key, config.publicBaseUrl).href };
    },
    async delete(key: string) { await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key })); },
  };
}
