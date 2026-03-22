"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateKanbanPosition = async (data: {
  resourceList: { id: string }[];
  destinationList: { id: string }[];
  resourceSectionId: string;
  destinationSectionId: string;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const {
    resourceList,
    destinationList,
    resourceSectionId,
    destinationSectionId,
  } = data;

  try {
    const resourceListReverse = [...resourceList].reverse();
    const destinationListReverse = [...destinationList].reverse();

    if (resourceSectionId !== destinationSectionId) {
      for (let key = 0; key < resourceListReverse.length; key++) {
        const task = resourceListReverse[key];
        await prismadb.tasks.update({
          where: { id: task.id },
          data: {
            section: resourceSectionId,
            position: key,
            updatedBy: userId,
          },
        });
      }
    }

    for (let key = 0; key < destinationListReverse.length; key++) {
      const task = destinationListReverse[key];
      await prismadb.tasks.update({
        where: { id: task.id },
        data: {
          section: destinationSectionId,
          position: key,
          updatedBy: userId,
        },
      });
    }

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[UPDATE_KANBAN_POSITION]", error);
    return { error: "Failed to update task positions" };
  }
};
