"use client";

import { Pencil, Plus } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  createGalleryAlbumAction,
  updateGalleryAlbumAction,
} from "@/features/gallery/album-actions";
import {
  initialGalleryAlbumActionState,
  type GalleryAlbumActionState,
} from "@/features/gallery/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  GalleryAlbumFormFields,
  type GalleryAlbumFormValues,
} from "./gallery-album-form-fields";

export type EditableGalleryAlbum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type GalleryAlbumFormDialogProps = {
  album?: EditableGalleryAlbum;
};

const emptyValues: GalleryAlbumFormValues = {
  title: "",
  slug: "",
  description: "",
  eventDate: "",
  coverImageUrl: "",
  isPublished: true,
};

export function GalleryAlbumFormDialog({ album }: GalleryAlbumFormDialogProps) {
  const [open, setOpen] = useState(false);

  const isEdit = album !== undefined;

  const action = isEdit ? updateGalleryAlbumAction : createGalleryAlbumAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: GalleryAlbumActionState,
      formData: FormData,
    ): Promise<GalleryAlbumActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialGalleryAlbumActionState,
  );

  useActionToast(state);

  const values: GalleryAlbumFormValues = album
    ? {
        title: album.title,
        slug: album.slug,
        description: album.description ?? "",
        eventDate: album.eventDate ?? "",
        coverImageUrl: album.coverImageUrl ?? "",
        isPublished: album.isPublished,
      }
    : emptyValues;

  const formId = album
    ? `edit-gallery-album-${album.id}`
    : "create-gallery-album";

  const formVersion = album
    ? `${album.id}-${album.updatedAt}`
    : `create-${state.albumId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah album"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit album galeri" : "Tambah album galeri"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi, sampul, dan status publikasi album."
              : "Tambahkan album baru untuk dokumentasi kegiatan sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {album ? <input type="hidden" name="id" value={album.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <GalleryAlbumFormFields
            key={formVersion}
            formId={formId}
            values={values}
            errors={state.fieldErrors}
            disabled={isPending}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan perubahan"
              ) : (
                "Tambah album"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
