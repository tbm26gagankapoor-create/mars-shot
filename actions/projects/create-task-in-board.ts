"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createTaskInBoard = async (data: {
  boardId: string;
  section: string;
  title?: string;
  priority?: string;
  content?: string;
  user?: string;
  dueDateAt?: Date;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const { boardId, section, title, priority, content, user, dueDateAt } = data;

  if (!section) return { error: "Missing section ID" };

  // Quick-add path: no title/user/priority/content - create a blank task
  if (!title || !user || !priority || !content) {
    try {
      const tasksCount = await prismadb.tasks.count({
        where: { section },
      });

      await prismadb.tasks.create({
        data: {
          v: 0,
          priority: "normal",
          title: "New task",
          content: "",
          section,
          createdBy: userId,
          updatedBy: userId,
          position: tasksCount > 0 ? tasksCount : 0,
          user: userId,
          taskStatus: "ACTIVE",
        },
      });

      await prismadb.boards.update({
        where: { id: boardId },
        data: { updatedAt: new Date() },
      });

      revalidatePath("/[locale]/(routes)/projects", "page");
      return { success: true };
    } catch (error) {
      console.log("[CREATE_TASK_IN_BOARD_QUICK]", error);
      return { error: "Failed to create task" };
    }
  }

  // Full-detail path
  try {
    const tasksCount = await prismadb.tasks.count({
      where: { section },
    });

    const task = await prismadb.tasks.create({
      data: {
        v: 0,
        priority,
        title,
        content,
        dueDateAt,
        section,
        createdBy: user,
        updatedBy: user,
        position: tasksCount > 0 ? tasksCount : 0,
        user,
        taskStatus: "ACTIVE",
      },
    });

    await prismadb.boards.update({
      where: { id: boardId },
      data: { updatedAt: new Date() },
    });

    // Email notifications removed for prototype

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[CREATE_TASK_IN_BOARD]", error);
    return { error: "Failed to create task" };
  }
};
