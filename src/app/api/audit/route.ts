import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { runAudit } from "@/lib/audit";

const REQUEST_TIMEOUT_MS = 10000;
const MAX_REDIRECTS = 5;

function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "::1" ||
    normalized.endsWith(".local")
  ) {
    return true;
  }

  if (/^127\./.test(normalized) || /^10\./.test(normalized) || /^192\.168\./.test(normalized)) {
    return true;
  }

  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized);
}

function validateAuditUrl(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: "URL is required" };
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return { error: "Enter a valid URL" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { error: "Only http:// and https:// URLs are supported" };
  }

  if (!parsed.hostname) {
    return { error: "URL hostname is required" };
  }

  if (isPrivateHostname(parsed.hostname)) {
    return { error: "Private and local network URLs are not allowed" };
  }

  return { url: parsed.toString() };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const validation = validateAuditUrl(url);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const response = await axios.get<string>(validation.url, {
      timeout: REQUEST_TIMEOUT_MS,
      maxRedirects: MAX_REDIRECTS,
      responseType: "text",
    });
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

    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      return NextResponse.json(
        {
          error: "The website took too long to respond",
          suggestion: "Try another public website or retry later",
        },
        { status: 504 }
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
