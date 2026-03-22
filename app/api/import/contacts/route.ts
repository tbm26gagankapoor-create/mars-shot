import { NextResponse } from "next/server";
import { parseCSV, importContacts } from "@/lib/import";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    let csvText: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "No CSV file provided. Send a file field in multipart form data." },
          { status: 400 }
        );
      }

      if (!file.name.endsWith(".csv")) {
        return NextResponse.json(
          { error: "Only .csv files are accepted." },
          { status: 400 }
        );
      }

      csvText = await file.text();
    } else if (contentType.includes("text/csv")) {
      csvText = await request.text();
    } else {
      return NextResponse.json(
        { error: "Unsupported content type. Send multipart/form-data with a file field, or text/csv body." },
        { status: 400 }
      );
    }

    if (!csvText.trim()) {
      return NextResponse.json(
        { error: "CSV file is empty." },
        { status: 400 }
      );
    }

    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No data rows found in CSV. Ensure the file has a header row and at least one data row." },
        { status: 400 }
      );
    }

    const stats = await importContacts(rows);

    return NextResponse.json({
      success: true,
      stats,
      message: `Import complete: ${stats.created} created, ${stats.skipped} skipped.`,
    });
  } catch (err) {
    console.error("Contact import failed:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
