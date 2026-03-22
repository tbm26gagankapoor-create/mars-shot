import { prismadb } from "@/lib/prisma";

export const getTask = async (taskId: string) => {
  const task = await prismadb.tasks.findFirst({
    where: {
      id: taskId,
    },
  });

  if (!task) return null;

  // Fetch documents linked through DocumentsToTasks junction table
  const docLinks = await prismadb.documentsToTasks.findMany({
    where: { taskId },
  });
  const documentIds = docLinks.map((link) => link.documentId);
  const documents =
    documentIds.length > 0
      ? await prismadb.document.findMany({
          where: { id: { in: documentIds } },
          select: {
            id: true,
            name: true,
            storagePath: true,
          },
        })
      : [];

  // Fetch comments for this task
  const comments = await prismadb.tasksComments.findMany({
    where: { task: taskId },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    ...task,
    documents,
    comments,
  };
};
