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
import { deleteExtracurricularAction } from "@/features/extracurricular/actions";
import {
  initialExtracurricularActionState,
  type ExtracurricularActionState,
} from "@/features/extracurricular/types";
import { useActionToast } from "@/hooks/use-action-toast";

type ExtracurricularDeleteDialogProps = {
  extracurricularId: string;
  extracurricularName: string;
};

export function ExtracurricularDeleteDialog({
  extracurricularId,
  extracurricularName,
}: ExtracurricularDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: ExtracurricularActionState,
      formData: FormData,
    ): Promise<ExtracurricularActionState> => {
      const nextState = await deleteExtracurricularAction(
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
    initialExtracurricularActionState,
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
          <AlertDialogTitle>Hapus ekstrakurikuler?</AlertDialogTitle>

          <AlertDialogDescription>
            Ekstrakurikuler <strong>{extracurricularName}</strong> akan dihapus
            secara permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={extracurricularId} />

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
                "Hapus ekstrakurikuler"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
