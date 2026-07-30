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
import { deleteGalleryMediaAction } from "@/features/gallery/media-actions";
import {
  initialGalleryMediaActionState,
  type GalleryMediaActionState,
} from "@/features/gallery/types";
import { useActionToast } from "@/hooks/use-action-toast";

type GalleryMediaDeleteDialogProps = {
  mediaId: string;
  mediaLabel: string;
};

export function GalleryMediaDeleteDialog({
  mediaId,
  mediaLabel,
}: GalleryMediaDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: GalleryMediaActionState,
      formData: FormData,
    ): Promise<GalleryMediaActionState> => {
      const nextState = await deleteGalleryMediaAction(previousState, formData);

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
          <AlertDialogTitle>Hapus media galeri?</AlertDialogTitle>

          <AlertDialogDescription>
            Media <strong>{mediaLabel}</strong> akan dihapus secara permanen
            dari album.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={mediaId} />

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
                "Hapus media"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
