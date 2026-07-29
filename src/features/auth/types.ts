export type AuthFieldName = "identifier" | "password";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AuthFieldName, string[]>>;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
};
