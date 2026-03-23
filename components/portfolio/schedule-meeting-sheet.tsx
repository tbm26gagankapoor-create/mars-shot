"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCalendarEvent } from "@/actions/calendar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  portfolioCompanyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEETING_TYPES = [
  { value: "BOARD_MEETING", label: "Board Meeting" },
  { value: "ECOSYSTEM_CATCHUP", label: "Catch-up" },
  { value: "DD_MEETING", label: "DD Meeting" },
  { value: "OTHER", label: "Other" },
] as const;

export function ScheduleMeetingSheet({ portfolioCompanyId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("BOARD_MEETING");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setType("BOARD_MEETING");
    setDate("");
    setStartTime("10:00");
    setEndTime("11:00");
    setLocation("");
    setDescription("");
  }

  async function handleSubmit() {
    if (!title.trim() || !date) {
      toast.error("Title and date are required");
      return;
    }

    const startAt = new Date(`${date}T${startTime}`);
    const endAt = new Date(`${date}T${endTime}`);

    if (endAt <= startAt) {
      toast.error("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      await createCalendarEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        type: type as "BOARD_MEETING" | "ECOSYSTEM_CATCHUP" | "DD_MEETING" | "OTHER",
        startAt,
        endAt,
        location: location.trim() || undefined,
        portfolioCompanyId,
      });
      toast.success("Meeting scheduled");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to schedule meeting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Schedule Meeting</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q1 Board Review" />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zoom / Office" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Agenda or notes..." />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSubmit} disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Schedule Meeting"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
