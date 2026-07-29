import { ExternalLink, ImageOff, Play, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSafePublicUrl } from "@/lib/public-links";

export type PublicGalleryMediaItem = {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "YOUTUBE";
  fileUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
};

type PublicGalleryMediaProps = {
  item: PublicGalleryMediaItem;
  albumTitle: string;
  index: number;
};

function getYoutubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    let id: string | null = null;

    if (url.hostname === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else {
        const parts = url.pathname.split("/").filter(Boolean);

        if (
          parts[0] === "embed" ||
          parts[0] === "shorts" ||
          parts[0] === "live"
        ) {
          id = parts[1] ?? null;
        }
      }
    }

    if (id && /^[A-Za-z0-9_-]{6,20}$/.test(id)) {
      return id;
    }
  } catch {
    return null;
  }

  return null;
}

function MediaFallback({ label }: { label: string }) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-t-xl bg-muted text-muted-foreground">
      <ImageOff className="size-9" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

export function PublicGalleryMedia({
  item,
  albumTitle,
  index,
}: PublicGalleryMediaProps) {
  const fileUrl = getSafePublicUrl(item.fileUrl);

  const thumbnailUrl = getSafePublicUrl(item.thumbnailUrl);

  const mediaLabel =
    item.altText || item.caption || `${albumTitle} media ${index + 1}`;

  let mediaContent;

  if (item.mediaType === "IMAGE") {
    mediaContent = fileUrl ? (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`Buka gambar ${mediaLabel}`}
      >
        <div
          role="img"
          aria-label={mediaLabel}
          className="aspect-video rounded-t-xl bg-muted bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${JSON.stringify(fileUrl)})`,
          }}
        />
      </a>
    ) : (
      <MediaFallback label="Gambar tidak tersedia" />
    );
  } else if (item.mediaType === "VIDEO") {
    mediaContent = fileUrl ? (
      <video
        controls
        preload="metadata"
        poster={thumbnailUrl ?? undefined}
        className="aspect-video w-full rounded-t-xl bg-black object-contain"
      >
        <source src={fileUrl} />
        Browser tidak mendukung pemutar video.
      </video>
    ) : (
      <MediaFallback label="Video tidak tersedia" />
    );
  } else {
    const youtubeId = getYoutubeVideoId(item.fileUrl);

    mediaContent = youtubeId ? (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={mediaLabel}
        className="aspect-video w-full rounded-t-xl bg-black"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    ) : thumbnailUrl ? (
      <a
        href={fileUrl ?? item.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block"
      >
        <div
          role="img"
          aria-label={mediaLabel}
          className="aspect-video rounded-t-xl bg-muted bg-cover bg-center"
          style={{
            backgroundImage: `url(${JSON.stringify(thumbnailUrl)})`,
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center rounded-t-xl bg-black/30">
          <div className="flex size-14 items-center justify-center rounded-full bg-white/90 text-slate-950">
            <Play className="ml-1 size-6" />
          </div>
        </div>
      </a>
    ) : (
      <MediaFallback label="Video YouTube tidak valid" />
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      {mediaContent}

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {item.mediaType === "IMAGE" ? (
              "Gambar"
            ) : item.mediaType === "VIDEO" ? (
              <>
                <Video className="size-3" />
                Video
              </>
            ) : (
              "YouTube"
            )}
          </Badge>

          <span className="text-xs text-muted-foreground">
            Media {index + 1}
          </span>
        </div>

        {item.caption ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {item.caption}
          </p>
        ) : null}

        {fileUrl ? (
          <Button variant="link" size="sm" className="mt-3 h-auto p-0" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              Buka media
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
