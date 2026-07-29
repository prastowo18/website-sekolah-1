"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

import { postFormSchema, postIdSchema, type PostFormInput } from "./schemas";
import type { PostActionState, PostFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImageUrl: true,
  status: true,
  publishedAt: true,
  scheduledAt: true,
  authorId: true,
  categoryId: true,
  viewCount: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImageUrl: string | null;
  status: string;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  authorId: string | null;
  categoryId: string | null;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function getFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    featuredImageUrl: formData.get("featuredImageUrl") ?? "",
    status: formData.get("status"),
    scheduledAt: formData.get("scheduledAt") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  };
}

function validationErrorState(error: z.ZodError): PostActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data berita.",
    fieldErrors: errors as Partial<Record<PostFieldName, string[]>>,
  };
}

function invalidSlugState(): PostActionState {
  return {
    status: "error",
    message: "Slug berita tidak valid.",
    fieldErrors: {
      slug: ["Gunakan judul atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueSlugState(): PostActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh berita lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
  };
}

function invalidCategoryState(): PostActionState {
  return {
    status: "error",
    message: "Kategori berita tidak ditemukan.",
    fieldErrors: {
      categoryId: ["Pilih kategori yang masih tersedia."],
    },
  };
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function toAuditValue(post: PostRecord) {
  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

function resolvePublicationDates({
  status,
  scheduledAt,
  currentPublishedAt = null,
}: {
  status: PostFormInput["status"];
  scheduledAt: Date | null;
  currentPublishedAt?: Date | null;
}) {
  if (status === "SCHEDULED") {
    return {
      publishedAt: null,
      scheduledAt,
    };
  }

  if (status === "PUBLISHED") {
    return {
      publishedAt: currentPublishedAt ?? new Date(),
      scheduledAt: null,
    };
  }

  if (status === "ARCHIVED") {
    return {
      publishedAt: currentPublishedAt,
      scheduledAt: null,
    };
  }

  return {
    publishedAt: null,
    scheduledAt: null,
  };
}

async function categoryExists(categoryId: string | null): Promise<boolean> {
  if (!categoryId) {
    return true;
  }

  const category = await prisma.postCategory.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  return category !== null;
}

function revalidatePostPaths(slugs: Array<string | null | undefined>): void {
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/konsol-8m4q7x2k9v6d/berita");
  revalidatePath("/konsol-8m4q7x2k9v6d/kategori-berita");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/berita/${slug}`);
    }
  }
}

export async function createPostAction(
  _previousState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = postFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  try {
    if (!(await categoryExists(parsed.data.categoryId))) {
      return invalidCategoryState();
    }

    const publicationDates = resolvePublicationDates({
      status: parsed.data.status,
      scheduledAt: parsed.data.scheduledAt,
    });

    const createdPost = await prisma.$transaction(async (transaction) => {
      const post = await transaction.post.create({
        data: {
          title: parsed.data.title,
          slug,
          excerpt: parsed.data.excerpt,
          content: parsed.data.content,
          featuredImageUrl: parsed.data.featuredImageUrl,
          status: parsed.data.status,
          publishedAt: publicationDates.publishedAt,
          scheduledAt: publicationDates.scheduledAt,
          authorId: session.user.id,
          categoryId: parsed.data.categoryId,
          seoTitle: parsed.data.seoTitle,
          seoDescription: parsed.data.seoDescription,
        },
        select: postSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "POST_CREATED",
          entity: "Post",
          entityId: post.id,
          newValue: toAuditValue(post),
        },
      });

      return post;
    });

    revalidatePostPaths([createdPost.slug]);

    const messageByStatus: Record<PostFormInput["status"], string> = {
      DRAFT: "Berita berhasil disimpan sebagai draft.",
      SCHEDULED: "Berita berhasil dijadwalkan.",
      PUBLISHED: "Berita berhasil diterbitkan.",
      ARCHIVED: "Berita berhasil disimpan sebagai arsip.",
    };

    return {
      status: "success",
      message: messageByStatus[parsed.data.status],
      postId: createdPost.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan berita.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    if (hasPrismaErrorCode(error, "P2003")) {
      return invalidCategoryState();
    }

    return {
      status: "error",
      message: "Berita gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updatePostAction(
  _previousState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = postIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID berita tidak valid.",
    };
  }

  const parsed = postFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  try {
    const currentPost = await prisma.post.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: postSelect,
    });

    if (!currentPost) {
      return {
        status: "error",
        message: "Berita tidak ditemukan.",
      };
    }

    if (!(await categoryExists(parsed.data.categoryId))) {
      return invalidCategoryState();
    }

    const publicationDates = resolvePublicationDates({
      status: parsed.data.status,
      scheduledAt: parsed.data.scheduledAt,
      currentPublishedAt: currentPost.publishedAt,
    });

    const updatedPost = await prisma.$transaction(async (transaction) => {
      const post = await transaction.post.update({
        where: {
          id: currentPost.id,
        },
        data: {
          title: parsed.data.title,
          slug,
          excerpt: parsed.data.excerpt,
          content: parsed.data.content,
          featuredImageUrl: parsed.data.featuredImageUrl,
          status: parsed.data.status,
          publishedAt: publicationDates.publishedAt,
          scheduledAt: publicationDates.scheduledAt,
          categoryId: parsed.data.categoryId,
          seoTitle: parsed.data.seoTitle,
          seoDescription: parsed.data.seoDescription,
        },
        select: postSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "POST_UPDATED",
          entity: "Post",
          entityId: currentPost.id,
          oldValue: toAuditValue(currentPost),
          newValue: toAuditValue(post),
        },
      });

      return post;
    });

    revalidatePostPaths([currentPost.slug, updatedPost.slug]);

    return {
      status: "success",
      message:
        parsed.data.status === "PUBLISHED"
          ? "Berita berhasil diperbarui dan diterbitkan."
          : parsed.data.status === "SCHEDULED"
            ? "Berita berhasil diperbarui dan dijadwalkan."
            : parsed.data.status === "ARCHIVED"
              ? "Berita berhasil diperbarui dan diarsipkan."
              : "Draft berita berhasil diperbarui.",
      postId: updatedPost.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui berita.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    if (hasPrismaErrorCode(error, "P2003")) {
      return invalidCategoryState();
    }

    return {
      status: "error",
      message: "Berita gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deletePostAction(
  _previousState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = postIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID berita tidak valid.",
    };
  }

  try {
    const currentPost = await prisma.post.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: postSelect,
    });

    if (!currentPost) {
      return {
        status: "error",
        message: "Berita tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.post.delete({
        where: {
          id: currentPost.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "POST_DELETED",
          entity: "Post",
          entityId: currentPost.id,
          oldValue: toAuditValue(currentPost),
        },
      });
    });

    revalidatePostPaths([currentPost.slug]);

    return {
      status: "success",
      message: "Berita berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus berita.", error);

    return {
      status: "error",
      message: "Berita gagal dihapus. Silakan coba kembali.",
    };
  }
}
