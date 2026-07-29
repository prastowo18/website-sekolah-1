export const announcementPriorities = [
  "NORMAL",
  "IMPORTANT",
  "URGENT",
] as const;

export type AnnouncementPriorityValue = (typeof announcementPriorities)[number];

export const announcementPriorityLabels: Record<
  AnnouncementPriorityValue,
  string
> = {
  NORMAL: "Normal",
  IMPORTANT: "Penting",
  URGENT: "Mendesak",
};
