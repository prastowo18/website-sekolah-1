import { ImageOff, ListOrdered, MessageSquareQuote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TestimonialDeleteDialog } from "./testimonial-delete-dialog";
import {
  TestimonialFormDialog,
  type EditableTestimonial,
} from "./testimonial-form-dialog";

type TestimonialTableProps = {
  testimonials: EditableTestimonial[];
  roleOptions: string[];
  canEdit: boolean;
};

function getSafePhotoUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function TestimonialTable({
  testimonials,
  roleOptions,
  canEdit,
}: TestimonialTableProps) {
  if (testimonials.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <MessageSquareQuote className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Testimoni tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan testimoni baru atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pemberi</TableHead>
            <TableHead>Testimoni</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Status</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {testimonials.map((testimonial) => {
            const photoUrl = getSafePhotoUrl(testimonial.photoUrl);

            return (
              <TableRow key={testimonial.id}>
                <TableCell>
                  <div className="flex min-w-56 items-center gap-3">
                    {photoUrl ? (
                      <div
                        role="img"
                        aria-label={`Foto ${testimonial.name}`}
                        className="size-12 shrink-0 rounded-full border bg-muted bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${JSON.stringify(photoUrl)})`,
                        }}
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-muted">
                        <ImageOff className="size-5 text-muted-foreground" />
                      </div>
                    )}

                    <div>
                      <p className="font-medium">{testimonial.name}</p>

                      <p className="text-sm text-muted-foreground">
                        {testimonial.role ?? "Tanpa keterangan"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="line-clamp-4 max-w-2xl whitespace-pre-wrap text-sm text-muted-foreground">
                    {testimonial.content}
                  </p>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <ListOrdered className="size-4 text-muted-foreground" />
                    {testimonial.sortOrder}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={testimonial.isPublished ? "default" : "secondary"}
                  >
                    {testimonial.isPublished
                      ? "Dipublikasikan"
                      : "Belum dipublikasikan"}
                  </Badge>
                </TableCell>

                {canEdit ? (
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <TestimonialFormDialog
                        testimonial={testimonial}
                        roleOptions={roleOptions}
                      />

                      <TestimonialDeleteDialog
                        testimonialId={testimonial.id}
                        testimonialName={testimonial.name}
                      />
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
