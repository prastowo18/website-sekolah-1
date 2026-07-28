"use client";

import { useActionToast } from "@/hooks/use-action-toast";
import { Pencil, Plus } from "lucide-react";
import { useActionState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
  createProgramAction,
  updateProgramAction,
} from "@/features/program/actions";
import {
  initialProgramActionState,
} from "@/features/program/types";

import {
  ProgramFormFields,
  type ProgramFormValues,
} from "./program-form-fields";

export type EditableProgram = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  benefits: string[];
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  updatedAt: string;
};

type ProgramFormDialogProps = {
  program?: EditableProgram;
};

const emptyValues: ProgramFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  benefits: "",
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
};

export function ProgramFormDialog({
  program,
}: ProgramFormDialogProps) {
  const isEdit = Boolean(program);

  const action = isEdit
    ? updateProgramAction
    : createProgramAction;

  const [state, formAction, isPending] =
    useActionState(
      action,
      initialProgramActionState,
    );

  useActionToast(state);

  const values: ProgramFormValues = program
    ? {
        name: program.name,
        slug: program.slug,
        shortDescription:
          program.shortDescription ?? "",
        description:
          program.description ?? "",
        benefits: program.benefits.join("\n"),
        sortOrder: program.sortOrder,
        isFeatured: program.isFeatured,
        isActive: program.isActive,
      }
    : emptyValues;

  const formId = program
    ? `edit-program-${program.id}`
    : "create-program";

  const formVersion = program
    ? `${program.id}-${program.updatedAt}`
    : `create-${state.programId ?? "new"}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? (
            <Pencil className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}

          {isEdit ? "Edit" : "Tambah program"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit program"
              : "Tambah program"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi program sekolah."
              : "Tambahkan program pendidikan atau program unggulan sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-6"
          noValidate
        >
          {program ? (
            <input
              type="hidden"
              name="id"
              value={program.id}
            />
          ) : null}

          {state.message ? (
            <Alert
              variant={
                state.status === "error"
                  ? "destructive"
                  : "default"
              }
              role="status"
            >
              <AlertTitle>
                {state.status === "success"
                  ? "Berhasil"
                  : "Data belum tersimpan"}
              </AlertTitle>

              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <ProgramFormFields
            key={formVersion}
            formId={formId}
            values={values}
            errors={state.fieldErrors}
            disabled={isPending}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
              >
                Tutup
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan perubahan"
              ) : (
                "Tambah program"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
