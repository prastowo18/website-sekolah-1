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
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/features/announcement/actions";
import type { AnnouncementPriorityValue } from "@/features/announcement/constants";
import {
  initialAnnouncementActionState,
  type AnnouncementActionState,
} from "@/features/announcement/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  AnnouncementFormFields,
  type AnnouncementFormValues,
} from "./announcement-form-fields";

export type EditableAnnouncement = {
  id: string;
  title: string;
  slug: string;
  content: string;
  priority: AnnouncementPriorityValue;
  attachmentUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementFormDialogProps = {
  announcement?: EditableAnnouncement;
};

const emptyValues: AnnouncementFormValues = {
  title: "",
  slug: "",
  content: "",
  priority: "NORMAL",
  attachmentUrl: "",
  startDate: "",
  endDate: "",
  isPinned: false,
  isActive: true,
};

export function AnnouncementFormDialog({
  announcement,
}: AnnouncementFormDialogProps) {
  const [open, setOpen] = useState(false);

  const isEdit = announcement !== undefined;

  const action = isEdit ? updateAnnouncementAction : createAnnouncementAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: AnnouncementActionState,
      formData: FormData,
    ): Promise<AnnouncementActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialAnnouncementActionState,
  );

  useActionToast(state);

  const values: AnnouncementFormValues = announcement
    ? {
        title: announcement.title,
        slug: announcement.slug,
        content: announcement.content,
        priority: announcement.priority,
        attachmentUrl: announcement.attachmentUrl ?? "",
        startDate: announcement.startDate ?? "",
        endDate: announcement.endDate ?? "",
        isPinned: announcement.isPinned,
        isActive: announcement.isActive,
      }
    : emptyValues;

  const formId = announcement
    ? `edit-announcement-${announcement.id}`
    : "create-announcement";

  const formVersion = announcement
    ? `${announcement.id}-${announcement.updatedAt}`
    : `create-${state.announcementId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah pengumuman"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit pengumuman" : "Tambah pengumuman"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui isi, lampiran Google Drive, periode tayang, dan status pengumuman."
              : "Tambahkan pengumuman baru dengan lampiran Google Drive opsional."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {announcement ? (
            <input type="hidden" name="id" value={announcement.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <AnnouncementFormFields
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
                "Simpan pengumuman"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
