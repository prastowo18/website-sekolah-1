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
import { createPostAction, updatePostAction } from "@/features/post/actions";
import type { PostStatusValue } from "@/features/post/constants";
import {
  initialPostActionState,
  type PostActionState,
} from "@/features/post/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  PostFormFields,
  type PostCategoryOption,
  type PostFormValues,
} from "./post-form-fields";

export type EditablePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImageUrl: string | null;
  status: PostStatusValue;
  publishedAt: string | null;
  scheduledAt: string | null;
  categoryId: string | null;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

type PostFormDialogProps = {
  categories: PostCategoryOption[];
  post?: EditablePost;
};

const emptyValues: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImageUrl: "",
  status: "DRAFT",
  scheduledAt: "",
  categoryId: "",
  seoTitle: "",
  seoDescription: "",
};

export function PostFormDialog({ categories, post }: PostFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = post !== undefined;

  const action = isEdit ? updatePostAction : createPostAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PostActionState,
      formData: FormData,
    ): Promise<PostActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialPostActionState,
  );

  useActionToast(state);

  const values: PostFormValues = post
    ? {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content,
        featuredImageUrl: post.featuredImageUrl ?? "",
        status: post.status,
        scheduledAt: post.scheduledAt ?? "",
        categoryId: post.categoryId ?? "",
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
      }
    : emptyValues;

  const formId = post ? `edit-post-${post.id}` : "create-post";

  const formVersion = post
    ? `${post.id}-${post.updatedAt}`
    : `create-${state.postId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah berita"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit berita" : "Tambah berita"}</DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui isi, status, kategori, dan pengaturan berita."
              : "Tambahkan berita baru untuk website sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {post ? <input type="hidden" name="id" value={post.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <PostFormFields
            key={formVersion}
            formId={formId}
            values={values}
            categories={categories}
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
                "Simpan berita"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
