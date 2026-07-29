export type ChangePasswordFieldName =
  "currentPassword" | "newPassword" | "confirmPassword";

export type ChangePasswordActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ChangePasswordFieldName, string[]>>;
};

export const initialChangePasswordActionState: ChangePasswordActionState = {
  status: "idle",
};
