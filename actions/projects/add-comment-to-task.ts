"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const addCommentToTask = async (data: {
  taskId: string;
  comment: string;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const { taskId, comment } = data;
  if (!taskId) return { error: "Missing task ID" };
  if (!comment) return { error: "Missing comment" };

  try {
    const task = await prismadb.tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) return { error: "Task not found" };
    if (!task.section) return { error: "Task section not found" };

    const section = await prismadb.sections.findUnique({
      where: { id: task.section },
    });

    if (section) {
      // Task from Projects module - add user as board watcher
      const board = await prismadb.boards.findUnique({
        where: { id: section.board },
      });

      if (board && !board.watchers.includes(userId)) {
        await prismadb.boards.update({
          where: { id: section.board },
          data: {
            watchers: [...board.watchers, userId],
          },
        });
      }
    }

    const newComment = await prismadb.tasksComments.create({
      data: {
        v: 0,
        comment,
        task: taskId,
        user: userId,
      },
    });

    // Email notifications removed for prototype

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { data: newComment };
  } catch (error) {
    console.log("[ADD_COMMENT_TO_TASK]", error);
    return { error: "Failed to add comment" };
  }
};
