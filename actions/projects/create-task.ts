"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createTask = async (data: {
  title: string;
  user: string;
  board: string;
  priority: string;
  content: string;
  dueDateAt?: Date;
  account?: string;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const { title, user, board, priority, content, dueDateAt } = data;

  if (!title || !user || !board || !priority || !content) {
    return { error: "Missing one of the task data" };
  }

  try {
    const sectionId = await prismadb.sections.findFirst({
      where: { board },
      orderBy: { position: "asc" },
    });

    if (!sectionId) return { error: "No section found" };

    const tasksCount = await prismadb.tasks.count({
      where: { section: sectionId.id },
    });

    const task = await prismadb.tasks.create({
      data: {
        v: 0,
        priority,
        title,
        content,
        dueDateAt,
        section: sectionId.id,
        createdBy: userId,
        updatedBy: userId,
        position: tasksCount > 0 ? tasksCount : 0,
        user,
        taskStatus: "ACTIVE",
      },
    });

    await prismadb.boards.update({
      where: { id: board },
      data: { updatedAt: new Date() },
    });

    // Email notifications removed for prototype

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[CREATE_TASK]", error);
    return { error: "Failed to create task" };
  }
};
