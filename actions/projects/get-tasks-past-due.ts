import { prismadb } from "@/lib/prisma";
import { startOfDay, addDays } from "date-fns";

export const getTasksPastDue = async () => {
  // Demo: no auth check in prototype
  const userId = "demo-user";

  const today = startOfDay(new Date());
  const nextWeek = startOfDay(addDays(new Date(), 7));

  const getTaskPastDue = await prismadb.tasks.findMany({
    where: {
      AND: [
        {
          user: userId,
        },
        {
          dueDateAt: {
            lte: new Date(),
          },
        },
        {
          taskStatus: {
            not: "COMPLETE",
          },
        },
      ],
    },
  });

  const getTaskPastDueInSevenDays = await prismadb.tasks.findMany({
    where: {
      AND: [
        {
          user: userId,
        },
        {
          dueDateAt: {
            gt: today,
            lt: nextWeek,
          },
        },
        {
          taskStatus: {
            not: "COMPLETE",
          },
        },
      ],
    },
  });

  const data = {
    getTaskPastDue,
    getTaskPastDueInSevenDays,
  };

  return data;
};
