import { CalendarClock, ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ExtracurricularDeleteDialog } from "./extracurricular-delete-dialog";
import {
  ExtracurricularFormDialog,
  type EditableExtracurricular,
} from "./extracurricular-form-dialog";

type ExtracurricularTableProps = {
  extracurriculars: EditableExtracurricular[];
  canEdit: boolean;
};

export function ExtracurricularTable({
  extracurriculars,
  canEdit,
}: ExtracurricularTableProps) {
  if (extracurriculars.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <CalendarClock className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Ekstrakurikuler tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan data baru atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ekstrakurikuler</TableHead>
            <TableHead>Jadwal</TableHead>
            <TableHead>Pembina</TableHead>
            <TableHead>Kelompok Kelas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Urutan</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {extracurriculars.map((extracurricular) => (
            <TableRow key={extracurricular.id}>
              <TableCell>
                <div className="flex min-w-64 items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <ImageOff className="size-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">{extracurricular.name}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      /ekstrakurikuler/
                      {extracurricular.slug}
                    </p>

                    {extracurricular.description ? (
                      <p className="mt-2 line-clamp-2 max-w-sm text-sm text-muted-foreground">
                        {extracurricular.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              <TableCell>{extracurricular.schedule ?? "—"}</TableCell>

              <TableCell>{extracurricular.coach ?? "—"}</TableCell>

              <TableCell>
                {extracurricular.targetClasses.length > 0 ? (
                  <div className="flex max-w-56 flex-wrap gap-1">
                    {extracurricular.targetClasses.map((targetClass) => (
                      <Badge key={targetClass} variant="outline">
                        {targetClass}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell>
                <Badge
                  variant={extracurricular.isActive ? "default" : "secondary"}
                >
                  {extracurricular.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>

              <TableCell>{extracurricular.sortOrder}</TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ExtracurricularFormDialog
                      extracurricular={extracurricular}
                    />

                    <ExtracurricularDeleteDialog
                      extracurricularId={extracurricular.id}
                      extracurricularName={extracurricular.name}
                    />
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
