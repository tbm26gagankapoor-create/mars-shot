"use server";

import { prismadb as prisma } from "@/lib/prisma";

export type DuplicateCheckResult = {
  isDuplicate: boolean;
  existingDeals: {
    id: string;
    companyName: string;
    stage: string;
    status: string;
  }[];
};

export async function checkDuplicateDeal(companyName: string): Promise<DuplicateCheckResult> {
  if (!companyName || companyName.trim().length < 2) {
    return { isDuplicate: false, existingDeals: [] };
  }

  const existing = await prisma.deal.findMany({
    where: {
      companyName: { contains: companyName.trim(), mode: "insensitive" },
    },
    select: {
      id: true,
      companyName: true,
      stage: true,
      status: true,
    },
    take: 5,
  });

  return {
    isDuplicate: existing.length > 0,
    existingDeals: existing,
  };
}
