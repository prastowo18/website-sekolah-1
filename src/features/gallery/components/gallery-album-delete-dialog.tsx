"use client";

import { Trash2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { deleteGalleryAlbumAction } from "@/features/gallery/actions";
import {
  initialGalleryAlbumActionState,
  type GalleryAlbumActionState,
} from "@/features/gallery/types";
import { useActionToast } from "@/hooks/use-action-toast";

type GalleryAlbumDeleteDialogProps = {
  albumId: string;
  albumTitle: string;
  mediaCount: number;
};

export function GalleryAlbumDeleteDialog({
  albumId,
  albumTitle,
  mediaCount,
}: GalleryAlbumDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: GalleryAlbumActionState,
      formData: FormData,
    ): Promise<GalleryAlbumActionState> => {
      const nextState = await deleteGalleryAlbumAction(previousState, formData);

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

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <Trash2 className="size-4" />
          Hapus
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus album galeri?</AlertDialogTitle>

          <AlertDialogDescription>
            Album <strong>{albumTitle}</strong> akan dihapus secara permanen.
            {mediaCount > 0
              ? ` Seluruh ${mediaCount} media di dalam album ini juga akan dihapus.`
              : " Album ini belum memiliki media."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={albumId} />

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Batal
            </AlertDialogCancel>

            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menghapus...
                </>
              ) : (
                "Hapus album"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
