import {
  isAuditResult,
  isPersistedReportRecord,
} from "@/app/types/audit";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { buildInsertPayload, mapRecordToHistoryItem, mapRecordToSavedReport } from "@/lib/reports";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, created_at, url, page_title, selected_checks, overall_score, accessibility_score, readability_score, performance_score, issues"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json(
      { error: "Failed to load reports", details: error.message },
      { status: 500 }
    );
  }

  const reports = Array.isArray(data)
    ? data.filter(isPersistedReportRecord).map(mapRecordToHistoryItem)
    : [];

  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = (await request.json()) as {
    url?: unknown;
    result?: unknown;
    selectedChecks?: unknown;
  };

  if (typeof body.url !== "string" || body.url.trim() === "") {
    return NextResponse.json({ error: "A valid URL is required" }, { status: 400 });
  }

  if (!isAuditResult(body.result)) {
    return NextResponse.json({ error: "A valid audit result is required" }, { status: 400 });
  }

  if (!isStringArray(body.selectedChecks)) {
    return NextResponse.json(
      { error: "Selected checks must be an array of strings" },
      { status: 400 }
    );
  }

  const insertPayload = buildInsertPayload({
    url: body.url.trim(),
    result: body.result,
    selectedChecks: body.selectedChecks,
    userId: user.id,
  });

  const { data, error } = await supabase
    .from("reports")
    .insert(insertPayload)
    .select(
      "id, created_at, url, page_title, selected_checks, overall_score, accessibility_score, readability_score, performance_score, issues"
    )
    .single();

  if (error || !data || !isPersistedReportRecord(data)) {
    return NextResponse.json(
      { error: "Failed to save report", details: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ report: mapRecordToSavedReport(data) }, { status: 201 });
}

export async function DELETE() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { error } = await supabase.from("reports").delete().eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to clear reports", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
