import { prismadb } from "@/lib/prisma";

export const getStorageSize = async () => {
  const data = await prismadb.document.findMany({
    select: { fileSize: true },
  });

  const storageSize = data.reduce((acc: number, doc) => {
    return acc + (doc.fileSize || 0);
  }, 0);

  const storageSizeMB = storageSize / 1_000_000;
  return Math.round(storageSizeMB * 100) / 100;
};
