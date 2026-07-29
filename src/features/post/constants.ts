export const postStatuses = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type PostStatusValue = (typeof postStatuses)[number];

export const postStatusLabels: Record<PostStatusValue, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Terjadwal",
  PUBLISHED: "Terbit",
  ARCHIVED: "Arsip",
};
