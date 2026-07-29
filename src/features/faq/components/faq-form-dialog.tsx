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
import { createFaqAction, updateFaqAction } from "@/features/faq/actions";
import {
  initialFaqActionState,
  type FaqActionState,
} from "@/features/faq/types";
import { useActionToast } from "@/hooks/use-action-toast";

import { FaqFormFields, type FaqFormValues } from "./faq-form-fields";

export type EditableFaq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type FaqFormDialogProps = {
  categoryOptions: string[];
  faq?: EditableFaq;
};

const emptyValues: FaqFormValues = {
  question: "",
  answer: "",
  category: "",
  sortOrder: 0,
  isActive: true,
};

export function FaqFormDialog({ categoryOptions, faq }: FaqFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = faq !== undefined;

  const action = isEdit ? updateFaqAction : createFaqAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: FaqActionState,
      formData: FormData,
    ): Promise<FaqActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialFaqActionState,
  );

  useActionToast(state);

  const values: FaqFormValues = faq
    ? {
        question: faq.question,
        answer: faq.answer,
        category: faq.category ?? "",
        sortOrder: faq.sortOrder,
        isActive: faq.isActive,
      }
    : emptyValues;

  const formId = faq ? `edit-faq-${faq.id}` : "create-faq";

  const formVersion = faq
    ? `${faq.id}-${faq.updatedAt}`
    : `create-${state.faqId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah FAQ"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit FAQ" : "Tambah FAQ"}</DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui pertanyaan, jawaban, kategori, dan urutan tampil."
              : "Tambahkan pertanyaan dan jawaban baru untuk website sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <FaqFormFields
            key={formVersion}
            formId={formId}
            values={values}
            categoryOptions={categoryOptions}
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
                "Tambah FAQ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
