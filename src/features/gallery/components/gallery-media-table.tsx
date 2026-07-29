import { ExternalLink, FileImage, Film } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  galleryMediaTypeLabels,
  type GalleryMediaTypeValue,
} from "@/features/gallery/constants";

import { GalleryMediaDeleteDialog } from "./gallery-media-delete-dialog";
import {
  GalleryMediaFormDialog,
  type EditableGalleryMedia,
} from "./gallery-media-form-dialog";
import type { GalleryAlbumOption } from "./gallery-media-form-fields";

type GalleryMediaTableProps = {
  media: EditableGalleryMedia[];
  albums: GalleryAlbumOption[];
  currentAlbumId: string;
  canEdit: boolean;
};

function MediaIcon({ type }: { type: GalleryMediaTypeValue }) {
  if (type === "VIDEO") {
    return <Film className="size-5 text-muted-foreground" />;
  }

  if (type === "YOUTUBE") {
    return <Film className="size-5 text-rose-500" />;
  }

  return <FileImage className="size-5 text-muted-foreground" />;
}

export function GalleryMediaTable({
  media,
  albums,
  currentAlbumId,
  canEdit,
}: GalleryMediaTableProps) {
  if (media.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <FileImage className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Media belum tersedia</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan gambar, video, atau tautan YouTube ke album ini.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Media</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead>Urutan</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {media.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex min-w-72 items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <MediaIcon type={item.mediaType} />
                  </div>

                  <div className="min-w-0">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-md items-center gap-1 break-all text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {item.fileUrl}
                      <ExternalLink className="size-3 shrink-0" />
                    </a>

                    {item.altText ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Alt: {item.altText}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline">
                  {galleryMediaTypeLabels[item.mediaType]}
                </Badge>
              </TableCell>

              <TableCell>
                <p className="max-w-md whitespace-pre-wrap text-sm text-muted-foreground">
                  {item.caption ?? "—"}
                </p>
              </TableCell>

              <TableCell>{item.sortOrder}</TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <GalleryMediaFormDialog
                      albums={albums}
                      defaultAlbumId={currentAlbumId}
                      media={item}
                    />

                    <GalleryMediaDeleteDialog
                      mediaId={item.id}
                      mediaLabel={
                        item.caption ?? galleryMediaTypeLabels[item.mediaType]
                      }
                    />
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
