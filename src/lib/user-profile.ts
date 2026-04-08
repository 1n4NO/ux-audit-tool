import { UserProfile } from "@/app/types/user";
import { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase/server";
import { getCurrentWorkspaceForUser } from "./workspaces";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_signed_in_at: string | null;
};

function getDisplayName(user: User) {
  const metadata = user.user_metadata;

  if (typeof metadata?.full_name === "string" && metadata.full_name.trim() !== "") {
    return metadata.full_name.trim();
  }

  if (typeof metadata?.name === "string" && metadata.name.trim() !== "") {
    return metadata.name.trim();
  }

  return null;
}

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastSignedInAt: row.last_signed_in_at,
  };
}

export async function syncUserProfile(user: User) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        display_name: getDisplayName(user),
        avatar_url:
          typeof user.user_metadata?.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : null,
        last_signed_in_at: user.last_sign_in_at ?? null,
      },
      { onConflict: "id" }
    )
    .select(
      "id, email, display_name, avatar_url, created_at, updated_at, last_signed_in_at"
    )
    .single();

  if (error || !data) {
    return null;
  }

  return mapProfileRow(data as ProfileRow);
}

export async function getCurrentUserContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
    };
  }

  const profile = await syncUserProfile(user);
  const workspace = await getCurrentWorkspaceForUser(user);

  return {
    user,
    profile,
    workspace,
  };
}
