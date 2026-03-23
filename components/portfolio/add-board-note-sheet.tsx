"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addBoardNote } from "@/actions/portfolio";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  portfolioCompanyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBoardNoteSheet({ portfolioCompanyId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");

  function reset() {
    setTitle("");
    setDate("");
    setContent("");
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      await addBoardNote(portfolioCompanyId, {
        title: title.trim(),
        content: content.trim(),
        date: date ? new Date(date) : undefined,
      });
      toast.success("Board note added");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to add board note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Board Note</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q1 2026 Board Meeting" />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Meeting notes, decisions, action items..." />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSubmit} disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Add Note"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
