import { FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PostCategoryDeleteDialog } from "./post-category-delete-dialog";
import {
  PostCategoryFormDialog,
  type EditablePostCategory,
} from "./post-category-form-dialog";

export type PostCategoryListItem = EditablePostCategory & {
  postCount: number;
};

type PostCategoryTableProps = {
  categories: PostCategoryListItem[];
  canEdit: boolean;
};

export function PostCategoryTable({
  categories,
  canEdit,
}: PostCategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <FolderOpen className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Kategori berita tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan kategori baru atau ubah kata pencarian.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Jumlah Berita</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="min-w-52">
                  <p className="font-medium">{category.name}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    /berita/kategori/
                    {category.slug}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <p className="max-w-lg whitespace-pre-wrap text-sm text-muted-foreground">
                  {category.description ?? "—"}
                </p>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">{category.postCount} berita</Badge>
              </TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PostCategoryFormDialog category={category} />

                    <PostCategoryDeleteDialog
                      categoryId={category.id}
                      categoryName={category.name}
                      postCount={category.postCount}
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
