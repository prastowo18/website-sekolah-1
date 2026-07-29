export type PostCategoryFieldName =
  | "name"
  | "slug"
  | "description";

export type PostCategoryActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<
    Record<PostCategoryFieldName, string[]>
  >;
  categoryId?: string;
};

export const initialPostCategoryActionState: PostCategoryActionState =
  {
    status: "idle",
  };
