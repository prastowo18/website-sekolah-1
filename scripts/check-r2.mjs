import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

const requiredVariables = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

const missingVariables = requiredVariables.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingVariables.length > 0) {
  throw new Error(
    `Environment variable belum lengkap: ${missingVariables.join(", ")}`,
  );
}

const endpoint = process.env.R2_ENDPOINT.trim().replace(/\/+$/, "");

const bucketName = process.env.R2_BUCKET_NAME.trim();

const endpointUrl = new URL(endpoint);

if (endpointUrl.hostname.endsWith(".r2.dev")) {
  throw new Error("R2_ENDPOINT tidak boleh menggunakan r2.dev.");
}

const client = new S3Client({
  region: "auto",
  endpoint,

  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),

    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },

  maxAttempts: 3,
});

const objectKey = `system/connection-check-${randomUUID()}.txt`;

const body = ["Cloudflare R2 connection check", new Date().toISOString()].join(
  "\n",
);

let objectCreated = false;

console.log("");
console.log("R2_CONFIGURATION");
console.log(`Endpoint : ${endpointUrl.hostname}`);
console.log(`Bucket   : ${bucketName}`);

try {
  console.log("");
  console.log("1. Mengunggah object test...");

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: body,

      ContentType: "text/plain; charset=utf-8",

      CacheControl: "no-store",
    }),
  );

  objectCreated = true;

  console.log("   Object berhasil diunggah.");

  console.log("2. Memverifikasi object...");

  const object = await client.send(
    new HeadObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    }),
  );

  const expectedSize = Buffer.byteLength(body);

  if (object.ContentLength !== expectedSize) {
    throw new Error(
      `Ukuran object tidak sesuai. Diharapkan ${expectedSize}, diterima ${object.ContentLength ?? "tidak diketahui"}.`,
    );
  }

  console.log("   Object berhasil diverifikasi.");

  console.log("");
  console.log("R2_S3_CONNECTION_OK");
  console.log(`Object test: ${objectKey}`);

  const shouldCheckPublicUrl = process.env.R2_CHECK_PUBLIC_URL === "true";

  if (shouldCheckPublicUrl) {
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(
      /\/+$/,
      "",
    );

    if (!publicBaseUrl) {
      throw new Error(
        "R2_PUBLIC_BASE_URL diperlukan untuk pemeriksaan public URL.",
      );
    }

    const publicUrl = `${publicBaseUrl}/${objectKey}`;

    console.log("");
    console.log("3. Memeriksa public URL...");

    const response = await fetch(publicUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Public URL gagal. HTTP ${response.status}.`);
    }

    console.log("   Public URL dapat diakses.");
    console.log(`   ${publicUrl}`);
  } else {
    console.log("");
    console.log("Public URL : dilewati");
    console.log("Alasan     : R2_CHECK_PUBLIC_URL bukan true");
  }
} finally {
  if (objectCreated) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    console.log("Cleanup    : object test dihapus");
  }

  client.destroy();
}
