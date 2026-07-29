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
import { deleteDownloadDocumentAction } from "@/features/download-document/actions";
import {
  initialDownloadDocumentActionState,
  type DownloadDocumentActionState,
} from "@/features/download-document/types";
import { useActionToast } from "@/hooks/use-action-toast";

type DownloadDocumentDeleteDialogProps = {
  documentId: string;
  documentName: string;
  fileName: string;
};

export function DownloadDocumentDeleteDialog({
  documentId,
  documentName,
  fileName,
}: DownloadDocumentDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: DownloadDocumentActionState,
      formData: FormData,
    ): Promise<DownloadDocumentActionState> => {
      const nextState = await deleteDownloadDocumentAction(
        previousState,
        formData,
      );

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialDownloadDocumentActionState,
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
          <AlertDialogTitle>Hapus dokumen?</AlertDialogTitle>

          <AlertDialogDescription>
            Dokumen <strong>{documentName}</strong> dengan file{" "}
            <strong>{fileName}</strong> akan dihapus dari database. File fisik
            pada storage tidak ikut dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={documentId} />

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
                "Hapus dokumen"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
