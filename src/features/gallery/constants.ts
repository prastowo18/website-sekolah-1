export const galleryMediaTypes = ["IMAGE", "VIDEO", "YOUTUBE"] as const;

export type GalleryMediaTypeValue = (typeof galleryMediaTypes)[number];

export const galleryMediaTypeLabels: Record<GalleryMediaTypeValue, string> = {
  IMAGE: "Gambar",
  VIDEO: "Video",
  YOUTUBE: "YouTube",
};
