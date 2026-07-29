import type { AllowedMediaType, MediaDirectory, MediaKind } from "./constants";

export type CreateMediaUploadInput = {
  directory: MediaDirectory;
  kind: MediaKind;
  originalName: string;
  contentType: AllowedMediaType;
  size: number;
};

export type CreateMediaUploadResult =
  | {
      status: "success";
      uploadUrl: string;
      temporaryKey: string;
      uploadToken: string;
      expiresAt: string;
    }
  | {
      status: "error";
      message: string;
    };

export type FinalizeMediaUploadInput = {
  temporaryKey: string;
  uploadToken: string;
  expectedContentType: AllowedMediaType;
  expectedSize: number;
};

export type FinalizeMediaUploadResult =
  | {
      status: "success";
      message: string;
      objectKey: string;
      publicUrl: string;
      contentType: AllowedMediaType;
      size: number;
    }
  | {
      status: "error";
      message: string;
    };
