import { prismadb } from "@/lib/prisma";

export const getKanbanData = async (boardId: string) => {
  const board = await prismadb.boards.findUnique({
    where: {
      id: boardId,
    },
  });

  // Fetch sections for this board
  const sections = await prismadb.sections.findMany({
    where: {
      board: boardId,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Fetch all tasks for these sections in one query
  const sectionIds = sections.map((s) => s.id);
  const allTasks = await prismadb.tasks.findMany({
    where: {
      section: { in: sectionIds },
    },
    orderBy: {
      position: "desc",
    },
  });

  // Group tasks by section
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
