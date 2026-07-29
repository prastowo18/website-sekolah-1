import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ProgramFormDialog, type EditableProgram } from "./program-form-dialog";
import { ProgramDeleteDialog } from "./program-delete-dialog";

export type ProgramListItem = EditableProgram & {
  publishedAt: string | null;
};

type ProgramTableProps = {
  programs: ProgramListItem[];
  canEdit: boolean;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Belum diterbitkan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function ProgramTable({ programs, canEdit }: ProgramTableProps) {
  if (programs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">Program tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan program baru atau ubah pencarian dan filter yang digunakan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Publikasi</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {programs.map((program) => (
            <TableRow key={program.id}>
              <TableCell>
                <div className="max-w-md">
                  <p className="font-medium">{program.name}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    /program/{program.slug}
                  </p>

                  {program.shortDescription ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {program.shortDescription}
                    </p>
                  ) : null}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={program.isActive ? "default" : "secondary"}>
                    {program.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>

                  {program.isFeatured ? (
                    <Badge variant="outline">Unggulan</Badge>
                  ) : null}
                </div>
              </TableCell>

              <TableCell>{program.sortOrder}</TableCell>

              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(program.publishedAt)}
                </span>
              </TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ProgramFormDialog program={program} />

                    <ProgramDeleteDialog
                      programId={program.id}
                      programName={program.name}
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
