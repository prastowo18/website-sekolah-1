"use client";

import { useEffect } from "react";

type PostViewTrackerProps = {
  slug: string;
};

export function PostViewTracker({ slug }: PostViewTrackerProps) {
  useEffect(() => {
    const storageKey = `school-post-view:${slug}`;

    try {
      if (window.sessionStorage.getItem(storageKey)) {
        return;
      }

      window.sessionStorage.setItem(storageKey, "pending");
    } catch {
      return;
    }

    void fetch(`/api/berita/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) {
          try {
            window.sessionStorage.removeItem(storageKey);
          } catch {
            return;
          }

          return;
        }

        try {
          window.sessionStorage.setItem(storageKey, "counted");
        } catch {
          return;
        }
      })
      .catch(() => {
        try {
          window.sessionStorage.removeItem(storageKey);
        } catch {
          return;
        }
      });
  }, [slug]);

  return null;
}
