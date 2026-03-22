import { prismadb } from "@/lib/prisma";

export const getDocuments = async () => {
  const data = await prismadb.document.findMany({
    include: {
      deal: { select: { id: true, companyName: true } },
      portfolioCompany: { select: { id: true, companyName: true } },
      contact: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return data;
};
