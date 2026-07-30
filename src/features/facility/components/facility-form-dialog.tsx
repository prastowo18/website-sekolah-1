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
  createFacilityAction,
  updateFacilityAction,
} from "@/features/facility/actions";
import {
  initialFacilityActionState,
  type FacilityActionState,
} from "@/features/facility/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  FacilityFormFields,
  type FacilityFormValues,
} from "./facility-form-fields";

export type EditableFacility = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  capacity: string | null;
  condition: string | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

type FacilityFormDialogProps = {
  facility?: EditableFacility;
};

const emptyValues: FacilityFormValues = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  capacity: "",
  condition: "",
  sortOrder: 0,
  isActive: true,
};

export function FacilityFormDialog({ facility }: FacilityFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = facility !== undefined;

  const action = isEdit ? updateFacilityAction : createFacilityAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: FacilityActionState,
      formData: FormData,
    ): Promise<FacilityActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialFacilityActionState,
  );

  useActionToast(state);

  const values: FacilityFormValues = facility
    ? {
        name: facility.name,
        slug: facility.slug,
        description: facility.description ?? "",
        imageUrl: facility.imageUrl ?? "",
        capacity: facility.capacity ?? "",
        condition: facility.condition ?? "",
        sortOrder: facility.sortOrder,
        isActive: facility.isActive,
      }
    : emptyValues;

  const formId = facility ? `edit-facility-${facility.id}` : "create-facility";

  const formVersion = facility
    ? `${facility.id}-${facility.updatedAt}`
    : `create-${state.facilityId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah fasilitas"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit fasilitas" : "Tambah fasilitas"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi, foto, dan status fasilitas sekolah."
              : "Tambahkan fasilitas yang tersedia di sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {facility ? (
            <input type="hidden" name="id" value={facility.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <FacilityFormFields
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
                "Tambah fasilitas"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
