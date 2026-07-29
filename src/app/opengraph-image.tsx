import { ImageResponse } from "next/og";

export const alt = "Website resmi sekolah dasar";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const schoolName =
    process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Sekolah Dasar";

  const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR?.trim() || "#0f172a";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: themeColor,
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          top: -220,
          right: -120,
          background: "rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          bottom: -190,
          left: -100,
          background: "rgba(255,255,255,0.06)",
        }}
      />

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 84px",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 28,
            background: "rgba(255,255,255,0.14)",
            border: "2px solid rgba(255,255,255,0.25)",
            fontSize: 54,
            fontWeight: 800,
          }}
        >
          SD
        </div>

        <div
          style={{
            marginTop: 36,
            maxWidth: 960,
            fontSize: 62,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: "-2px",
          }}
        >
          {schoolName}
        </div>

        <div
          style={{
            marginTop: 22,
            maxWidth: 850,
            fontSize: 28,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          Informasi resmi sekolah, program pendidikan, kegiatan, prestasi, dan
          PPDB.
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 4,
              borderRadius: 999,
              background: "#ffffff",
            }}
          />
          Website Resmi Sekolah
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
