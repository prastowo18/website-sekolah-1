import { ExternalLink, ListOrdered, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSocialLinkPlatformLabel } from "@/features/social-link/constants";
import { getSafePublicUrl } from "@/lib/public-links";

import { SocialLinkDeleteDialog } from "./social-link-delete-dialog";
import {
  SocialLinkFormDialog,
  type EditableSocialLink,
} from "./social-link-form-dialog";

type SocialLinkTableProps = {
  socialLinks: EditableSocialLink[];
  canEdit: boolean;
};

export function SocialLinkTable({
  socialLinks,
  canEdit,
}: SocialLinkTableProps) {
  if (socialLinks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Share2 className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">Media sosial tidak ditemukan</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan kanal resmi baru atau ubah pencarian dan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Status</TableHead>

            {canEdit ? (
              <TableHead className="text-right">Tindakan</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {socialLinks.map((socialLink) => {
            const safeUrl = getSafePublicUrl(socialLink.url);

            const displayName =
              socialLink.label ||
              getSocialLinkPlatformLabel(socialLink.platform);

            return (
              <TableRow key={socialLink.id}>
                <TableCell>
                  <div className="min-w-44">
                    <p className="font-medium">{displayName}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {socialLink.platform}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="max-w-md">
                    {safeUrl ? (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <span className="truncate">{socialLink.url}</span>

                        <ExternalLink className="size-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-destructive">
                        URL tidak valid
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <ListOrdered className="size-4 text-muted-foreground" />
                    {socialLink.sortOrder}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={socialLink.isActive ? "default" : "secondary"}
                  >
                    {socialLink.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>

                {canEdit ? (
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <SocialLinkFormDialog socialLink={socialLink} />

                      <SocialLinkDeleteDialog
                        socialLinkId={socialLink.id}
                        displayName={displayName}
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
