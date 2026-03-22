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
import { MessageSquarePlus } from "lucide-react";
import { logInteraction } from "@/actions/ecosystem";

interface LogInteractionDialogProps {
  contactId: string;
}

export function LogInteractionDialog({ contactId }: LogInteractionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
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
          description: description.trim() || undefined,
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
        <Button size="sm" variant="outline">
          <MessageSquarePlus className="h-4 w-4 mr-1" />
          Log Interaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
            <DialogDescription>
              Record a meeting, call, email, or any touchpoint with this contact.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="interaction-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interaction-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Coffee chat at TechCrunch"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="interaction-desc">Description</Label>
              <Textarea
                id="interaction-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Discussed portfolio synergies, potential co-invest opportunities..."
                rows={4}
              />
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
