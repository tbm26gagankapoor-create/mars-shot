import { prismadb } from "@/lib/prisma";

export const getTaskDocuments = async (taskId: string) => {
  // Query document IDs through DocumentsToTasks junction table
  const docLinks = await prismadb.documentsToTasks.findMany({
    where: { taskId },
  });

  const documentIds = docLinks.map((link) => link.documentId);

  if (documentIds.length === 0) return [];

  const data = await prismadb.document.findMany({
    where: {
      id: { in: documentIds },
    },
  });

  return data;
};
