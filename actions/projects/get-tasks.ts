import { prismadb } from "@/lib/prisma";

export const getTasks = async () => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const boards = await prismadb.boards.findMany({
    where: {
      OR: [
        {
          user: userId,
        },
        {
          visibility: "public",
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!boards) return null;

  //Filtering tasks by section and board
  const sections = await prismadb.sections.findMany({
    where: {
      OR: boards.map((board: any) => {
        return {
          board: board.id,
        };
      }),
    },
  });

  const data = await prismadb.tasks.findMany({
    where: {
      OR: sections.map((section: any) => {
        return {
          section: section.id,
        };
      }),
    },
    orderBy: { createdAt: "desc" },
  });
  return data;
};

//get tasks by month for chart
export const getTasksByMonth = async () => {
  const tasks = await prismadb.tasks.findMany({
    select: {
      createdAt: true,
    },
  });

  if (!tasks) {
    return {};
  }

  const tasksByMonth = tasks.reduce((acc: any, task: any) => {
    const month = new Date(task.createdAt).toLocaleString("default", {
      month: "long",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(tasksByMonth).map((month: any) => {
    return {
      name: month,
      Number: tasksByMonth[month],
    };
  });

  return chartData;
};
