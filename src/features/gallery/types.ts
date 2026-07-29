export type GalleryAlbumFieldName =
  | "title"
  | "slug"
  | "description"
  | "eventDate"
  | "coverImageUrl"
  | "isPublished";

export type GalleryMediaFieldName =
  | "albumId"
  | "mediaType"
  | "fileUrl"
  | "thumbnailUrl"
  | "caption"
  | "altText"
  | "sortOrder";

export type GalleryAlbumActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<GalleryAlbumFieldName, string[]>>;
  albumId?: string;
};

export type GalleryMediaActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<GalleryMediaFieldName, string[]>>;
  mediaId?: string;
};

export const initialGalleryAlbumActionState: GalleryAlbumActionState = {
  status: "idle",
};

export const initialGalleryMediaActionState: GalleryMediaActionState = {
  status: "idle",
};
