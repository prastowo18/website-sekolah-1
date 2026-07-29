"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateContactMessageAction } from "../admin-actions";
import {
  CONTACT_MESSAGE_STATUS_LABELS,
  CONTACT_MESSAGE_STATUS_VALUES,
  type ContactMessageStatusValue,
} from "../constants";
import type { ContactMessageActionState } from "../types";

type Assignee = {
  id: string;
  name: string;
  username: string;
};

type ContactMessageManageFormProps = {
  messageId: string;
  status: ContactMessageStatusValue;
  assignedToId: string | null;
  assignees: Assignee[];
};

const initialState: ContactMessageActionState = {
  status: "idle",
  message: "",
};

export function ContactMessageManageForm({
  messageId,
  status,
  assignedToId,
  assignees,
}: ContactMessageManageFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: ContactMessageActionState,
      formData: FormData,
    ): Promise<ContactMessageActionState> => {
      const nextState = await updateContactMessageAction(
        previousState,
        formData,
      );

      if (nextState.status === "success") {
        router.refresh();
      }

      return nextState;
    },
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="messageId" value={messageId} />

      <div>
        <Label htmlFor="contact-status">Status pesan</Label>

        <Select name="status" defaultValue={status}>
          <SelectTrigger id="contact-status" className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {CONTACT_MESSAGE_STATUS_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {CONTACT_MESSAGE_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="contact-assignee">Penanggung jawab</Label>

        <Select name="assignedToId" defaultValue={assignedToId ?? "unassigned"}>
          <SelectTrigger id="contact-assignee" className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="unassigned">Belum ditugaskan</SelectItem>

            {assignees.map((assignee) => (
              <SelectItem key={assignee.id} value={assignee.id}>
                {assignee.name} ({assignee.username})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state.status !== "idle" ? (
        <div
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              : "rounded-md border border-primary/30 bg-primary/5 p-3 text-sm"
          }
        >
          {state.message}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}

        {isPending ? "Menyimpan..." : "Simpan perubahan"}
      </Button>
    </form>
  );
}
