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
  createPostCategoryAction,
  updatePostCategoryAction,
} from "@/features/post-category/actions";
import {
  initialPostCategoryActionState,
  type PostCategoryActionState,
} from "@/features/post-category/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  PostCategoryFormFields,
  type PostCategoryFormValues,
} from "./post-category-form-fields";

export type EditablePostCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  updatedAt: string;
};

type PostCategoryFormDialogProps = {
  category?: EditablePostCategory;
};

const emptyValues: PostCategoryFormValues = {
  name: "",
  slug: "",
  description: "",
};

export function PostCategoryFormDialog({
  category,
}: PostCategoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = category !== undefined;

  const action = isEdit ? updatePostCategoryAction : createPostCategoryAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PostCategoryActionState,
      formData: FormData,
    ): Promise<PostCategoryActionState> => {
      const nextState = await action(previousState, formData);

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

  const values: PostCategoryFormValues = category
    ? {
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
      }
    : emptyValues;

  const formId = category
    ? `edit-post-category-${category.id}`
    : "create-post-category";

  const formVersion = category
    ? `${category.id}-${category.updatedAt}`
    : `create-${state.categoryId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah kategori"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit kategori berita" : "Tambah kategori berita"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui nama, slug, dan deskripsi kategori."
              : "Tambahkan kategori untuk mengelompokkan berita sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {category ? (
            <input type="hidden" name="id" value={category.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <PostCategoryFormFields
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
                "Tambah kategori"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
