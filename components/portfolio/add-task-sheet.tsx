"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCalendarEvent } from "@/actions/calendar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  portfolioCompanyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTaskSheet({ portfolioCompanyId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setDueDate("");
    setDescription("");
  }

  async function handleSubmit() {
    if (!title.trim() || !dueDate) {
      toast.error("Title and due date are required");
      return;
    }

    const startAt = new Date(`${dueDate}T09:00`);
    const endAt = new Date(`${dueDate}T09:30`);

    setSaving(true);
    try {
      await createCalendarEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        type: "TASK",
        startAt,
        endAt,
        portfolioCompanyId,
      });
      toast.success("Task added");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to add task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Task</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Send term sheet follow-up" />
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Details..." />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSubmit} disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Add Task"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
