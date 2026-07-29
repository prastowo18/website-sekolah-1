import { ImageOff, Trophy } from "lucide-react";

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
  achievementTypeLabels,
  competitionLevelLabels,
} from "@/features/achievement/constants";

import { AchievementDeleteDialog } from "./achievement-delete-dialog";
import {
  AchievementFormDialog,
  type EditableAchievement,
} from "./achievement-form-dialog";

export type AchievementListItem = EditableAchievement;

type AchievementTableProps = {
  achievements: AchievementListItem[];
  canEdit: boolean;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function AchievementTable({
  achievements,
  canEdit,
}: AchievementTableProps) {
  if (achievements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Trophy className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Prestasi tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan prestasi baru atau ubah pencarian dan filter yang digunakan.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prestasi</TableHead>
            <TableHead>Penerima</TableHead>
            <TableHead>Tingkat</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {achievements.map((achievement) => (
            <TableRow key={achievement.id}>
              <TableCell>
                <div className="flex min-w-72 items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <ImageOff className="size-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">{achievement.title}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {achievementTypeLabels[achievement.achievementType]}
                      </Badge>

                      {achievement.category ? (
                        <Badge variant="secondary">
                          {achievement.category}
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      /prestasi/
                      {achievement.slug}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="min-w-36">
                  <p>{achievement.winnerName ?? "—"}</p>

                  {achievement.rank ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {achievement.rank}
                    </p>
                  ) : null}
                </div>
              </TableCell>

              <TableCell>
                {achievement.competitionLevel
                  ? competitionLevelLabels[achievement.competitionLevel]
                  : "—"}
              </TableCell>

              <TableCell>{formatDate(achievement.achievementDate)}</TableCell>

              <TableCell>
                <Badge
                  variant={achievement.isPublished ? "default" : "secondary"}
                >
                  {achievement.isPublished ? "Terbit" : "Draft"}
                </Badge>
              </TableCell>

              {canEdit ? (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <AchievementFormDialog achievement={achievement} />

                    <AchievementDeleteDialog
                      achievementId={achievement.id}
                      achievementTitle={achievement.title}
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
