"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const assignDocumentToTask = async (data: {
  documentId: string;
  taskId: string;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const { documentId, taskId } = data;
  if (!documentId) return { error: "Missing document ID" };
  if (!taskId) return { error: "Missing task ID" };

  try {
    const task = await prismadb.tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) return { error: "Task not found" };

    await prismadb.documentsToTasks.create({
      data: {
        documentId,
        taskId,
      },
    });

    await prismadb.tasks.update({
      where: { id: taskId },
      data: { updatedBy: userId },
    });

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[ASSIGN_DOCUMENT_TO_TASK]", error);
    return { error: "Failed to assign document to task" };
  }
};

export const disconnectDocumentFromTask = async (data: {
  documentId: string;
  taskId: string;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const { documentId, taskId } = data;
  if (!documentId) return { error: "Missing document ID" };
  if (!taskId) return { error: "Missing task ID" };

  try {
    const task = await prismadb.tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) return { error: "Task not found" };

    await prismadb.documentsToTasks.delete({
      where: {
        documentId_taskId: {
          documentId,
          taskId,
        },
      },
    });

    const updatedTask = await prismadb.tasks.update({
      where: { id: taskId },
      data: { updatedBy: userId },
    });

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { data: updatedTask };
  } catch (error) {
    console.log("[DISCONNECT_DOCUMENT_FROM_TASK]", error);
    return { error: "Failed to disconnect document from task" };
  }
};
