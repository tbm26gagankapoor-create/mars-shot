"use server";

import { prismadb as prisma } from "@/lib/prisma";
import type { CalendarEventType, CalendarEventStatus } from "@prisma/client";
import { DEAL_STAGES } from "@/lib/constants";

// ─── Types ──────────────────────────────────────────────

export type CreateCalendarEventInput = {
  title: string;
  description?: string;
  type?: CalendarEventType;
  startAt: Date;
  endAt: Date;
  allDay?: boolean;
  location?: string;
  reminderMinutes?: number;
  dealId?: string;
  portfolioCompanyId?: string;
  contactId?: string;
};

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput> & {
  status?: CalendarEventStatus;
};

export type CalendarFilters = {
  startDate?: Date;
  endDate?: Date;
  type?: CalendarEventType;
  status?: CalendarEventStatus;
  dealId?: string;
  portfolioCompanyId?: string;
  contactId?: string;
};

// ─── CRUD ───────────────────────────────────────────────

export async function getCalendarEvents(filters?: CalendarFilters) {
  return prisma.calendarEvent.findMany({
    where: {
      ...(filters?.startDate && { startAt: { gte: filters.startDate } }),
      ...(filters?.endDate && { endAt: { lte: filters.endDate } }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.dealId && { dealId: filters.dealId }),
      ...(filters?.portfolioCompanyId && {
        portfolioCompanyId: filters.portfolioCompanyId,
      }),
      ...(filters?.contactId && { contactId: filters.contactId }),
    },
    include: {
      deal: { select: { id: true, companyName: true } },
      portfolioCompany: { select: { id: true, companyName: true } },
      contact: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getCalendarEventById(id: string) {
  return prisma.calendarEvent.findUnique({
    where: { id },
    include: {
      deal: { select: { id: true, companyName: true, stage: true } },
      portfolioCompany: { select: { id: true, companyName: true } },
      contact: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createCalendarEvent(input: CreateCalendarEventInput) {
  return prisma.calendarEvent.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type || "OTHER",
      startAt: input.startAt,
      endAt: input.endAt,
      allDay: input.allDay || false,
      location: input.location,
      reminderMinutes: input.reminderMinutes ?? 30,
      dealId: input.dealId,
      portfolioCompanyId: input.portfolioCompanyId,
      contactId: input.contactId,
    },
  });
}

export async function updateCalendarEvent(
  id: string,
  input: UpdateCalendarEventInput
) {
  return prisma.calendarEvent.update({
    where: { id },
    data: input,
  });
}

export async function deleteCalendarEvent(id: string) {
  await prisma.calendarEvent.delete({ where: { id } });
}

// ─── Dashboard Widget ───────────────────────────────────

export async function getUpcomingEvents(daysAhead = 7) {
  const now = new Date();
  const end = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return prisma.calendarEvent.findMany({
    where: {
      startAt: { gte: now, lte: end },
      status: "SCHEDULED",
    },
    include: {
      deal: { select: { id: true, companyName: true } },
      contact: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
    take: 10,
  });
}

// ─── SLA Reminders ──────────────────────────────────────

export async function createSlaReminders(dealId: string) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal || !deal.slaDueAt) return null;

  const stageDef = DEAL_STAGES.find((s) => s.key === deal.stage);
  const stageLabel = stageDef?.label || deal.stage;

  // Create a reminder event 24 hours before SLA breach
  const reminderTime = new Date(deal.slaDueAt.getTime() - 24 * 60 * 60 * 1000);
  if (reminderTime <= new Date()) return null; // Already past

  return prisma.calendarEvent.create({
    data: {
      title: `SLA Warning: ${deal.companyName} — ${stageLabel}`,
      description: `Deal SLA expires at ${deal.slaDueAt.toISOString()}. Action required.`,
      type: "TASK",
      startAt: reminderTime,
      endAt: deal.slaDueAt,
      isSlaReminder: true,
      dealId: deal.id,
    },
  });
}
