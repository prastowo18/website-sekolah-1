export type SchoolProfileFieldName =
  | "schoolName"
  | "shortName"
  | "npsn"
  | "logoUrl"
  | "faviconUrl"
  | "heroImageUrl"
  | "principalPhotoUrl"
  | "tagline"
  | "shortDescription"
  | "history"
  | "vision"
  | "mission"
  | "goals"
  | "schoolValues"
  | "accreditation"
  | "foundedYear"
  | "principalName"
  | "principalTitle"
  | "principalGreeting"
  | "address"
  | "village"
  | "district"
  | "city"
  | "province"
  | "postalCode"
  | "phone"
  | "whatsapp"
  | "email"
  | "operationalHours";

export type SchoolProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<SchoolProfileFieldName, string[]>>;
};

export const initialSchoolProfileActionState: SchoolProfileActionState = {
  status: "idle",
};
