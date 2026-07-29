import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarClock,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminContactAssignees } from "@/features/contact-message/admin-queries";
import { getAdminContactMessageById } from "@/features/contact-message/admin-detail-queries";

import { CONTACT_MESSAGE_STATUS_LABELS } from "@/features/contact-message/constants";

import { toPhoneHref } from "@/lib/public-links";
import { requireAdminSession } from "@/lib/auth/require-session";
import { ContactMessageManageForm } from "@/features/contact-message/components/contact-message-manage-form";

export const metadata: Metadata = {
  title: "Detail Pesan Kontak | Panel Admin",
  description: "Lihat dan kelola detail pesan kontak website sekolah.",
};

export const dynamic = "force-dynamic";

type PageParams = {
  messageId: string;
};

function formatDate(value: Date | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export default async function ContactMessageDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const session = await requireAdminSession();

  const { messageId } = await params;

  const [message, assignees] = await Promise.all([
    getAdminContactMessageById(messageId),

    getAdminContactAssignees(),
  ]);

  if (!message) {
    notFound();
  }

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const phoneHref = message.phone ? toPhoneHref(message.phone) : null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/admin/pesan-kontak">
          <ArrowLeft className="size-4" />
          Kembali ke pesan kontak
        </Link>
      </Button>

      <header>
        <p className="text-sm font-medium text-primary">
          {CONTACT_MESSAGE_STATUS_LABELS[message.status]}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {message.subject || "Tanpa subjek"}
        </h1>

        <p className="mt-2 text-muted-foreground">Pesan dari {message.name}</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                Isi Pesan
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-wrap wrap-break-word leading-8">
                {message.message}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengirim</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-5 text-primary" />

                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>

                  <p className="mt-1 font-medium">{message.name}</p>
                </div>
              </div>

              {message.email ? (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 text-primary" />

                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Email</p>

                    <a
                      href={`mailto:${message.email}`}
                      className="mt-1 block break-all font-medium hover:text-primary"
                    >
                      {message.email}
                    </a>
                  </div>
                </div>
              ) : null}

              {message.phone && phoneHref ? (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-5 text-primary" />

                  <div>
                    <p className="text-sm text-muted-foreground">Telepon</p>

                    <a
                      href={phoneHref}
                      className="mt-1 block font-medium hover:text-primary"
                    >
                      {message.phone}
                    </a>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-5 text-primary" />

                <div>
                  <p className="text-sm text-muted-foreground">Diterima</p>

                  <p className="mt-1 font-medium">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penanganan</CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Penanggung jawab
                  </dt>

                  <dd className="mt-1 font-medium">
                    {message.assignedTo?.name ?? "Belum ditugaskan"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Dibaca</dt>

                  <dd className="mt-1 font-medium">
                    {formatDate(message.readAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Dibalas</dt>

                  <dd className="mt-1 font-medium">
                    {formatDate(message.repliedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Kelola Pesan</CardTitle>
            </CardHeader>

            <CardContent>
              {canEdit ? (
                <ContactMessageManageForm
                  messageId={message.id}
                  status={message.status}
                  assignedToId={message.assignedToId}
                  assignees={assignees}
                />
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Akun Anda hanya dapat melihat pesan ini.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
