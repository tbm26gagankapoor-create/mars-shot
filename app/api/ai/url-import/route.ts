import { NextResponse } from "next/server";
import { extractDealFromText } from "@/lib/ai";

const MAX_CONTENT_LENGTH = 500_000; // 500KB
const FETCH_TIMEOUT = 10_000; // 10s

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    // Fetch the page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    let html: string;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MarsShot-DealBot/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.json(
          { error: `Could not fetch page (HTTP ${res.status})` },
          { status: 422 }
        );
      }

      const contentLength = res.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          { error: "Page too large to process" },
          { status: 422 }
        );
      }

      html = await res.text();
      if (html.length > MAX_CONTENT_LENGTH) {
        html = html.slice(0, MAX_CONTENT_LENGTH);
      }
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out. Try pasting the text via AI Extract instead." },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: "Could not fetch the URL. Try pasting the text via AI Extract instead." },
        { status: 422 }
      );
    }

    // Strip HTML to text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10_000); // Cap text sent to AI

    if (text.length < 20) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from this page." },
        { status: 422 }
      );
    }

    // Pass through existing AI extraction
    const contextText = `Website URL: ${url}\n\nPage content:\n${text}`;
    const result = await extractDealFromText(contextText);

    // Pre-fill website if not extracted
    if (!result.website) {
      result.website = parsedUrl.origin;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("URL import error:", err);
    return NextResponse.json(
      { error: "AI extraction failed. Try pasting the text via AI Extract." },
      { status: 500 }
    );
  }
}
