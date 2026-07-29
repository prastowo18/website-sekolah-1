import {
  Crown,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TeacherDeleteDialog } from "./teacher-delete-dialog";
import {
  TeacherFormDialog,
  type EditableTeacher,
} from "./teacher-form-dialog";

export type TeacherListItem = EditableTeacher;

type TeacherTableProps = {
  teachers: TeacherListItem[];
  canEdit: boolean;
};

export function TeacherTable({
  teachers,
  canEdit,
}: TeacherTableProps) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">
          Data guru tidak ditemukan
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan data baru atau ubah
          pencarian dan filter yang digunakan.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Nomor Pegawai</TableHead>
            <TableHead>Jabatan/Bidang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Urutan</TableHead>

            {canEdit ? (
              <TableHead className="text-right">
                Tindakan
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>
                <div className="flex min-w-64 items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-muted">
                    <UserRound className="size-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {teacher.name}
                      </p>

                      {teacher.isPrincipal ? (
                        <Badge variant="outline">
                          <Crown className="size-3" />
                          Kepala Sekolah
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      /guru/{teacher.slug}
                    </p>

                    {teacher.education ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {teacher.education}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {teacher.employeeNumber ?? (
                  <span className="text-muted-foreground">
                    —
                  </span>
                )}
              </TableCell>

              <TableCell>
                <div className="min-w-40">
                  <p>
                    {teacher.position ?? "—"}
                  </p>

                  {teacher.subject ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {teacher.subject}
                    </p>
                  ) : null}
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    teacher.isActive
                      ? "default"
                      : "secondary"
                  }
                >
                  {teacher.isActive
                    ? "Aktif"
                    : "Nonaktif"}
                </Badge>
              </TableCell>

              <TableCell>
                {teacher.sortOrder}
              </TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <TeacherFormDialog
                      teacher={teacher}
                    />

                    <TeacherDeleteDialog
                      teacherId={teacher.id}
                      teacherName={teacher.name}
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
