import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR?.trim() || '#0f172a';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 38,
        background: themeColor,
        color: '#ffffff',
        fontSize: 72,
        fontWeight: 800,
        fontFamily: 'sans-serif',
      }}
    >
      SD
    </div>,
    {
      ...size,
    },
  );
}
