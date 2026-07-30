import { CalendarDays, ImageOff, Images, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { GalleryAlbumDeleteDialog } from "./gallery-album-delete-dialog";
import {
  GalleryAlbumFormDialog,
  type EditableGalleryAlbum,
} from "./gallery-album-form-dialog";

export type GalleryAlbumListItem = EditableGalleryAlbum & {
  mediaCount: number;
};

type GalleryAlbumTableProps = {
  albums: GalleryAlbumListItem[];
  canEdit: boolean;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function GalleryAlbumTable({ albums, canEdit }: GalleryAlbumTableProps) {
  if (albums.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Images className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Album galeri tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan album baru atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Album</TableHead>
            <TableHead>Tanggal Kegiatan</TableHead>
            <TableHead>Media</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {albums.map((album) => (
            <TableRow key={album.id}>
              <TableCell>
                <div className="flex min-w-80 items-start gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {album.coverImageUrl ? (
                      <Image
                        src={album.coverImageUrl}
                        alt={`Sampul album ${album.title}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <ImageOff className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">{album.title}</p>

                    {album.description ? (
                      <p className="mt-1 line-clamp-2 max-w-xl text-sm text-muted-foreground">
                        {album.description}
                      </p>
                    ) : null}

                    <p className="mt-2 text-xs text-muted-foreground">
                      /galeri/{album.slug}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex min-w-36 items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />

                  {formatDate(album.eventDate)}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">{album.mediaCount} media</Badge>
              </TableCell>

              <TableCell>
                <Badge variant={album.isPublished ? "default" : "secondary"}>
                  {album.isPublished ? "Terbit" : "Draft"}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/konsol-8m4q7x2k9v6d/galeri/${album.id}`}>
                      <Settings2 className="size-4" />
                      Kelola media
                    </Link>
                  </Button>

                  {canEdit ? (
                    <>
                      <GalleryAlbumFormDialog album={album} />

                      <GalleryAlbumDeleteDialog
                        albumId={album.id}
                        albumTitle={album.title}
                        mediaCount={album.mediaCount}
                      />
                    </>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
