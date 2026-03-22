"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { approveDraft, updateDeal } from "@/actions/deals";
import { toast } from "sonner";

type DraftActionsProps = {
  dealId: string;
};

export function DraftActions({ dealId }: DraftActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    try {
      await approveDraft(dealId);
      toast.success("Draft approved and moved to active pipeline");
      router.refresh();
    } catch {
      toast.error("Failed to approve draft");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    try {
      await updateDeal(dealId, { status: "PASSED" as never });
      toast.success("Draft rejected");
      router.refresh();
    } catch {
      toast.error("Failed to reject draft");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button onClick={handleApprove} disabled={loading !== null} size="sm">
        {loading === "approve" ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-1" />
        )}
        Approve
      </Button>
      <Button
        onClick={handleReject}
        disabled={loading !== null}
        size="sm"
        variant="outline"
        className="text-destructive hover:text-destructive"
      >
        {loading === "reject" ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4 mr-1" />
        )}
        Reject
      </Button>
    </div>
  );
}
