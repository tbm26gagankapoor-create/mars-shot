"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createCalendarEvent,
  updateCalendarEvent,
} from "@/actions/calendar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  { value: "INTRO_CALL", label: "Intro Call" },
  { value: "PARTNER_REVIEW", label: "Partner Review" },
  { value: "DD_MEETING", label: "DD Meeting" },
  { value: "BOARD_MEETING", label: "Board Meeting" },
  { value: "ECOSYSTEM_CATCHUP", label: "Ecosystem Catchup" },
  { value: "TASK", label: "Task" },
  { value: "OTHER", label: "Other" },
] as const;

type EventFormProps = {
  mode?: "create" | "edit";
  eventId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    type?: string;
    startAt?: string; // ISO string
    endAt?: string;
    allDay?: boolean;
    location?: string;
    dealId?: string;
    contactId?: string;
  };
};

export function EventForm({
  mode = "create",
  eventId,
  defaultValues,
}: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allDay, setAllDay] = useState(defaultValues?.allDay ?? false);
  const [eventType, setEventType] = useState(defaultValues?.type ?? "OTHER");

  // Format ISO string to datetime-local input value
  function toLocalInput(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    // Format as YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const data = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      type: eventType as never,
      startAt: new Date(fd.get("startAt") as string),
      endAt: new Date(fd.get("endAt") as string),
      allDay,
      location: (fd.get("location") as string) || undefined,
      dealId: (fd.get("dealId") as string) || undefined,
      contactId: (fd.get("contactId") as string) || undefined,
    };

    if (!data.title || !data.startAt || !data.endAt) {
      toast.error("Title, start, and end are required.");
      setLoading(false);
      return;
    }

    if (data.startAt >= data.endAt) {
      toast.error("End time must be after start time.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "edit" && eventId) {
        await updateCalendarEvent(eventId, data);
        toast.success("Event updated");
      } else {
        await createCalendarEvent(data);
        toast.success("Event created");
      }
      router.push("/calendar");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save event"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Edit Event" : "New Event"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={defaultValues?.title}
              placeholder="e.g. Intro call with Acme Corp"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description}
              placeholder="Agenda or notes..."
              rows={3}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start *</Label>
              <Input
                id="startAt"
                name="startAt"
                type="datetime-local"
                required
                defaultValue={toLocalInput(defaultValues?.startAt)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">End *</Label>
              <Input
                id="endAt"
                name="endAt"
                type="datetime-local"
                required
                defaultValue={toLocalInput(defaultValues?.endAt)}
              />
            </div>
          </div>

          {/* All Day */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label htmlFor="allDay" className="text-sm font-normal">
              All-day event
            </Label>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={defaultValues?.location}
              placeholder="Office, Zoom link, etc."
            />
          </div>

          {/* Deal ID */}
          <div className="space-y-2">
            <Label htmlFor="dealId">Deal ID (optional)</Label>
            <Input
              id="dealId"
              name="dealId"
              defaultValue={defaultValues?.dealId}
              placeholder="Link to a deal"
            />
          </div>

          {/* Contact ID */}
          <div className="space-y-2">
            <Label htmlFor="contactId">Contact ID (optional)</Label>
            <Input
              id="contactId"
              name="contactId"
              defaultValue={defaultValues?.contactId}
              placeholder="Link to a contact"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "edit"
                  ? "Update Event"
                  : "Create Event"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
