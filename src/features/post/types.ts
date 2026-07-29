export type PostFieldName =
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "featuredImageUrl"
  | "status"
  | "scheduledAt"
  | "categoryId"
  | "seoTitle"
  | "seoDescription";

export type PostActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<PostFieldName, string[]>>;
  postId?: string;
};

export const initialPostActionState: PostActionState = {
  status: "idle",
};
