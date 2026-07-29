export type AdminRole = "SUPER_ADMIN" | "CONTENT_ADMIN" | "VIEWER";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_ADMIN: "Admin Konten",
  VIEWER: "Viewer",
};
