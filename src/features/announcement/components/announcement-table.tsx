import { CalendarClock, ExternalLink, Megaphone, Pin } from "lucide-react";

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
  announcementPriorityLabels,
  type AnnouncementPriorityValue,
} from "@/features/announcement/constants";

import { AnnouncementDeleteDialog } from "./announcement-delete-dialog";
import {
  AnnouncementFormDialog,
  type EditableAnnouncement,
} from "./announcement-form-dialog";

type AnnouncementTableProps = {
  announcements: EditableAnnouncement[];
  canEdit: boolean;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Tidak dibatasi";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function getPriorityVariant(
  priority: AnnouncementPriorityValue,
): "default" | "secondary" | "destructive" | "outline" {
  if (priority === "URGENT") {
    return "destructive";
  }

  if (priority === "IMPORTANT") {
    return "default";
  }

  return "secondary";
}

function getDisplayStatus(announcement: EditableAnnouncement): {
  label: string;
  variant: "default" | "secondary" | "outline";
} {
  if (!announcement.isActive) {
    return {
      label: "Nonaktif",
      variant: "secondary",
    };
  }

  const now = Date.now();

  if (
    announcement.startDate &&
    new Date(announcement.startDate).getTime() > now
  ) {
    return {
      label: "Akan Tayang",
      variant: "outline",
    };
  }

  if (announcement.endDate && new Date(announcement.endDate).getTime() < now) {
    return {
      label: "Berakhir",
      variant: "secondary",
    };
  }

  return {
    label: "Sedang Tayang",
    variant: "default",
  };
}

export function AnnouncementTable({
  announcements,
  canEdit,
}: AnnouncementTableProps) {
  if (announcements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Megaphone className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Pengumuman tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan pengumuman atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengumuman</TableHead>
            <TableHead>Prioritas</TableHead>
            <TableHead>Periode Tayang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lampiran</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {announcements.map((announcement) => {
            const displayStatus = getDisplayStatus(announcement);

            return (
              <TableRow key={announcement.id}>
                <TableCell>
                  <div className="min-w-72">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{announcement.title}</p>

                      {announcement.isPinned ? (
                        <Badge variant="outline">
                          <Pin className="size-3" />
                          Disematkan
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-1 line-clamp-2 max-w-xl whitespace-pre-wrap text-sm text-muted-foreground">
                      {announcement.content}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      /pengumuman/
                      {announcement.slug}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={getPriorityVariant(announcement.priority)}>
                    {announcementPriorityLabels[announcement.priority]}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="min-w-52 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-muted-foreground" />

                      <span>
                        Mulai: {formatDateTime(announcement.startDate)}
                      </span>
                    </div>

                    <p className="pl-6 text-muted-foreground">
                      Selesai: {formatDateTime(announcement.endDate)}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={displayStatus.variant}>
                    {displayStatus.label}
                  </Badge>
                </TableCell>

                <TableCell>
                  {announcement.attachmentUrl ? (
                    <a
                      href={announcement.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Buka
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {canEdit ? (
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <AnnouncementFormDialog announcement={announcement} />

                      <AnnouncementDeleteDialog
                        announcementId={announcement.id}
                        announcementTitle={announcement.title}
                      />
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
