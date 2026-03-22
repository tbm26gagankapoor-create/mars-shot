"use server";

import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteDocument(documentId: string) {
  if (!documentId) throw new Error("Document ID is required");

  const document = await prismadb.document.findUnique({
    where: { id: documentId },
  });

  if (!document) throw new Error("Document not found");

  await prismadb.document.delete({ where: { id: documentId } });

  // TODO: delete from storage when S3/MinIO is wired up

  revalidatePath("/[locale]/(routes)/documents");
}
