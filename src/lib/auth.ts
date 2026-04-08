import { redirect } from "next/navigation";
import { getCurrentUserContext } from "./user-profile";

export async function requireUser(redirectTo = "/login") {
  const context = await getCurrentUserContext();

  if (!context.user) {
    redirect(redirectTo);
  }

  return context;
}
