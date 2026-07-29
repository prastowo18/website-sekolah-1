export const achievementTypes = [
  "STUDENT",
  "TEACHER",
  "SCHOOL",
] as const;

export type AchievementTypeValue =
  (typeof achievementTypes)[number];

export const competitionLevels = [
  "SCHOOL",
  "DISTRICT",
  "CITY",
  "PROVINCE",
  "NATIONAL",
  "INTERNATIONAL",
] as const;

export type CompetitionLevelValue =
  (typeof competitionLevels)[number];

export const achievementTypeLabels: Record<
  AchievementTypeValue,
  string
> = {
  STUDENT: "Siswa",
  TEACHER: "Guru",
  SCHOOL: "Sekolah",
};

export const competitionLevelLabels: Record<
  CompetitionLevelValue,
  string
> = {
  SCHOOL: "Sekolah",
  DISTRICT: "Kecamatan",
  CITY: "Kabupaten/Kota",
  PROVINCE: "Provinsi",
  NATIONAL: "Nasional",
  INTERNATIONAL: "Internasional",
};
