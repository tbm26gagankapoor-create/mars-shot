import { prismadb } from "@/lib/prisma";

export const getDocumentsByContactId = async (contactId: string) => {
  const data = await prismadb.document.findMany({
    where: { contactId },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return data;
};
