import { prismadb } from "@/lib/prisma";

export const getUserTasks = async (userId: string) => {
  const data = await prismadb.tasks.findMany({
    where: {
      user: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
};
