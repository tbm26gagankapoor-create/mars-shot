/**
 * Stub for MinIO / S3 client.
 * S3 storage is not used in this prototype. All exports are no-ops
 * so that consumers compile without @aws-sdk/client-s3.
 */

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "documents";

/** No-op stub that mirrors the S3Client.send() surface used in this project. */
export const minioClient = {
  async send(_command: unknown): Promise<void> {
    // TODO: wire up real S3 / MinIO client when storage is needed
    console.warn("[minio stub] send() called — no-op in prototype");
  },
};
