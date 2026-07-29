"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { submitContactMessageAction } from "../actions";
import type { ContactMessageActionState } from "../types";

const initialState: ContactMessageActionState = {
  status: "idle",
  message: "",
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-1 text-sm text-destructive">{errors[0]}</p>;
}

export function PublicContactForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const startedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!startedAtRef.current) {
      return;
    }

    startedAtRef.current.value = String(Date.now());
  }, []);

  const [state, formAction, isPending] = useActionState(
    async (previousState: ContactMessageActionState, formData: FormData) => {
      const nextState = await submitContactMessageAction(
        previousState,
        formData,
      );

      if (nextState.status === "success") {
        formRef.current?.reset();

        if (startedAtRef.current) {
          startedAtRef.current.value = String(Date.now());
        }
      }

      return nextState;
    },
    initialState,
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      <input
        ref={startedAtRef}
        type="hidden"
        name="startedAt"
        defaultValue=""
      />

      <div
        aria-hidden="true"
        className="absolute left-[-10000px] top-auto size-px overflow-hidden"
      >
        <Label htmlFor="contact-website">Website</Label>

        <Input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status !== "idle" ? (
        <div
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "success"
              ? "flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"
              : "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          }
        >
          {state.status === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
          )}

          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Nama lengkap</Label>

          <Input
            id="contact-name"
            name="name"
            className="mt-2"
            maxLength={160}
            autoComplete="name"
            required
          />

          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="contact-subject">Subjek</Label>

          <Input
            id="contact-subject"
            name="subject"
            className="mt-2"
            maxLength={220}
            placeholder="Contoh: Informasi kegiatan"
          />

          <FieldError errors={state.fieldErrors?.subject} />
        </div>

        <div>
          <Label htmlFor="contact-email">Email</Label>

          <Input
            id="contact-email"
            name="email"
            type="email"
            className="mt-2"
            maxLength={180}
            autoComplete="email"
            placeholder="nama@email.com"
          />

          <FieldError errors={state.fieldErrors?.email} />
        </div>

        <div>
          <Label htmlFor="contact-phone">Nomor telepon atau WhatsApp</Label>

          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            className="mt-2"
            maxLength={30}
            autoComplete="tel"
            placeholder="08xxxxxxxxxx"
          />

          <FieldError errors={state.fieldErrors?.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-message">Pesan</Label>

        <Textarea
          id="contact-message"
          name="message"
          className="mt-2 min-h-40 resize-y"
          minLength={20}
          maxLength={3000}
          placeholder="Tuliskan pertanyaan atau informasi yang dibutuhkan."
          required
        />

        <div className="mt-1 flex justify-between gap-4">
          <FieldError errors={state.fieldErrors?.message} />

          <p className="ml-auto text-xs text-muted-foreground">
            Maksimal 3.000 karakter
          </p>
        </div>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        Isi minimal salah satu kontak, yaitu email atau nomor telepon.
      </p>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}

        {isPending ? "Mengirim..." : "Kirim pesan"}
      </Button>
    </form>
  );
}
