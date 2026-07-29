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
  createAchievementAction,
  updateAchievementAction,
} from "@/features/achievement/actions";
import {
  initialAchievementActionState,
  type AchievementActionState,
} from "@/features/achievement/types";
import {
  type AchievementTypeValue,
  type CompetitionLevelValue,
} from "@/features/achievement/constants";
import { useActionToast } from "@/hooks/use-action-toast";

import {
  AchievementFormFields,
  type AchievementFormValues,
} from "./achievement-form-fields";

export type EditableAchievement = {
  id: string;
  title: string;
  slug: string;
  achievementType: AchievementTypeValue;
  category: string | null;
  winnerName: string | null;
  competitionLevel: CompetitionLevelValue | null;
  rank: string | null;
  achievementDate: string | null;
  description: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

type AchievementFormDialogProps = {
  achievement?: EditableAchievement;
};

const emptyValues: AchievementFormValues = {
  title: "",
  slug: "",
  achievementType: "STUDENT",
  category: "",
  winnerName: "",
  competitionLevel: "",
  rank: "",
  achievementDate: "",
  description: "",
  isPublished: true,
};

export function AchievementFormDialog({
  achievement,
}: AchievementFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = achievement !== undefined;

  const action = isEdit ? updateAchievementAction : createAchievementAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: AchievementActionState,
      formData: FormData,
    ): Promise<AchievementActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialAchievementActionState,
  );

  useActionToast(state);

  const values: AchievementFormValues = achievement
    ? {
        title: achievement.title,
        slug: achievement.slug,
        achievementType: achievement.achievementType,
        category: achievement.category ?? "",
        winnerName: achievement.winnerName ?? "",
        competitionLevel: achievement.competitionLevel ?? "",
        rank: achievement.rank ?? "",
        achievementDate: achievement.achievementDate ?? "",
        description: achievement.description ?? "",
        isPublished: achievement.isPublished,
      }
    : emptyValues;

  const formId = achievement
    ? `edit-achievement-${achievement.id}`
    : "create-achievement";

  const formVersion = achievement
    ? `${achievement.id}-${achievement.updatedAt}`
    : `create-${state.achievementId ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}

          {isEdit ? "Edit" : "Tambah prestasi"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit prestasi" : "Tambah prestasi"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi prestasi sekolah."
              : "Tambahkan prestasi siswa, guru, atau sekolah."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6" noValidate>
          {achievement ? (
            <input type="hidden" name="id" value={achievement.id} />
          ) : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <AchievementFormFields
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
                "Tambah prestasi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
