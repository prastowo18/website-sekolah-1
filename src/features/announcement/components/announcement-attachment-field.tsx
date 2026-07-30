"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeAnnouncementGoogleDriveUrl } from "@/features/announcement/google-drive-url";

type AnnouncementAttachmentFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function AnnouncementAttachmentField({
  formId,
  initialValue,
  error,
  disabled = false,
}: AnnouncementAttachmentFieldProps) {
  const [attachmentUrl, setAttachmentUrl] = useState(initialValue);

  const validUrl = normalizeAnnouncementGoogleDriveUrl(attachmentUrl);

  return (
    <div className="rounded-lg border p-4">
      <p className="font-medium">Lampiran Google Drive</p>

      <p className="mt-1 text-xs text-muted-foreground">
        Lampiran bersifat opsional dan tidak diunggah ke penyimpanan website.
        Pastikan akses Google Drive diatur agar dapat dibuka oleh pengunjung.
      </p>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`${formId}-attachmentUrl`}>URL lampiran</Label>

        <Input
          id={`${formId}-attachmentUrl`}
          name="attachmentUrl"
          type="url"
          value={attachmentUrl}
          onChange={(event) => {
            setAttachmentUrl(event.target.value);
          }}
          placeholder="https://drive.google.com/file/d/.../view"
          maxLength={4000}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${formId}-attachmentUrl-error`
              : `${formId}-attachmentUrl-help`
          }
        />

        <p
          id={`${formId}-attachmentUrl-help`}
          className="text-xs text-muted-foreground"
        >
          Kosongkan apabila pengumuman tidak memiliki lampiran. Hanya URL HTTPS
          dari drive.google.com atau docs.google.com yang diterima.
        </p>

        {error ? (
          <p
            id={`${formId}-attachmentUrl-error`}
            className="text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        {validUrl && !disabled ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={validUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Periksa lampiran
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
