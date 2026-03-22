"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const watchProject = async (projectId: string) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  if (!projectId) return { error: "Missing project ID" };

  try {
    const board = await prismadb.boards.findUnique({
      where: { id: projectId },
    });

    if (!board) return { error: "Project not found" };

    if (!board.watchers.includes(userId)) {
      await prismadb.boards.update({
        where: { id: projectId },
        data: {
          watchers: [...board.watchers, userId],
        },
      });
    }

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[WATCH_PROJECT]", error);
    return { error: "Failed to watch project" };
  }
};

export const unwatchProject = async (projectId: string) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  if (!projectId) return { error: "Missing project ID" };

  try {
    const board = await prismadb.boards.findUnique({
      where: { id: projectId },
    });

    if (!board) return { error: "Project not found" };

    await prismadb.boards.update({
      where: { id: projectId },
      data: {
        watchers: board.watchers.filter((w) => w !== userId),
      },
    });

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[UNWATCH_PROJECT]", error);
    return { error: "Failed to unwatch project" };
  }
};
