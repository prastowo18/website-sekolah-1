import { ImageOff } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FacilityDeleteDialog } from "./facility-delete-dialog";
import {
  FacilityFormDialog,
  type EditableFacility,
} from "./facility-form-dialog";

export type FacilityListItem = EditableFacility;

type FacilityTableProps = {
  facilities: FacilityListItem[];
  canEdit: boolean;
};

export function FacilityTable({ facilities, canEdit }: FacilityTableProps) {
  if (facilities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">Fasilitas tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan fasilitas baru atau ubah pencarian dan filter yang
          digunakan.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fasilitas</TableHead>
            <TableHead>Kapasitas</TableHead>
            <TableHead>Kondisi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Urutan</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {facilities.map((facility) => (
            <TableRow key={facility.id}>
              <TableCell>
                <div className="flex min-w-80 items-start gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {facility.imageUrl ? (
                      <Image
                        src={facility.imageUrl}
                        alt={`Foto fasilitas ${facility.name}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <ImageOff className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">{facility.name}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      /fasilitas/{facility.slug}
                    </p>

                    {facility.description ? (
                      <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted-foreground">
                        {facility.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {facility.capacity ? (
                  facility.capacity
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell>
                {facility.condition ? (
                  facility.condition
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell>
                <Badge variant={facility.isActive ? "default" : "secondary"}>
                  {facility.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>

              <TableCell>{facility.sortOrder}</TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <FacilityFormDialog facility={facility} />

                    <FacilityDeleteDialog
                      facilityId={facility.id}
                      facilityName={facility.name}
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
