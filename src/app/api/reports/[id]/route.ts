import { isPersistedReportRecord } from "@/app/types/audit";
import { mapRecordToSavedReport } from "@/lib/reports";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceForUser } from "@/lib/workspaces";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const workspace = await getCurrentWorkspaceForUser(user);

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not available" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, created_at, url, page_title, selected_checks, overall_score, accessibility_score, readability_score, performance_score, issues"
    )
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .single();

  if (error || !data || !isPersistedReportRecord(data)) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report: mapRecordToSavedReport(data) });
}
