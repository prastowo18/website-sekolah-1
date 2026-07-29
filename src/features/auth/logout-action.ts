"use server";

import { redirect } from "next/navigation";

import { deleteCurrentSession } from "@/lib/auth/session";

export async function logoutAction(): Promise<never> {
  await deleteCurrentSession();

  redirect("/konsol-8m4q7x2k9v6d/login");
}
