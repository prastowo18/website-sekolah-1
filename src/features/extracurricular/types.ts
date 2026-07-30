export type ExtracurricularFieldName =
  | "name"
  | "slug"
  | "description"
  | "schedule"
  | "coach"
  | "targetClasses"
  | "imageUrl"
  | "sortOrder"
  | "isActive";

export type ExtracurricularActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ExtracurricularFieldName, string[]>>;
  extracurricularId?: string;
};

export const initialExtracurricularActionState: ExtracurricularActionState = {
  status: "idle",
};
