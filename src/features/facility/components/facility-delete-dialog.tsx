'use client';

import { startTransition, useActionState, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { deleteFacilityAction } from '@/features/facility/actions';
import {
  FacilityActionState,
  initialFacilityActionState,
} from '@/features/facility/types';
import { useActionToast } from '@/hooks/use-action-toast';
import { Trash2 } from 'lucide-react';

type FacilityDeleteDialogProps = {
  facilityId: string;
  facilityName: string;
};

export function FacilityDeleteDialog({
  facilityId,
  facilityName,
}: FacilityDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: FacilityActionState,
      formData: FormData,
    ): Promise<FacilityActionState> => {
      const nextState = await deleteFacilityAction(previousState, formData);

      if (nextState.status === 'success') {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialFacilityActionState,
  );

  useActionToast(state);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <Trash2 className="size-4" />
          Hapus
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus fasilitas?</AlertDialogTitle>

          <AlertDialogDescription>
            Fasilitas <strong>{facilityName}</strong> akan dihapus secara
            permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={facilityId} />

          {state.status === 'error' && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Batal
            </AlertDialogCancel>

            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menghapus...
                </>
              ) : (
                'Hapus fasilitas'
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
