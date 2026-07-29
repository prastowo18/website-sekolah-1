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
  createGalleryMediaAction,
  updateGalleryMediaAction,
} from "@/features/gallery/actions";
import type { GalleryMediaTypeValue } from "@/features/gallery/constants";
import {
  initialGalleryMediaActionState,
  type GalleryMediaActionState,
} from "@/features/gallery/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  GalleryMediaFormFields,
  type GalleryAlbumOption,
  type GalleryMediaFormValues,
} from "./gallery-media-form-fields";

export type EditableGalleryMedia = {
  id: string;
  albumId: string;
  mediaType: GalleryMediaTypeValue;
  fileUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type GalleryMediaFormDialogProps = {
  albums: GalleryAlbumOption[];
  defaultAlbumId: string;
  media?: EditableGalleryMedia;
};

export function GalleryMediaFormDialog({
  albums,
  defaultAlbumId,
  media,
}: GalleryMediaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = media !== undefined;

  const action = isEdit ? updateGalleryMediaAction : createGalleryMediaAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: GalleryMediaActionState,
      formData: FormData,
    ): Promise<GalleryMediaActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialGalleryMediaActionState,
  );

  useActionToast(state);

  const values: GalleryMediaFormValues = media
    ? {
        albumId: media.albumId,
        mediaType: media.mediaType,
        fileUrl: media.fileUrl,
        thumbnailUrl: media.thumbnailUrl ?? "",
        caption: media.caption ?? "",
        altText: media.altText ?? "",
        sortOrder: media.sortOrder,
      }
    : {
        albumId: defaultAlbumId,
        mediaType: "IMAGE",
        fileUrl: "",
        thumbnailUrl: "",
        caption: "",
        altText: "",
        sortOrder: 0,
      };

  const formId = media
    ? `edit-gallery-media-${media.id}`
    : `create-gallery-media-${defaultAlbumId}`;

  const formVersion = media
    ? `${media.id}-${media.updatedAt}`
    : `create-${state.mediaId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah media"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit media galeri" : "Tambah media galeri"}
          </DialogTitle>

          <DialogDescription>
            Tambahkan gambar, video, atau tautan YouTube ke dalam album galeri.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {media ? <input type="hidden" name="id" value={media.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <GalleryMediaFormFields
            key={formVersion}
            formId={formId}
            values={values}
            albums={albums}
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
                "Tambah media"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
