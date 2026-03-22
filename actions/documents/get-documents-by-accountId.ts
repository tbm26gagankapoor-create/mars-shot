import { prismadb } from "@/lib/prisma";

// Legacy: get documents by deal ID (adapted from OpenSuite accountId)
export const getDocumentsByAccountId = async (dealId: string) => {
  const data = await prismadb.document.findMany({
    where: { dealId },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return data;
};
