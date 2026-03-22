import { prismadb } from "@/lib/prisma";

// Legacy: get documents by deal ID (adapted from OpenSuite opportunityId)
export const getDocumentsByOpportunityId = async (dealId: string) => {
  const data = await prismadb.document.findMany({
    where: { dealId },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return data;
};
