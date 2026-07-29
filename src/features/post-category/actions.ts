"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

import {
  postCategoryFormSchema,
  postCategoryIdSchema,
} from "./schemas";
import type {
  PostCategoryActionState,
  PostCategoryFieldName,
} from "./types";

const editableRoles = [
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
] as const;

const postCategorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
} as const;

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description:
      formData.get("description") ?? "",
  };
}

function validationErrorState(
  error: z.ZodError,
): PostCategoryActionState {
  const errors =
    z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message:
      "Periksa kembali data kategori berita.",
    fieldErrors:
      errors as Partial<
        Record<PostCategoryFieldName, string[]>
      >,
  };
}

function invalidSlugState(): PostCategoryActionState {
  return {
    status: "error",
    message:
      "Slug kategori berita tidak valid.",
    fieldErrors: {
      slug: [
        "Gunakan nama atau slug yang mengandung huruf atau angka.",
      ],
    },
  };
}

function uniqueSlugState(): PostCategoryActionState {
  return {
    status: "error",
    message:
      "Slug sudah digunakan oleh kategori lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
  };
}

function isUniqueConstraintError(
  error: unknown,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function revalidatePostCategoryPaths(): void {
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/berita");
  revalidatePath("/admin/kategori-berita");
}

export async function createPostCategoryAction(
  _previousState: PostCategoryActionState,
  formData: FormData,
): Promise<PostCategoryActionState> {
  const session = await requireAdminRole(
    editableRoles,
  );

  const parsed =
    postCategoryFormSchema.safeParse(
      getFormValues(formData),
    );

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(
    parsed.data.slug || parsed.data.name,
  );

  if (!slug) {
    return invalidSlugState();
  }

  try {
    const createdCategory =
      await prisma.$transaction(
        async (transaction) => {
          const category =
            await transaction.postCategory.create({
              data: {
                name: parsed.data.name,
                slug,
                description:
                  parsed.data.description,
              },
              select: postCategorySelect,
            });

          await transaction.auditLog.create({
            data: {
              actorId: session.user.id,
              action:
                "POST_CATEGORY_CREATED",
              entity: "PostCategory",
              entityId: category.id,
              newValue: category,
            },
          });

          return category;
        },
      );

    revalidatePostCategoryPaths();

    return {
      status: "success",
      message:
        "Kategori berita berhasil ditambahkan.",
      categoryId: createdCategory.id,
    };
  } catch (error: unknown) {
    console.error(
      "Gagal menambahkan kategori berita.",
      error,
    );

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message:
        "Kategori berita gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updatePostCategoryAction(
  _previousState: PostCategoryActionState,
  formData: FormData,
): Promise<PostCategoryActionState> {
  const session = await requireAdminRole(
    editableRoles,
  );

  const idParsed =
    postCategoryIdSchema.safeParse({
      id: formData.get("id"),
    });

  if (!idParsed.success) {
    return {
      status: "error",
      message:
        "ID kategori berita tidak valid.",
    };
  }

  const parsed =
    postCategoryFormSchema.safeParse(
      getFormValues(formData),
    );

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(
    parsed.data.slug || parsed.data.name,
  );

  if (!slug) {
    return invalidSlugState();
  }

  try {
    const currentCategory =
      await prisma.postCategory.findUnique({
        where: {
          id: idParsed.data.id,
        },
        select: postCategorySelect,
      });

    if (!currentCategory) {
      return {
        status: "error",
        message:
          "Kategori berita tidak ditemukan.",
      };
    }

    await prisma.$transaction(
      async (transaction) => {
        const updatedCategory =
          await transaction.postCategory.update({
            where: {
              id: currentCategory.id,
            },
            data: {
              name: parsed.data.name,
              slug,
              description:
                parsed.data.description,
            },
            select: postCategorySelect,
          });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action:
              "POST_CATEGORY_UPDATED",
            entity: "PostCategory",
            entityId: currentCategory.id,
            oldValue: currentCategory,
            newValue: updatedCategory,
          },
        });
      },
    );

    revalidatePostCategoryPaths();

    return {
      status: "success",
      message:
        "Kategori berita berhasil diperbarui.",
      categoryId: currentCategory.id,
    };
  } catch (error: unknown) {
    console.error(
      "Gagal memperbarui kategori berita.",
      error,
    );

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message:
        "Kategori berita gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deletePostCategoryAction(
  _previousState: PostCategoryActionState,
  formData: FormData,
): Promise<PostCategoryActionState> {
  const session = await requireAdminRole(
    editableRoles,
  );

  const parsed =
    postCategoryIdSchema.safeParse({
      id: formData.get("id"),
    });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "ID kategori berita tidak valid.",
    };
  }

  try {
    const currentCategory =
      await prisma.postCategory.findUnique({
        where: {
          id: parsed.data.id,
        },
        select: {
          ...postCategorySelect,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

    if (!currentCategory) {
      return {
        status: "error",
        message:
          "Kategori berita tidak ditemukan.",
      };
    }

    await prisma.$transaction(
      async (transaction) => {
        /*
         * Relasi Post.category memakai onDelete: SetNull.
         * Berita tetap tersimpan, tetapi menjadi tanpa kategori.
         */
        await transaction.postCategory.delete({
          where: {
            id: currentCategory.id,
          },
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action:
              "POST_CATEGORY_DELETED",
            entity: "PostCategory",
            entityId: currentCategory.id,
            oldValue: {
              id: currentCategory.id,
              name: currentCategory.name,
              slug: currentCategory.slug,
              description:
                currentCategory.description,
              affectedPostCount:
                currentCategory._count.posts,
            },
          },
        });
      },
    );

    revalidatePostCategoryPaths();

    const affectedPostCount =
      currentCategory._count.posts;

    return {
      status: "success",
      message:
        affectedPostCount > 0
          ? `Kategori berhasil dihapus. ${affectedPostCount} berita sekarang tidak memiliki kategori.`
          : "Kategori berita berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error(
      "Gagal menghapus kategori berita.",
      error,
    );

    return {
      status: "error",
      message:
        "Kategori berita gagal dihapus. Silakan coba kembali.",
    };
  }
}
