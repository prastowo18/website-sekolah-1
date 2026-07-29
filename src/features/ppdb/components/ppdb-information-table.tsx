import { ClipboardList, Settings2, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ppdbStatusLabels,
  type PpdbStatusValue,
} from "@/features/ppdb/constants";

import { PpdbInformationDeleteDialog } from "./ppdb-information-delete-dialog";
import {
  PpdbInformationFormDialog,
  type EditablePpdbInformation,
} from "./ppdb-information-form-dialog";

export type PpdbInformationListItem = EditablePpdbInformation & {
  timelineCount: number;
  requirementCount: number;
  flowStepCount: number;
  feeCount: number;
};

type PpdbInformationTableProps = {
  items: PpdbInformationListItem[];
  canEdit: boolean;
};

function getStatusVariant(
  status: PpdbStatusValue,
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "OPEN") {
    return "default";
  }

  if (status === "CLOSED" || status === "COMPLETED") {
    return "secondary";
  }

  if (status === "ANNOUNCEMENT") {
    return "destructive";
  }

  return "outline";
}

export function PpdbInformationTable({
  items,
  canEdit,
}: PpdbInformationTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <ClipboardList className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Informasi PPDB tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan informasi PPDB atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Informasi PPDB</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Kuota</TableHead>
            <TableHead>Rincian</TableHead>
            <TableHead>Status Tampil</TableHead>
            <TableHead className="text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => {
            const detailCount =
              item.timelineCount +
              item.requirementCount +
              item.flowStepCount +
              item.feeCount;

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="min-w-72">
                    <p className="font-medium">{item.title}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Tahun ajaran {item.academicYear}
                    </p>

                    {item.shortDescription ? (
                      <p className="mt-2 line-clamp-2 max-w-xl text-sm text-muted-foreground">
                        {item.shortDescription}
                      </p>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>
                    {ppdbStatusLabels[item.status]}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    {item.quota ?? "Belum ditentukan"}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="min-w-48 space-y-1 text-sm">
                    <p>{item.timelineCount} jadwal</p>
                    <p>{item.requirementCount} persyaratan</p>
                    <p>{item.flowStepCount} langkah</p>
                    <p>{item.feeCount} biaya</p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/konsol-8m4q7x2k9v6d/ppdb/${item.id}`}>
                        <Settings2 className="size-4" />
                        Kelola rincian
                      </Link>
                    </Button>

                    {canEdit ? (
                      <>
                        <PpdbInformationFormDialog ppdb={item} />

                        <PpdbInformationDeleteDialog
                          ppdbId={item.id}
                          title={item.title}
                          academicYear={item.academicYear}
                          detailCount={detailCount}
                        />
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
