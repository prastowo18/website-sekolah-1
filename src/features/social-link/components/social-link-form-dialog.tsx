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
  createSocialLinkAction,
  updateSocialLinkAction,
} from "@/features/social-link/actions";
import {
  initialSocialLinkActionState,
  type SocialLinkActionState,
} from "@/features/social-link/types";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  SocialLinkFormFields,
  type SocialLinkFormValues,
} from "./social-link-form-fields";

export type EditableSocialLink = {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type SocialLinkFormDialogProps = {
  socialLink?: EditableSocialLink;
};

const emptyValues: SocialLinkFormValues = {
  platform: "",
  label: "",
  url: "",
  sortOrder: 0,
  isActive: true,
};

export function SocialLinkFormDialog({
  socialLink,
}: SocialLinkFormDialogProps) {
  const [open, setOpen] = useState(false);

  const isEdit = socialLink !== undefined;

  const action = isEdit ? updateSocialLinkAction : createSocialLinkAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: SocialLinkActionState,
      formData: FormData,
    ): Promise<SocialLinkActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialSocialLinkActionState,
  );

  useActionToast(state);

  const values: SocialLinkFormValues = socialLink
    ? {
        platform: socialLink.platform,
        label: socialLink.label ?? "",
        url: socialLink.url,
        sortOrder: socialLink.sortOrder,
        isActive: socialLink.isActive,
      }
    : emptyValues;

  const formId = socialLink
    ? `edit-social-link-${socialLink.id}`
    : "create-social-link";

  const formVersion = socialLink
    ? `${socialLink.id}-${socialLink.updatedAt}`
    : `create-${state.socialLinkId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah media sosial"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit media sosial" : "Tambah media sosial"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui platform, URL, status, dan urutan tampil."
              : "Tambahkan akun atau kanal resmi sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {socialLink ? (
            <input type="hidden" name="id" value={socialLink.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <SocialLinkFormFields
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
                "Tambah media sosial"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
