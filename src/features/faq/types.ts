export type FaqFieldName =
  "question" | "answer" | "category" | "sortOrder" | "isActive";

export type FaqActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<FaqFieldName, string[]>>;
  faqId?: string;
};

export const initialFaqActionState: FaqActionState = {
  status: "idle",
};
