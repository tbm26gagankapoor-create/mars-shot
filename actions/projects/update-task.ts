"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateTask = async (data: {
  taskId: string;
  title: string;
  user: string;
  board?: string;
  boardId?: string;
  priority: string;
  content: string;
  dueDateAt?: Date;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const { taskId, title, user, boardId, priority, content, dueDateAt } = data;
  const resolvedBoardId = boardId || data.board;

  if (!taskId) return { error: "Missing task ID" };
  if (!title || !user || !priority || !content) {
    return { error: "Missing one of the task data" };
  }

  try {
    const task = await prismadb.tasks.update({
      where: { id: taskId },
      data: {
        priority,
        title,
        content,
        updatedBy: user,
        dueDateAt,
        user,
      },
    });

    if (resolvedBoardId) {
      await prismadb.boards.update({
        where: { id: resolvedBoardId },
        data: { updatedAt: new Date() },
      });
    }

    // Email notifications removed for prototype

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[UPDATE_TASK]", error);
    return { error: "Failed to update task" };
  }
};
