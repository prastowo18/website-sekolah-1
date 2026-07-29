import { ArrowRight, Inbox, Mail } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getContactMessageDashboardSummary } from "../admin-dashboard-queries";
import { CONTACT_MESSAGE_STATUS_LABELS } from "../constants";

function formatMessageDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export async function ContactMessageDashboardCard() {
  const summary = await getContactMessageDashboardSummary();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="size-5 text-primary" />
            Pesan Masuk
          </CardTitle>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ringkasan pesan yang dikirim melalui halaman kontak.
          </p>
        </div>

        {summary.newMessages > 0 ? (
          <Badge>{summary.newMessages} baru</Badge>
        ) : (
          <Badge variant="secondary">Tidak ada pesan baru</Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Total</p>

            <p className="mt-1 text-2xl font-bold">{summary.total}</p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Baru</p>

            <p className="mt-1 text-2xl font-bold">{summary.newMessages}</p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Dibalas</p>

            <p className="mt-1 text-2xl font-bold">{summary.repliedMessages}</p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Selesai</p>

            <p className="mt-1 text-2xl font-bold">{summary.closedMessages}</p>
          </div>
        </div>

        {summary.recentMessages.length > 0 ? (
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="font-medium">Pesan terbaru</p>

              <p className="text-xs text-muted-foreground">Maksimal 5 pesan</p>
            </div>

            <div className="divide-y rounded-lg border">
              {summary.recentMessages.map((message) => (
                <Link
                  key={message.id}
                  href={`/konsol-8m4q7x2k9v6d/pesan-kontak/${message.id}`}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{message.name}</p>

                      <Badge
                        variant={
                          message.status === "NEW" ? "default" : "secondary"
                        }
                      >
                        {CONTACT_MESSAGE_STATUS_LABELS[message.status]}
                      </Badge>
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {message.subject || "Tanpa subjek"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatMessageDate(message.createdAt)}
                    </p>
                  </div>

                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed px-4 py-10 text-center">
            <Mail className="mx-auto size-9 text-muted-foreground" />

            <p className="mt-3 font-medium">Belum ada pesan</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Pesan dari halaman kontak akan tampil di bagian ini.
            </p>
          </div>
        )}

        <Button variant="outline" asChild>
          <Link href="/konsol-8m4q7x2k9v6d/pesan-kontak">
            Kelola semua pesan
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
