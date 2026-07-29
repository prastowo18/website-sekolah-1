export const ppdbStatuses = [
  "DRAFT",
  "COMING_SOON",
  "OPEN",
  "CLOSED",
  "ANNOUNCEMENT",
  "COMPLETED",
] as const;

export type PpdbStatusValue = (typeof ppdbStatuses)[number];

export const ppdbStatusLabels: Record<PpdbStatusValue, string> = {
  DRAFT: "Draft",
  COMING_SOON: "Segera Dibuka",
  OPEN: "Dibuka",
  CLOSED: "Ditutup",
  ANNOUNCEMENT: "Pengumuman",
  COMPLETED: "Selesai",
};

export const ppdbFeeTypes = [
  "REGISTRATION",
  "DEVELOPMENT",
  "MONTHLY",
  "UNIFORM",
  "ACTIVITY",
  "OTHER",
] as const;

export type PpdbFeeTypeValue = (typeof ppdbFeeTypes)[number];

export const ppdbFeeTypeLabels: Record<PpdbFeeTypeValue, string> = {
  REGISTRATION: "Pendaftaran",
  DEVELOPMENT: "Pengembangan",
  MONTHLY: "Bulanan",
  UNIFORM: "Seragam",
  ACTIVITY: "Kegiatan",
  OTHER: "Lainnya",
};
