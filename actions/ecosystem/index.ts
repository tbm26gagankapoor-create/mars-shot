"use server";

import { prismadb as prisma } from "@/lib/prisma";
import type { ContactType, WarmthScore } from "@prisma/client";

export async function getContacts(filters?: {
  warmthScore?: WarmthScore;
  type?: ContactType;
}) {
  return prisma.contact.findMany({
    where: {
      ...(filters?.warmthScore && { warmthScore: filters.warmthScore }),
      ...(filters?.type && { type: filters.type }),
    },
    include: {
      _count: { select: { activities: true } },
    },
    orderBy: { lastInteractionAt: "desc" },
  });
}

export async function getContactById(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function createContact(data: {
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  organization?: string;
  type?: ContactType;
  warmthScore?: WarmthScore;
  sectorExpertise?: string[];
  coInvestmentHistory?: string;
}) {
  const contact = await prisma.contact.create({ data });

  await prisma.activity.create({
    data: {
      type: "CONTACT_CREATED",
      title: `Contact added: ${contact.name}`,
      contactId: contact.id,
    },
  });

  return contact;
}

export async function updateContact(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    organization?: string;
    type?: ContactType;
    warmthScore?: WarmthScore;
    sectorExpertise?: string[];
    coInvestmentHistory?: string;
  }
) {
  return prisma.contact.update({ where: { id }, data });
}

export async function logInteraction(
  contactId: string,
  data: { title: string; description?: string; metadata?: Record<string, unknown> }
) {
  const [activity] = await Promise.all([
    prisma.activity.create({
      data: {
        type: "INTERACTION",
        title: data.title,
        description: data.description,
        metadata: data.metadata as never,
        contactId,
      },
    }),
    prisma.contact.update({
      where: { id: contactId },
      data: {
        lastInteractionAt: new Date(),
        interactionCount: { increment: 1 },
      },
    }),
  ]);

  return activity;
}

export async function getColdContacts() {
  return prisma.contact.findMany({
    where: { warmthScore: "COLD" },
    orderBy: { lastInteractionAt: "asc" },
  });
}

export async function getContactsGoingCold(daysThreshold = 30) {
  const cutoff = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
  return prisma.contact.findMany({
    where: {
      warmthScore: { not: "COLD" },
      lastInteractionAt: { lt: cutoff },
    },
    orderBy: { lastInteractionAt: "asc" },
  });
}

/**
 * Warmth auto-decay — called by cron
 * 60+ days no interaction → COLD
 * 30+ days no interaction → WARM (if currently HOT)
 */
export async function runWarmthDecay() {
  const now = new Date();
  const coldCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const warmCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [coldUpdates, warmUpdates] = await Promise.all([
    prisma.contact.updateMany({
      where: {
        warmthScore: { not: "COLD" },
        lastInteractionAt: { lt: coldCutoff },
      },
      data: { warmthScore: "COLD" },
    }),
    prisma.contact.updateMany({
      where: {
        warmthScore: "HOT",
        lastInteractionAt: { lt: warmCutoff, gt: coldCutoff },
      },
      data: { warmthScore: "WARM" },
    }),
  ]);

  return { coldUpdates: coldUpdates.count, warmUpdates: warmUpdates.count };
}
