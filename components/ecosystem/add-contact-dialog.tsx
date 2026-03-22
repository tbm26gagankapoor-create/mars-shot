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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createContact } from "@/actions/ecosystem";
import { CONTACT_TYPES, WARMTH_SCORES } from "@/lib/constants";
import type { ContactType, WarmthScore } from "@prisma/client";

export function AddContactDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [organization, setOrganization] = useState("");
  const [type, setType] = useState<ContactType>("VC");
  const [warmth, setWarmth] = useState<WarmthScore>("WARM");
  const [sectorTags, setSectorTags] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setLinkedin("");
    setOrganization("");
    setType("VC");
    setWarmth("WARM");
    setSectorTags("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    const sectorExpertise = sectorTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        await createContact({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          organization: organization.trim() || undefined,
          type,
          warmthScore: warmth,
          sectorExpertise,
        });
        toast.success(`Contact "${name.trim()}" created`);
        setOpen(false);
        resetForm();
        router.refresh();
      } catch {
        toast.error("Failed to create contact");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new VC, co-investor, operator, or founder to your ecosystem.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="contact-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@fund.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0100"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="grid gap-2">
              <Label htmlFor="contact-linkedin">LinkedIn</Label>
              <Input
                id="contact-linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/janedoe"
              />
            </div>

            {/* Organization */}
            <div className="grid gap-2">
              <Label htmlFor="contact-org">Organization</Label>
              <Input
                id="contact-org"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Sequoia Capital"
              />
            </div>

            {/* Type + Warmth */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as ContactType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_TYPES.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Warmth</Label>
                <Select value={warmth} onValueChange={(v) => setWarmth(v as WarmthScore)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WARMTH_SCORES.map((w) => (
                      <SelectItem key={w.key} value={w.key}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sector expertise tags */}
            <div className="grid gap-2">
              <Label htmlFor="contact-sectors">Sector Expertise</Label>
              <Input
                id="contact-sectors"
                value={sectorTags}
                onChange={(e) => setSectorTags(e.target.value)}
                placeholder="SAAS, FINTECH, AI (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated sector tags
              </p>
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
              {isPending ? "Creating..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
