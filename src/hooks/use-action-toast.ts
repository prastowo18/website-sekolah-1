"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionToastState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export function useActionToast(
  state: ActionToastState,
): void {
  const previousState =
    useRef<ActionToastState | null>(null);

  useEffect(() => {
    if (previousState.current === state) {
      return;
    }

    previousState.current = state;

    if (
      state.status === "idle" ||
      !state.message
    ) {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state]);
}
