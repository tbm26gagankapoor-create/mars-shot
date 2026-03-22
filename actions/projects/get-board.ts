import { prismadb } from "@/lib/prisma";

export const getBoard = async (id: string) => {
  const board = await prismadb.boards.findFirst({
    where: {
      id: id,
    },
  });

  const sections = await prismadb.sections.findMany({
    where: {
      board: id,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Fetch tasks for all sections in one query and group by section
  const sectionIds = sections.map((s) => s.id);
  const allTasks = await prismadb.tasks.findMany({
    where: {
      section: { in: sectionIds },
    },
    orderBy: {
      position: "desc",
    },
  });

  const tasksBySection = new Map<string, typeof allTasks>();
  for (const task of allTasks) {
    const existing = tasksBySection.get(task.section) ?? [];
    existing.push(task);
    tasksBySection.set(task.section, existing);
  }

  const sectionsWithTasks = sections.map((section) => ({
    ...section,
    tasks: tasksBySection.get(section.id) ?? [],
  }));

  const data = {
    board,
    sections: sectionsWithTasks,
  };
  return data;
};
