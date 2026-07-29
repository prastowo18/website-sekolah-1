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
import { deletePpdbInformationAction } from "@/features/ppdb/actions";
import {
  initialPpdbInformationActionState,
  type PpdbInformationActionState,
} from "@/features/ppdb/types";
import { useActionToast } from "@/hooks/use-action-toast";

type PpdbInformationDeleteDialogProps = {
  ppdbId: string;
  title: string;
  academicYear: string;
  detailCount: number;
};

export function PpdbInformationDeleteDialog({
  ppdbId,
  title,
  academicYear,
  detailCount,
}: PpdbInformationDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PpdbInformationActionState,
      formData: FormData,
    ): Promise<PpdbInformationActionState> => {
      const nextState = await deletePpdbInformationAction(
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
    initialPpdbInformationActionState,
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
          <AlertDialogTitle>Hapus informasi PPDB?</AlertDialogTitle>

          <AlertDialogDescription>
            Informasi <strong>{title}</strong> tahun ajaran{" "}
            <strong>{academicYear}</strong> akan dihapus permanen.
            {detailCount > 0
              ? ` Seluruh ${detailCount} rincian jadwal, persyaratan, alur, dan biaya juga akan dihapus.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={ppdbId} />

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
                "Hapus PPDB"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
