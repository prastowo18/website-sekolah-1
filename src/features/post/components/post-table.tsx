import {
  CalendarClock,
  Eye,
  Image as ImageIcon,
  ImageOff,
  Newspaper,
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
import {
  postStatusLabels,
  type PostStatusValue,
} from "@/features/post/constants";

import { PostDeleteDialog } from "./post-delete-dialog";
import { PostFormDialog, type EditablePost } from "./post-form-dialog";
import type { PostCategoryOption } from "./post-form-fields";

export type PostListItem = EditablePost & {
  categoryName: string | null;
};

type PostTableProps = {
  posts: PostListItem[];
  categories: PostCategoryOption[];
  canEdit: boolean;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function getStatusVariant(
  status: PostStatusValue,
): "default" | "secondary" | "outline" {
  if (status === "PUBLISHED") {
    return "default";
  }

  if (status === "SCHEDULED") {
    return "outline";
  }

  return "secondary";
}

export function PostTable({ posts, categories, canEdit }: PostTableProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Newspaper className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Berita tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan berita atau ubah pencarian dan filter yang digunakan.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Berita</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Tayangan</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <div className="flex min-w-80 items-start gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md border bg-muted">
                    {post.featuredImageUrl ? (
                      <ImageIcon className="size-5 text-muted-foreground" />
                    ) : (
                      <ImageOff className="size-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">{post.title}</p>

                    {post.excerpt ? (
                      <p className="mt-1 line-clamp-2 max-w-lg text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}

                    <p className="mt-2 text-xs text-muted-foreground">
                      /berita/{post.slug}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {post.categoryName ? (
                  <Badge variant="outline">{post.categoryName}</Badge>
                ) : (
                  <span className="text-muted-foreground">Tanpa kategori</span>
                )}
              </TableCell>

              <TableCell>
                <Badge variant={getStatusVariant(post.status)}>
                  {postStatusLabels[post.status]}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="min-w-44 text-sm">
                  {post.status === "SCHEDULED" ? (
                    <div className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-muted-foreground" />
                      {formatDateTime(post.scheduledAt)}
                    </div>
                  ) : post.publishedAt ? (
                    formatDateTime(post.publishedAt)
                  ) : (
                    <span className="text-muted-foreground">
                      Belum diterbitkan
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  {post.viewCount}
                </div>
              </TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PostFormDialog post={post} categories={categories} />

                    <PostDeleteDialog postId={post.id} postTitle={post.title} />
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
