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
import { addManualActivity } from "@/actions/portfolio";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  portfolioCompanyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTIVITY_TYPES = [
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
  { value: "NOTE", label: "Note" },
  { value: "MEETING", label: "Meeting" },
  { value: "OTHER", label: "Other" },
] as const;

export function LogActivitySheet({ portfolioCompanyId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("NOTE");
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setType("NOTE");
    setDescription("");
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      await addManualActivity(portfolioCompanyId, {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
      });
      toast.success("Activity logged");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log Activity</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Catch-up call with founder" />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What happened..." />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSubmit} disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Log Activity"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
