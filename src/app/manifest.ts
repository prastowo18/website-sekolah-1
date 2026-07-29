import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Website Sekolah Dasar";

  const shortName =
    siteName.length > 30 ? `${siteName.slice(0, 27).trim()}...` : siteName;

  const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR?.trim() || "#0f172a";

  return {
    name: siteName,
    short_name: shortName,
    description:
      "Website resmi sekolah yang memuat profil, program, berita, pengumuman, galeri, dokumen, dan informasi PPDB.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    lang: "id-ID",
    categories: ["education", "school", "information"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
