export type TestimonialFieldName =
  "name" | "role" | "content" | "photoUrl" | "isPublished" | "sortOrder";

export type TestimonialActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<TestimonialFieldName, string[]>>;
  testimonialId?: string;
};

export const initialTestimonialActionState: TestimonialActionState = {
  status: "idle",
};
