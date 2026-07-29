import { CircleHelp, ListOrdered } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FaqDeleteDialog } from "./faq-delete-dialog";
import { FaqFormDialog, type EditableFaq } from "./faq-form-dialog";

type FaqTableProps = {
  faqs: EditableFaq[];
  categoryOptions: string[];
  canEdit: boolean;
};

export function FaqTable({ faqs, categoryOptions, canEdit }: FaqTableProps) {
  if (faqs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <CircleHelp className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">FAQ tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan FAQ baru atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pertanyaan</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Status</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {faqs.map((faq) => (
            <TableRow key={faq.id}>
              <TableCell>
                <div className="min-w-80">
                  <p className="font-medium">{faq.question}</p>

                  <p className="mt-1 line-clamp-3 max-w-2xl whitespace-pre-wrap text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                {faq.category ? (
                  <Badge variant="outline">{faq.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">Tanpa kategori</span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <ListOrdered className="size-4 text-muted-foreground" />
                  {faq.sortOrder}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={faq.isActive ? "default" : "secondary"}>
                  {faq.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <FaqFormDialog
                      faq={faq}
                      categoryOptions={categoryOptions}
                    />

                    <FaqDeleteDialog faqId={faq.id} question={faq.question} />
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
