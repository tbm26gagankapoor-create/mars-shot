"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const markTaskDone = async (taskId: string) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  if (!taskId) return { error: "Missing task ID" };

  try {
    await prismadb.tasks.update({
      where: { id: taskId },
      data: {
        taskStatus: "COMPLETE",
        updatedBy: userId,
      },
    });

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[MARK_TASK_DONE]", error);
    return { error: "Failed to mark task as done" };
  }
};
