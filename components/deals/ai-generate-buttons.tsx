"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AiGenerateButtonsProps {
  dealId: string;
}

export function AiGenerateButtons({ dealId }: AiGenerateButtonsProps) {
  const router = useRouter();
  const [loadingOnePager, setLoadingOnePager] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  async function handleGenerateOnePager() {
    setLoadingOnePager(true);
    try {
      const res = await fetch("/api/ai/one-pager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate one-pager");
      }

      toast.success("One-pager generated successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate one-pager"
      );
    } finally {
      setLoadingOnePager(false);
    }
  }

  async function handleDraftEmail() {
    setLoadingEmail(true);
    try {
      const res = await fetch("/api/ai/email-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to draft email");
      }

      toast.success("Email draft generated successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to draft email"
      );
    } finally {
      setLoadingEmail(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleGenerateOnePager}
        disabled={loadingOnePager || loadingEmail}
      >
        {loadingOnePager ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-1" />
        )}
        Generate One-Pager
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDraftEmail}
        disabled={loadingOnePager || loadingEmail}
      >
        {loadingEmail ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Mail className="h-4 w-4 mr-1" />
        )}
        Draft Email
      </Button>
    </div>
  );
}
