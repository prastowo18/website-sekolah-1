import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Eye,
  Mail,
  MailOpen,
  MessageSquare,
  Search,
  ShieldAlert,
  UserRoundCheck,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAdminContactAssignees,
  getAdminContactMessageCounts,
  getAdminContactMessages,
} from '@/features/contact-message/admin-queries';
import {
  CONTACT_MESSAGE_STATUS_LABELS,
  CONTACT_MESSAGE_STATUS_VALUES,
  type ContactMessageStatusValue,
} from '@/features/contact-message/constants';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  assignedTo?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeStatus(value: string): 'all' | ContactMessageStatusValue {
  return CONTACT_MESSAGE_STATUS_VALUES.includes(
    value as ContactMessageStatusValue,
  )
    ? (value as ContactMessageStatusValue)
    : 'all';
}

function formatDate(value: Date | null): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(value);
}

function buildHref({
  q,
  status,
  assignedTo,
  page,
}: {
  q: string;

  status: 'all' | ContactMessageStatusValue;

  assignedTo: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set('q', q);
  }

  if (status !== 'all') {
    parameters.set('status', status);
  }

  if (assignedTo !== 'all') {
    parameters.set('assignedTo', assignedTo);
  }

  if (page > 1) {
    parameters.set('page', String(page));
  }

  const query = parameters.toString();

  return query ? `/admin/pesan-kontak?${query}` : '/admin/pesan-kontak';
}

function StatusBadge({ status }: { status: ContactMessageStatusValue }) {
  const label = CONTACT_MESSAGE_STATUS_LABELS[status];

  if (status === 'SPAM') {
    return (
      <Badge variant="destructive">
        <ShieldAlert className="size-3.5" />
        {label}
      </Badge>
    );
  }

  if (status === 'NEW') {
    return (
      <Badge>
        <Mail className="size-3.5" />
        {label}
      </Badge>
    );
  }

  if (status === 'READ') {
    return (
      <Badge variant="secondary">
        <MailOpen className="size-3.5" />
        {label}
      </Badge>
    );
  }

  if (status === 'REPLIED') {
    return (
      <Badge variant="secondary">
        <UserRoundCheck className="size-3.5" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <CircleCheck className="size-3.5" />
      {label}
    </Badge>
  );
}

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedAssignedTo = firstValue(parameters.assignedTo)
    .trim()
    .slice(0, 100);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const [assignees, counts] = await Promise.all([
    getAdminContactAssignees(),
    getAdminContactMessageCounts(),
  ]);

  const validAssigneeIds = new Set(assignees.map((assignee) => assignee.id));

  const assignedTo =
    requestedAssignedTo === 'unassigned'
      ? 'unassigned'
      : validAssigneeIds.has(requestedAssignedTo)
        ? requestedAssignedTo
        : 'all';

  const result = await getAdminContactMessages({
    q,
    status,
    assignedTo,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  const statistics = [
    {
      label: 'Total',
      value: counts.total,
    },
    {
      label: 'Baru',
      value: counts.NEW,
    },
    {
      label: 'Dibaca',
      value: counts.READ,
    },
    {
      label: 'Dibalas',
      value: counts.REPLIED,
    },
    {
      label: 'Selesai',
      value: counts.CLOSED,
    },
    {
      label: 'Spam',
      value: counts.SPAM,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Pesan Kontak</h1>

        <p className="mt-2 text-muted-foreground">
          Lihat pesan yang dikirim melalui formulir kontak website sekolah.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statistics.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{item.label}</p>

              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-3 xl:grid-cols-[1fr_200px_260px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari nama, email, telepon, subjek, atau isi pesan..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>

                {CONTACT_MESSAGE_STATUS_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {CONTACT_MESSAGE_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="assignedTo" defaultValue={assignedTo}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua penanggung jawab</SelectItem>

                <SelectItem value="unassigned">Belum ditugaskan</SelectItem>

                {assignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Filter
            </Button>

            <Button variant="outline" asChild>
              <Link href="/admin/pesan-kontak">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      {result.messages.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <MessageSquare className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Pesan tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada pesan yang sesuai dengan filter tersebut.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {result.messages.map((message) => (
            <Card
              key={message.id}
              className={
                message.status === 'NEW' ? 'border-primary/40' : undefined
              }
            >
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={message.status} />

                      {message.sourcePage ? (
                        <Badge variant="outline">{message.sourcePage}</Badge>
                      ) : null}
                    </div>

                    <CardTitle className="mt-4 break-words text-xl">
                      {message.subject || 'Tanpa subjek'}
                    </CardTitle>

                    <p className="mt-2 font-medium">{message.name}</p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {message.email ? (
                        <a
                          href={`mailto:${message.email}`}
                          className="break-all hover:text-primary"
                        >
                          {message.email}
                        </a>
                      ) : null}

                      {message.phone ? (
                        <a
                          href={`tel:${message.phone}`}
                          className="hover:text-primary"
                        >
                          {message.phone}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 text-sm text-muted-foreground sm:text-right">
                    <p>Diterima {formatDate(message.createdAt)}</p>

                    <p className="mt-1">
                      Penanggung jawab:{' '}
                      {message.assignedTo?.name ?? 'Belum ditugaskan'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <details
                  open={message.status === 'NEW'}
                  className="rounded-lg border"
                >
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                    Lihat isi pesan
                  </summary>

                  <div className="border-t px-4 py-4">
                    <p className="whitespace-pre-wrap wrap-break-word leading-7 text-muted-foreground">
                      {message.message}
                    </p>
                  </div>
                </details>

                <div className="flex justify-end">
                  <Button
                    variant="outline"

                    size="sm"

                    asChild
                  >
                    <Link href={`/admin/pesan-kontak/${message.id}`}>
                      <Eye className="size-4" />
                      Lihat detail
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  <p>Dibaca: {formatDate(message.readAt)}</p>

                  <p>Dibalas: {formatDate(message.repliedAt)}</p>

                  <p>Diperbarui: {formatDate(message.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {result.total} pesan.
        </p>

        <div className="flex items-center gap-2">
          {result.currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  status,
                  assignedTo,
                  page: result.currentPage - 1,
                })}
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="size-4" />
              Sebelumnya
            </Button>
          )}

          <span className="min-w-24 text-center">
            Halaman {result.currentPage} dari {result.totalPages}
          </span>

          {result.currentPage < result.totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  status,
                  assignedTo,
                  page: result.currentPage + 1,
                })}
              >
                Berikutnya
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Berikutnya
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
