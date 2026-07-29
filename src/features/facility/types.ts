export type FacilityFieldName =
  | "name"
  | "slug"
  | "description"
  | "capacity"
  | "condition"
  | "sortOrder"
  | "isActive";

export type FacilityActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<FacilityFieldName, string[]>>;
  facilityId?: string;
};

export const initialFacilityActionState: FacilityActionState = {
  status: "idle",
};
