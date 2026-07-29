export type AnnouncementFieldName =
  | "title"
  | "slug"
  | "content"
  | "priority"
  | "attachmentUrl"
  | "startDate"
  | "endDate"
  | "isPinned"
  | "isActive";

export type AnnouncementActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AnnouncementFieldName, string[]>>;
  announcementId?: string;
};

export const initialAnnouncementActionState: AnnouncementActionState = {
  status: "idle",
};
