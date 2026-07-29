"use client";

import { Pencil, Plus } from "lucide-react";
import {
  startTransition,
  useActionState,
  useState,
} from "react";

import {
  Alert,
  AlertDescription,
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
  createTeacherAction,
  updateTeacherAction,
} from "@/features/teacher/actions";
import {
  initialTeacherActionState,
  type TeacherActionState,
} from "@/features/teacher/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  TeacherFormFields,
  type TeacherFormValues,
} from "./teacher-form-fields";

export type EditableTeacher = {
  id: string;
  name: string;
  slug: string;
  employeeNumber: string | null;
  position: string | null;
  subject: string | null;
  education: string | null;
  shortBiography: string | null;
  photoUrl: string | null;
  sortOrder: number;
  isPrincipal: boolean;
  isActive: boolean;
  updatedAt: string;
};

type TeacherFormDialogProps = {
  teacher?: EditableTeacher;
};

const emptyValues: TeacherFormValues = {
  name: "",
  slug: "",
  employeeNumber: "",
  position: "",
  subject: "",
  education: "",
  shortBiography: "",
  sortOrder: 0,
  isPrincipal: false,
  isActive: true,
};

export function TeacherFormDialog({
  teacher,
}: TeacherFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = teacher !== undefined;

  const action = isEdit
    ? updateTeacherAction
    : createTeacherAction;

  const [state, formAction, isPending] =
    useActionState(
      async (
        previousState: TeacherActionState,
        formData: FormData,
      ): Promise<TeacherActionState> => {
        const nextState = await action(
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
      initialTeacherActionState,
    );

  useActionToast(state);

  const values: TeacherFormValues = teacher
    ? {
        name: teacher.name,
        slug: teacher.slug,
        employeeNumber:
          teacher.employeeNumber ?? "",
        position: teacher.position ?? "",
        subject: teacher.subject ?? "",
        education: teacher.education ?? "",
        shortBiography:
          teacher.shortBiography ?? "",
        sortOrder: teacher.sortOrder,
        isPrincipal: teacher.isPrincipal,
        isActive: teacher.isActive,
      }
    : emptyValues;

  const formId = teacher
    ? `edit-teacher-${teacher.id}`
    : "create-teacher";

  const formVersion = teacher
    ? `${teacher.id}-${teacher.updatedAt}`
    : `create-${state.teacherId ?? "new"}`;

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
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

          {isEdit ? "Edit" : "Tambah guru"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit data guru"
              : "Tambah guru"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui data guru atau tenaga kependidikan."
              : "Tambahkan guru atau tenaga kependidikan sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-6"
          noValidate
        >
          {teacher ? (
            <input
              type="hidden"
              name="id"
              value={teacher.id}
            />
          ) : null}

          {state.status === "error" &&
          state.message ? (
            <Alert variant="destructive">
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <TeacherFormFields
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
                Batal
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
                "Tambah guru"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
