import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { runAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const result = await runAudit($);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AUDIT ERROR:", message);

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return NextResponse.json(
        {
          error: "This website blocks automated access",
          suggestion: "Try another public website (e.g. blogs, docs, etc.)",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to audit website",
        details: message,
      },
      { status: 500 }
    );
  }
}
