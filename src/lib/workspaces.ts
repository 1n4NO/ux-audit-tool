import { Workspace } from "@/app/types/workspace";
import { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase/server";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  personal: boolean;
  created_at: string;
  updated_at: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function getWorkspaceName(user: User) {
  const preferredName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email?.split("@")[0] ?? "Personal";

  return `${preferredName}'s Workspace`;
}

function mapWorkspaceRow(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    personal: row.personal,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensurePersonalWorkspace(user: User) {
  const supabase = await createSupabaseServerClient();

  const { data: existingMembership } = await supabase
    .from("workspace_members")
    .select(
      "role, workspace:workspaces!inner(id, name, slug, personal, created_at, updated_at)"
    )
    .eq("user_id", user.id)
    .eq("workspaces.personal", true)
    .limit(1)
    .maybeSingle();

  const existingWorkspace = existingMembership?.workspace;

  if (
    existingWorkspace &&
    typeof existingWorkspace === "object" &&
    existingWorkspace !== null &&
    "id" in existingWorkspace &&
    "name" in existingWorkspace &&
    "slug" in existingWorkspace &&
    "personal" in existingWorkspace &&
    "created_at" in existingWorkspace &&
    "updated_at" in existingWorkspace
  ) {
    return mapWorkspaceRow(existingWorkspace as WorkspaceRow);
  }

  const { data: createdWorkspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: getWorkspaceName(user),
      slug: `${slugify(user.email ?? user.id)}-${user.id.slice(0, 8)}`,
      personal: true,
      created_by: user.id,
    })
    .select("id, name, slug, personal, created_at, updated_at")
    .single();

  if (workspaceError || !createdWorkspace) {
    return null;
  }

  await supabase.from("workspace_members").upsert(
    {
      workspace_id: createdWorkspace.id,
      user_id: user.id,
      role: "owner",
    },
    { onConflict: "workspace_id,user_id" }
  );

  return mapWorkspaceRow(createdWorkspace as WorkspaceRow);
}

export async function getCurrentWorkspaceForUser(user: User) {
  const workspace = await ensurePersonalWorkspace(user);
  return workspace;
}
