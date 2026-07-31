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
import { deleteSocialLinkAction } from "@/features/social-link/actions";
import {
  initialSocialLinkActionState,
  type SocialLinkActionState,
} from "@/features/social-link/types";
import { useActionToast } from "@/hooks/use-action-toast";

type SocialLinkDeleteDialogProps = {
  socialLinkId: string;
  displayName: string;
};

export function SocialLinkDeleteDialog({
  socialLinkId,
  displayName,
}: SocialLinkDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: SocialLinkActionState,
      formData: FormData,
    ): Promise<SocialLinkActionState> => {
      const nextState = await deleteSocialLinkAction(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialSocialLinkActionState,
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
          <AlertDialogTitle>Hapus media sosial?</AlertDialogTitle>

          <AlertDialogDescription>
            Tautan <strong>{displayName}</strong> akan dihapus secara permanen.
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={socialLinkId} />

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
                "Hapus media sosial"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
