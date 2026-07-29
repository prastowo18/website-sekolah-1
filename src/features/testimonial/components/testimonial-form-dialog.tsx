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
  createTestimonialAction,
  updateTestimonialAction,
} from "@/features/testimonial/actions";
import {
  initialTestimonialActionState,
  type TestimonialActionState,
} from "@/features/testimonial/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  TestimonialFormFields,
  type TestimonialFormValues,
} from "./testimonial-form-fields";

export type EditableTestimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  photoUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type TestimonialFormDialogProps = {
  roleOptions: string[];
  testimonial?: EditableTestimonial;
};

const emptyValues: TestimonialFormValues = {
  name: "",
  role: "",
  content: "",
  photoUrl: "",
  isPublished: false,
  sortOrder: 0,
};

export function TestimonialFormDialog({
  roleOptions,
  testimonial,
}: TestimonialFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = testimonial !== undefined;

  const action = isEdit ? updateTestimonialAction : createTestimonialAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: TestimonialActionState,
      formData: FormData,
    ): Promise<TestimonialActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialTestimonialActionState,
  );

  useActionToast(state);

  const values: TestimonialFormValues = testimonial
    ? {
        name: testimonial.name,
        role: testimonial.role ?? "",
        content: testimonial.content,
        photoUrl: testimonial.photoUrl ?? "",
        isPublished: testimonial.isPublished,
        sortOrder: testimonial.sortOrder,
      }
    : emptyValues;

  const formId = testimonial
    ? `edit-testimonial-${testimonial.id}`
    : "create-testimonial";

  const formVersion = testimonial
    ? `${testimonial.id}-${testimonial.updatedAt}`
    : `create-${state.testimonialId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah testimoni"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit testimoni" : "Tambah testimoni"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui pemberi, isi, foto, urutan, dan status publikasi testimoni."
              : "Tambahkan testimoni baru dari orang tua, alumni, siswa, atau mitra sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {testimonial ? (
            <input type="hidden" name="id" value={testimonial.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <TestimonialFormFields
            key={formVersion}
            formId={formId}
            values={values}
            roleOptions={roleOptions}
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
                "Tambah testimoni"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
