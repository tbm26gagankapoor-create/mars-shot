"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteSection = async (sectionId: string) => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  if (!sectionId) return { error: "Missing section ID" };

  try {
    await prismadb.tasks.deleteMany({
      where: { section: sectionId },
    });

    await prismadb.sections.delete({
      where: { id: sectionId },
    });

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[DELETE_SECTION]", error);
    return { error: "Failed to delete section" };
  }
};
