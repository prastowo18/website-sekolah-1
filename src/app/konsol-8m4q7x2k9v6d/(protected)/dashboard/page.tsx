import type { Metadata } from "next";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Images,
  Mail,
  Megaphone,
  Newspaper,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactMessageDashboardCard } from "@/features/contact-message/components/contact-message-dashboard-card";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard | Panel Administrasi",
  description: "Ringkasan pengelolaan website sekolah.",
};

const ppdbStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  COMING_SOON: "Segera Dibuka",
  OPEN: "Dibuka",
  CLOSED: "Ditutup",
  ANNOUNCEMENT: "Pengumuman",
  COMPLETED: "Selesai",
};

const actionLabels: Record<string, string> = {
  PASSWORD_CHANGED: "Mengubah password",

  USER_CREATED: "Membuat pengguna",

  USER_UPDATED: "Memperbarui pengguna",

  POST_CREATED: "Membuat berita",

  POST_UPDATED: "Memperbarui berita",

  POST_PUBLISHED: "Menerbitkan berita",

  CONTACT_MESSAGE_READ: "Membaca pesan kontak",

  CONTACT_MESSAGE_UPDATED: "Memperbarui pesan kontak",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function DashboardPage() {
  await requireAdminSession();

  const [
    postCount,
    activeAnnouncementCount,
    programCount,
    facilityCount,
    teacherCount,
    newMessageCount,
    publishedGalleryCount,
    activePpdb,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.post.count(),

    prisma.announcement.count({
      where: {
        isActive: true,
      },
    }),

    prisma.program.count({
      where: {
        isActive: true,
      },
    }),

    prisma.facility.count({
      where: {
        isActive: true,
      },
    }),

    prisma.teacher.count({
      where: {
        isActive: true,
      },
    }),

    prisma.contactMessage.count({
      where: {
        status: "NEW",
      },
    }),

    prisma.galleryAlbum.count({
      where: {
        isPublished: true,
      },
    }),

    prisma.ppdbInformation.findFirst({
      where: {
        isActive: true,
      },

      select: {
        academicYear: true,
        status: true,
        title: true,
      },
    }),

    prisma.auditLog.findMany({
      take: 5,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        action: true,
        entity: true,
        createdAt: true,

        actor: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const statistics = [
    {
      title: "Berita",
      value: postCount,
      description: "Seluruh berita",
      icon: Newspaper,
    },
    {
      title: "Pengumuman",
      value: activeAnnouncementCount,
      description: "Sedang aktif",
      icon: Megaphone,
    },
    {
      title: "Program",
      value: programCount,
      description: "Program aktif",
      icon: BookOpen,
    },
    {
      title: "Fasilitas",
      value: facilityCount,
      description: "Fasilitas aktif",
      icon: Building2,
    },
    {
      title: "Guru",
      value: teacherCount,
      description: "Guru aktif",
      icon: Users,
    },
    {
      title: "Pesan Baru",
      value: newMessageCount,
      description: "Belum dibaca",
      icon: Mail,
    },
    {
      title: "Galeri",
      value: publishedGalleryCount,
      description: "Album terbit",
      icon: Images,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan konten dan aktivitas website sekolah.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <Card key={statistic.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {statistic.title}
                </CardTitle>

                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">{statistic.value}</div>

                <p className="text-xs text-muted-foreground">
                  {statistic.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ContactMessageDashboardCard />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Informasi PPDB</CardTitle>

                <CardDescription>
                  Periode informasi PPDB yang sedang aktif.
                </CardDescription>
              </div>

              <GraduationCap className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            {activePpdb ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>
                    {ppdbStatusLabels[activePpdb.status] ?? activePpdb.status}
                  </Badge>

                  <Badge variant="outline">{activePpdb.academicYear}</Badge>
                </div>

                <p className="font-medium">{activePpdb.title}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm font-medium">
                  Belum ada periode PPDB aktif
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Informasi PPDB dapat dibuat melalui menu Informasi PPDB.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>

            <CardDescription>
              Lima aktivitas administrasi terakhir.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {recentAuditLogs.length > 0 ? (
              <div className="space-y-4">
                {recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {actionLabels[log.action] ?? log.action}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {log.actor?.name ?? "Sistem"} · {log.entity}
                      </p>
                    </div>

                    <time className="shrink-0 text-right text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada aktivitas yang tercatat.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
