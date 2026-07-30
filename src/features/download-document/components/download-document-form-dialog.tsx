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
  createDownloadDocumentAction,
  updateDownloadDocumentAction,
} from "@/features/download-document/actions";
import {
  initialDownloadDocumentActionState,
  type DownloadDocumentActionState,
} from "@/features/download-document/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  DownloadDocumentFormFields,
  type DownloadDocumentFormValues,
} from "./download-document-form-fields";

export type EditableDownloadDocument = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number | null;
  fileType: string | null;
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type DownloadDocumentFormDialogProps = {
  categoryOptions: string[];
  fileTypeOptions: string[];
  document?: EditableDownloadDocument;
};

const emptyValues: DownloadDocumentFormValues = {
  name: "",
  slug: "",
  description: "",
  category: "",
  fileUrl: "",
  fileName: "",
  fileType: "",
  isActive: true,
};

export function DownloadDocumentFormDialog({
  categoryOptions,
  fileTypeOptions,
  document,
}: DownloadDocumentFormDialogProps) {
  const [open, setOpen] = useState(false);

  const isEdit = document !== undefined;

  const action = isEdit
    ? updateDownloadDocumentAction
    : createDownloadDocumentAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: DownloadDocumentActionState,
      formData: FormData,
    ): Promise<DownloadDocumentActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialDownloadDocumentActionState,
  );

  useActionToast(state);

  const values: DownloadDocumentFormValues = document
    ? {
        name: document.name,
        slug: document.slug,
        description: document.description ?? "",
        category: document.category ?? "",
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileType: document.fileType ?? "",
        isActive: document.isActive,
      }
    : emptyValues;

  const formId = document
    ? `edit-download-document-${document.id}`
    : "create-download-document";

  const formVersion = document
    ? `${document.id}-${document.updatedAt}`
    : `create-${state.documentId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah dokumen"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit dokumen" : "Tambah dokumen"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi dan URL Google Drive dokumen."
              : "Tambahkan dokumen melalui URL Google Drive."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {document ? (
            <input type="hidden" name="id" value={document.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <DownloadDocumentFormFields
            key={formVersion}
            formId={formId}
            values={values}
            categoryOptions={categoryOptions}
            fileTypeOptions={fileTypeOptions}
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
                "Tambah dokumen"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
