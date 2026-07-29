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
  createExtracurricularAction,
  updateExtracurricularAction,
} from "@/features/extracurricular/actions";
import {
  initialExtracurricularActionState,
  type ExtracurricularActionState,
} from "@/features/extracurricular/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  ExtracurricularFormFields,
  type ExtracurricularFormValues,
} from "./extracurricular-form-fields";

export type EditableExtracurricular = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  schedule: string | null;
  coach: string | null;
  targetClasses: string[];
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

type ExtracurricularFormDialogProps = {
  extracurricular?: EditableExtracurricular;
};

const emptyValues: ExtracurricularFormValues = {
  name: "",
  slug: "",
  description: "",
  schedule: "",
  coach: "",
  targetClasses: "",
  sortOrder: 0,
  isActive: true,
};

export function ExtracurricularFormDialog({
  extracurricular,
}: ExtracurricularFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = extracurricular !== undefined;

  const action = isEdit
    ? updateExtracurricularAction
    : createExtracurricularAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: ExtracurricularActionState,
      formData: FormData,
    ): Promise<ExtracurricularActionState> => {
      const nextState = await action(previousState, formData);

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

  const values: ExtracurricularFormValues = extracurricular
    ? {
        name: extracurricular.name,
        slug: extracurricular.slug,
        description: extracurricular.description ?? "",
        schedule: extracurricular.schedule ?? "",
        coach: extracurricular.coach ?? "",
        targetClasses: extracurricular.targetClasses.join("\n"),
        sortOrder: extracurricular.sortOrder,
        isActive: extracurricular.isActive,
      }
    : emptyValues;

  const formId = extracurricular
    ? `edit-extracurricular-${extracurricular.id}`
    : "create-extracurricular";

  const formVersion = extracurricular
    ? `${extracurricular.id}-${extracurricular.updatedAt}`
    : `create-${state.extracurricularId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah ekstrakurikuler"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit ekstrakurikuler" : "Tambah ekstrakurikuler"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi kegiatan ekstrakurikuler."
              : "Tambahkan kegiatan ekstrakurikuler sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {extracurricular ? (
            <input type="hidden" name="id" value={extracurricular.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <ExtracurricularFormFields
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
                "Tambah ekstrakurikuler"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
