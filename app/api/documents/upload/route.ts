import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const dealId = formData.get("dealId") as string | null;
    const documentType = formData.get("documentType") as string | null;

    if (!file || !dealId || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields: file, dealId, documentType" },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = [
      "PITCH_DECK",
      "ONE_PAGER",
      "DD_MATERIAL",
      "PARTNER_BRIEF",
      "TERM_SHEET",
    ];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Placeholder storage path (no Supabase Storage yet)
    const storagePath = `/uploads/${dealId}/${file.name}`;

    // Create the Document record
    const document = await prismadb.document.create({
      data: {
        name: file.name,
        type: documentType as
          | "PITCH_DECK"
          | "ONE_PAGER"
          | "DD_MATERIAL"
          | "PARTNER_BRIEF"
          | "TERM_SHEET",
        mimeType: file.type || null,
        storagePath,
        fileSize: file.size,
        version: 1,
        dealId,
      },
    });

    // Create an Activity record
    await prismadb.activity.create({
      data: {
        type: "DOCUMENT_UPLOAD",
        title: `Document uploaded: ${file.name}`,
        description: `${documentType} uploaded (${(file.size / 1024).toFixed(1)} KB)`,
        dealId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
