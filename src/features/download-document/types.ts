export type DownloadDocumentFieldName =
  | "name"
  | "slug"
  | "description"
  | "category"
  | "fileUrl"
  | "fileName"
  | "fileType"
  | "isActive";

export type DownloadDocumentActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<DownloadDocumentFieldName, string[]>>;
  documentId?: string;
};

export const initialDownloadDocumentActionState: DownloadDocumentActionState = {
  status: "idle",
};
