"use server";

import { signOut } from "@/lib/auth";

export async function salir() {
  await signOut({ redirectTo: "/" });
}
