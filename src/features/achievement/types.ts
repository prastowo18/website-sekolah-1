export type AchievementFieldName =
  | "title"
  | "slug"
  | "achievementType"
  | "category"
  | "winnerName"
  | "competitionLevel"
  | "rank"
  | "achievementDate"
  | "description"
  | "isPublished";

export type AchievementActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<
    Record<AchievementFieldName, string[]>
  >;
  achievementId?: string;
};

export const initialAchievementActionState: AchievementActionState =
  {
    status: "idle",
  };
