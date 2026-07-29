export type TeacherFieldName =
  | "name"
  | "slug"
  | "employeeNumber"
  | "position"
  | "subject"
  | "education"
  | "shortBiography"
  | "sortOrder"
  | "isPrincipal"
  | "isActive";

export type TeacherActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<TeacherFieldName, string[]>>;
  teacherId?: string;
};

export const initialTeacherActionState: TeacherActionState = {
  status: "idle",
};
