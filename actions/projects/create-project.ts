"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createProject = async (data: {
  title: string;
  description: string;
  visibility: string;
}) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const { title, description, visibility } = data;
  if (!title) return { error: "Missing project name" };
  if (!description) return { error: "Missing project description" };

  try {
    const boardsCount = await prismadb.boards.count();

    const newBoard = await prismadb.boards.create({
      data: {
        v: 0,
        user: userId,
        title,
        description,
        position: boardsCount > 0 ? boardsCount : 0,
        visibility,
        sharedWith: [userId],
        createdBy: userId,
      },
    });

    await prismadb.sections.create({
      data: {
        v: 0,
        board: newBoard.id,
        title: "Backlog",
        position: 0,
      },
    });

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { data: newBoard };
  } catch (error) {
    console.log("[CREATE_PROJECT]", error);
    return { error: "Failed to create project" };
  }
};
