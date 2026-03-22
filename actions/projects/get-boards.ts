import { prismadb } from "@/lib/prisma";

export const getBoards = async (userId: string) => {
  if (!userId) {
    return null;
  }
  const data = await prismadb.boards.findMany({
    where: {
      OR: [
        {
          user: userId,
        },
        {
          visibility: "public",
        },
        {
          watchers: {
            has: userId,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return data;
};
