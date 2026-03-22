"use server";

import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { DocumentType } from "@prisma/client";

interface CreateDocumentInput {
  name: string;
  storagePath: string;
  fileSize?: number;
  mimeType?: string;
  type?: DocumentType;
  dealId?: string;
  portfolioCompanyId?: string;
  contactId?: string;
}

export async function createDocument(input: CreateDocumentInput) {
  const doc = await prismadb.document.create({
    data: {
      name: input.name,
      type: input.type || "OTHER",
      storagePath: input.storagePath,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      dealId: input.dealId,
      portfolioCompanyId: input.portfolioCompanyId,
      contactId: input.contactId,
    },
  });

  revalidatePath("/[locale]/(routes)/documents");
  return doc;
}
