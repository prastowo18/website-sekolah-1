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
import { deletePostCategoryAction } from "@/features/post-category/actions";
import {
  initialPostCategoryActionState,
  type PostCategoryActionState,
} from "@/features/post-category/types";
import { useActionToast } from "@/hooks/use-action-toast";

type PostCategoryDeleteDialogProps = {
  categoryId: string;
  categoryName: string;
  postCount: number;
};

export function PostCategoryDeleteDialog({
  categoryId,
  categoryName,
  postCount,
}: PostCategoryDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PostCategoryActionState,
      formData: FormData,
    ): Promise<PostCategoryActionState> => {
      const nextState = await deletePostCategoryAction(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialPostCategoryActionState,
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
          <AlertDialogTitle>Hapus kategori berita?</AlertDialogTitle>

          <AlertDialogDescription>
            Kategori <strong>{categoryName}</strong> akan dihapus secara
            permanen.
            {postCount > 0
              ? ` ${postCount} berita yang menggunakan kategori ini akan tetap tersimpan, tetapi menjadi tanpa kategori.`
              : " Kategori ini belum digunakan oleh berita apa pun."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={categoryId} />

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
                "Hapus kategori"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
