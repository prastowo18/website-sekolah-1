export const MEDIA_KINDS = ["image", "document"] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_DIRECTORIES = [
  "profile",
  "teachers",
  "programs",
  "facilities",
  "achievements",
  "extracurriculars",
  "posts",
  "announcements",
  "galleries",
  "testimonials",
  "ppdb",
  "documents",
] as const;

export type MediaDirectory = (typeof MEDIA_DIRECTORIES)[number];

export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
] as const;

export type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

type MediaTypeRule = {
  kind: MediaKind;
  extension: string;
  maxBytes: number;
};

export const MEDIA_TYPE_RULES: Record<AllowedMediaType, MediaTypeRule> = {
  "image/jpeg": {
    kind: "image",
    extension: "jpg",
    maxBytes: 5 * 1024 * 1024,
  },

  "image/png": {
    kind: "image",
    extension: "png",
    maxBytes: 5 * 1024 * 1024,
  },

  "image/webp": {
    kind: "image",
    extension: "webp",
    maxBytes: 5 * 1024 * 1024,
  },

  "image/avif": {
    kind: "image",
    extension: "avif",
    maxBytes: 5 * 1024 * 1024,
  },

  "application/pdf": {
    kind: "document",
    extension: "pdf",
    maxBytes: 10 * 1024 * 1024,
  },
};

export function formatMediaSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.ceil(bytes / 1024)} KB`;
}
