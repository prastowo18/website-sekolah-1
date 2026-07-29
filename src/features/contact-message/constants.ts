export const CONTACT_MESSAGE_STATUS_VALUES = [
  "NEW",
  "READ",
  "REPLIED",
  "CLOSED",
  "SPAM",
] as const;

export type ContactMessageStatusValue =
  (typeof CONTACT_MESSAGE_STATUS_VALUES)[number];

export const CONTACT_MESSAGE_STATUS_LABELS: Record<
  ContactMessageStatusValue,
  string
> = {
  NEW: "Baru",
  READ: "Dibaca",
  REPLIED: "Dibalas",
  CLOSED: "Selesai",
  SPAM: "Spam",
};
