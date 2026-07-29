"use client";

import { Trash2 } from "lucide-react";
import {
  startTransition,
  useActionState,
  useState,
} from "react";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
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
import { deleteAchievementAction } from "@/features/achievement/actions";
import {
  initialAchievementActionState,
  type AchievementActionState,
} from "@/features/achievement/types";
import { useActionToast } from "@/hooks/use-action-toast";

type AchievementDeleteDialogProps = {
  achievementId: string;
  achievementTitle: string;
};

export function AchievementDeleteDialog({
  achievementId,
  achievementTitle,
}: AchievementDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] =
    useActionState(
      async (
        previousState: AchievementActionState,
        formData: FormData,
      ): Promise<AchievementActionState> => {
        const nextState =
          await deleteAchievementAction(
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
      initialAchievementActionState,
    );

  useActionToast(state);

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="sm"
        >
          <Trash2 className="size-4" />
          Hapus
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Hapus prestasi?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Prestasi{" "}
            <strong>
              {achievementTitle}
            </strong>{" "}
            akan dihapus permanen. Tindakan ini
            tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          action={formAction}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="id"
            value={achievementId}
          />

          {state.status === "error" &&
          state.message ? (
            <Alert variant="destructive">
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              disabled={isPending}
            >
              Batal
            </AlertDialogCancel>

            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menghapus...
                </>
              ) : (
                "Hapus prestasi"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
