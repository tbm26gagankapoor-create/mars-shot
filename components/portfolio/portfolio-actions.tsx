"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, CalendarDays, CheckSquare, MessageSquare, FileText } from "lucide-react";
import { ScheduleMeetingSheet } from "./schedule-meeting-sheet";
import { AddTaskSheet } from "./add-task-sheet";
import { LogActivitySheet } from "./log-activity-sheet";
import { AddBoardNoteSheet } from "./add-board-note-sheet";

type SheetType = "meeting" | "task" | "activity" | "note" | null;

interface Props {
  portfolioCompanyId: string;
}

export function PortfolioActions({ portfolioCompanyId }: Props) {
  const [openSheet, setOpenSheet] = useState<SheetType>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" /> Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenSheet("meeting")}>
            <CalendarDays className="h-4 w-4 mr-2" /> Schedule Meeting
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenSheet("task")}>
            <CheckSquare className="h-4 w-4 mr-2" /> Add Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenSheet("activity")}>
            <MessageSquare className="h-4 w-4 mr-2" /> Log Activity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenSheet("note")}>
            <FileText className="h-4 w-4 mr-2" /> Add Board Note
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ScheduleMeetingSheet
        portfolioCompanyId={portfolioCompanyId}
        open={openSheet === "meeting"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
      />
      <AddTaskSheet
        portfolioCompanyId={portfolioCompanyId}
        open={openSheet === "task"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
      />
      <LogActivitySheet
        portfolioCompanyId={portfolioCompanyId}
        open={openSheet === "activity"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
      />
      <AddBoardNoteSheet
        portfolioCompanyId={portfolioCompanyId}
        open={openSheet === "note"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
      />
    </>
  );
}
