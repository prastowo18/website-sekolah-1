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
  createPpdbInformationAction,
  updatePpdbInformationAction,
} from "@/features/ppdb/actions";
import type { PpdbStatusValue } from "@/features/ppdb/constants";
import {
  initialPpdbInformationActionState,
  type PpdbInformationActionState,
} from "@/features/ppdb/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  PpdbInformationFormFields,
  type PpdbInformationFormValues,
} from "./ppdb-information-form-fields";

export type EditablePpdbInformation = {
  id: string;
  title: string;
  academicYear: string;
  status: PpdbStatusValue;
  shortDescription: string | null;
  description: string | null;
  quota: number | null;
  brochureUrl: string | null;
  externalRegistrationUrl: string | null;
  registrationLocation: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  serviceHours: string | null;
  scholarshipInformation: string | null;
  showFee: boolean;
  showExternalRegistrationButton: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PpdbInformationFormDialogProps = {
  ppdb?: EditablePpdbInformation;
};

const emptyValues: PpdbInformationFormValues = {
  title: "",
  academicYear: "",
  status: "DRAFT",
  shortDescription: "",
  description: "",
  quota: null,
  brochureUrl: "",
  externalRegistrationUrl: "",
  registrationLocation: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  serviceHours: "",
  scholarshipInformation: "",
  showFee: false,
  showExternalRegistrationButton: false,
  isActive: false,
};

export function PpdbInformationFormDialog({
  ppdb,
}: PpdbInformationFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = ppdb !== undefined;

  const action = isEdit
    ? updatePpdbInformationAction
    : createPpdbInformationAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PpdbInformationActionState,
      formData: FormData,
    ): Promise<PpdbInformationActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialPpdbInformationActionState,
  );

  useActionToast(state);

  const values: PpdbInformationFormValues = ppdb
    ? {
        title: ppdb.title,
        academicYear: ppdb.academicYear,
        status: ppdb.status,
        shortDescription: ppdb.shortDescription ?? "",
        description: ppdb.description ?? "",
        quota: ppdb.quota,
        brochureUrl: ppdb.brochureUrl ?? "",
        externalRegistrationUrl: ppdb.externalRegistrationUrl ?? "",
        registrationLocation: ppdb.registrationLocation ?? "",
        contactPerson: ppdb.contactPerson ?? "",
        contactPhone: ppdb.contactPhone ?? "",
        contactEmail: ppdb.contactEmail ?? "",
        serviceHours: ppdb.serviceHours ?? "",
        scholarshipInformation: ppdb.scholarshipInformation ?? "",
        showFee: ppdb.showFee,
        showExternalRegistrationButton: ppdb.showExternalRegistrationButton,
        isActive: ppdb.isActive,
      }
    : emptyValues;

  const formId = ppdb ? `edit-ppdb-${ppdb.id}` : "create-ppdb";

  const formVersion = ppdb
    ? `${ppdb.id}-${ppdb.updatedAt}`
    : `create-${state.ppdbId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah informasi"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit informasi PPDB" : "Tambah informasi PPDB"}
          </DialogTitle>

          <DialogDescription>
            Kelola informasi PPDB tanpa proses pendaftaran calon siswa di dalam
            website.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {ppdb ? <input type="hidden" name="id" value={ppdb.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <PpdbInformationFormFields
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
                "Tambah informasi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
