export type ProgramFieldName =
  | "name"
  | "slug"
  | "shortDescription"
  | "description"
  | "benefits"
  | "sortOrder"
  | "isFeatured"
  | "isActive";

export type ProgramActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ProgramFieldName, string[]>>;
  programId?: string;
};

export const initialProgramActionState: ProgramActionState = {
  status: "idle",
};
