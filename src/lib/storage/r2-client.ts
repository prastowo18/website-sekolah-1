import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

import { r2Env } from "./r2-env";

export const r2Client = new S3Client({
  region: "auto",

  endpoint: r2Env.R2_ENDPOINT,

  credentials: {
    accessKeyId: r2Env.R2_ACCESS_KEY_ID,

    secretAccessKey: r2Env.R2_SECRET_ACCESS_KEY,
  },

  requestChecksumCalculation: "WHEN_REQUIRED",

  responseChecksumValidation: "WHEN_REQUIRED",

  maxAttempts: 3,
});

export const r2BucketName = r2Env.R2_BUCKET_NAME;
