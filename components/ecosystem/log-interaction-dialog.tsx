"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus } from "lucide-react";
import { logInteraction } from "@/actions/ecosystem";

interface LogInteractionDialogProps {
  contactId: string;
}

const INTERACTION_TYPES = [
  { value: "MEETING", label: "Meeting" },
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
  { value: "NOTE", label: "Note" },
  { value: "WHATSAPP", label: "WhatsApp" },
] as const;

const MEETING_FORMATS = [
  { value: "IN_PERSON", label: "In-person" },
  { value: "VIDEO", label: "Video call" },
  { value: "PHONE", label: "Phone" },
] as const;

function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LogInteractionDialog({ contactId }: LogInteractionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [interactionType, setInteractionType] = useState("MEETING");
  const [meetingDate, setMeetingDate] = useState(() => toDateTimeLocal(new Date()));
  const [meetingFormat, setMeetingFormat] = useState("VIDEO");
  const [attendees, setAttendees] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDue, setFollowUpDue] = useState("");

  const showFormatAndAttendees = interactionType === "MEETING" || interactionType === "CALL";

  function resetForm() {
    setInteractionType("MEETING");
    setMeetingDate(toDateTimeLocal(new Date()));
    setMeetingFormat("VIDEO");
    setAttendees("");
    setTitle("");
    setNotes("");
    setFollowUpNote("");
    setFollowUpDue("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    startTransition(async () => {
      try {
        await logInteraction(contactId, {
          title: title.trim(),
          description: notes.trim() || undefined,
          interactionType,
          meetingFormat: showFormatAndAttendees ? meetingFormat : undefined,
          meetingDate: meetingDate || undefined,
          attendees: attendees.trim() || undefined,
          followUpNote: followUpNote.trim() || undefined,
          followUpDueAt: followUpDue || undefined,
        });
        toast.success("Interaction logged");
        setOpen(false);
        resetForm();
        router.refresh();
      } catch {
        toast.error("Failed to log interaction");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarPlus className="h-4 w-4 mr-1.5" />
          Log Interaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
            <DialogDescription>
              Record a meeting, call, email, or note with this contact.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Type + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={interactionType} onValueChange={setInteractionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meeting-date">Date &amp; Time</Label>
                <Input
                  id="meeting-date"
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
            </div>

            {/* Format + Attendees (meeting/call only) */}
            {showFormatAndAttendees && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Format</Label>
                  <Select value={meetingFormat} onValueChange={setMeetingFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="attendees">Attendees</Label>
                  <Input
                    id="attendees"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Jane, Bob (optional)"
                  />
                </div>
              </div>
            )}

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="interaction-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interaction-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Coffee chat at TechCrunch"
                required
              />
            </div>

            {/* Notes / Outcome */}
            <div className="grid gap-2">
              <Label htmlFor="interaction-notes">Notes / Outcome</Label>
              <Textarea
                id="interaction-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What was discussed? Key takeaways, decisions, opportunities..."
                rows={3}
              />
            </div>

            {/* Follow-up */}
            <div className="border-t pt-4 grid gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Follow-up
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="followup-note">Action</Label>
                  <Input
                    id="followup-note"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="e.g. Send deck, intro to Rajan"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="followup-due">Due Date</Label>
                  <Input
                    id="followup-due"
                    type="date"
                    value={followUpDue}
                    onChange={(e) => setFollowUpDue(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Log Interaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
