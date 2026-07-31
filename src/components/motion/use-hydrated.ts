"use client";

import { useSyncExternalStore } from "react";

function emptySubscribe(): () => void {
  return () => undefined;
}

/**
 * Bernilai false ketika render server dan berubah menjadi true
 * setelah halaman aktif pada browser.
 *
 * Pola ini menghindari setState di dalam useEffect dan menjaga
 * konten tetap terlihat pada HTML hasil render server.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
