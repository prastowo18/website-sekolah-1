import { Download, File, Files } from "lucide-react";

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

import { DownloadDocumentDeleteDialog } from "./download-document-delete-dialog";
import {
  DownloadDocumentFormDialog,
  type EditableDownloadDocument,
} from "./download-document-form-dialog";

type DownloadDocumentTableProps = {
  documents: EditableDownloadDocument[];
  categoryOptions: string[];
  fileTypeOptions: string[];
  canEdit: boolean;
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null) {
    return "Ukuran tidak tersedia";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / Math.pow(1024, unitIndex);

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value)} ${units[unitIndex]}`;
}

export function DownloadDocumentTable({
  documents,
  categoryOptions,
  fileTypeOptions,
  canEdit,
}: DownloadDocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Files className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Dokumen tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan dokumen baru atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dokumen</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Unduhan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>
                <div className="min-w-72">
                  <p className="font-medium">{document.name}</p>

                  {document.description ? (
                    <p className="mt-1 line-clamp-2 max-w-xl text-sm text-muted-foreground">
                      {document.description}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs text-muted-foreground">
                    /dokumen/{document.slug}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                {document.category ? (
                  <Badge variant="outline">{document.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">Tanpa kategori</span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex min-w-56 items-start gap-2">
                  <File className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div>
                    <p className="break-all text-sm font-medium">
                      {document.fileName}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {document.fileType ?? "Tipe tidak tersedia"}
                      {" · "}
                      {formatFileSize(document.fileSizeBytes)}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Download className="size-4 text-muted-foreground" />
                  {document.downloadCount}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={document.isActive ? "default" : "secondary"}>
                  {document.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-2">
                  {document.isActive ? (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/api/dokumen/${encodeURIComponent(
                          document.slug,
                        )}/download`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="size-4" />
                        Unduh
                      </a>
                    </Button>
                  ) : null}

                  {canEdit ? (
                    <>
                      <DownloadDocumentFormDialog
                        document={document}
                        categoryOptions={categoryOptions}
                        fileTypeOptions={fileTypeOptions}
                      />

                      <DownloadDocumentDeleteDialog
                        documentId={document.id}
                        documentName={document.name}
                        fileName={document.fileName}
                      />
                    </>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
