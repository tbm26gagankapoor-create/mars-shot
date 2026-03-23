"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, MoreHorizontal, XCircle, Trophy, Pause, Play, Loader2 } from "lucide-react";
import { advanceStage, closeDeal, checkStageGate, updateDeal } from "@/actions/deals";
import { DEAL_STAGES, PASS_REASON_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

type DealActionsProps = {
  dealId: string;
  currentStage: string;
  status: string;
};

export function DealActions({ dealId, currentStage, status }: DealActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gateDialog, setGateDialog] = useState<{
    open: boolean;
    missingFields: string[];
    nextStage: string | null;
  }>({ open: false, missingFields: [], nextStage: null });
  const [closeDialog, setCloseDialog] = useState<{
    open: boolean;
    type: "CLOSED_WON" | "CLOSED_LOST" | "PASSED" | null;
  }>({ open: false, type: null });
  const [passReasonCategory, setPassReasonCategory] = useState("");
  const [passReason, setPassReason] = useState("");

  const currentIdx = DEAL_STAGES.findIndex((s) => s.key === currentStage);
  const isLastStage = currentIdx === DEAL_STAGES.length - 1;
  const isClosed = ["CLOSED_WON", "CLOSED_LOST", "PASSED"].includes(status);
  const isOnHold = status === "ON_HOLD";

  async function handleAdvance() {
    setLoading(true);
    try {
      const gate = await checkStageGate(dealId);

      if (!gate.canAdvance && gate.missingFields.length > 0) {
        setGateDialog({
          open: true,
          missingFields: gate.missingFields,
          nextStage: gate.nextStage,
        });
        setLoading(false);
        return;
      }

      if (!gate.nextStage) {
        toast.error("Already at final stage");
        setLoading(false);
        return;
      }

      const result = await advanceStage(dealId);
      if (result.success && result.deal) {
        toast.success(`Advanced to ${DEAL_STAGES.find((s) => s.key === result.deal!.stage)?.label}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to advance");
      }
    } catch {
      toast.error("Failed to advance stage");
    } finally {
      setLoading(false);
    }
  }

  async function handleClose(type: "CLOSED_WON" | "CLOSED_LOST" | "PASSED") {
    setLoading(true);
    try {
      const passData = type === "PASSED" ? {
        passReason: passReason || undefined,
        passReasonCategory: passReasonCategory || undefined,
      } : undefined;
      await closeDeal(dealId, type, passData);
      const label = type === "CLOSED_WON" ? "Won" : type === "CLOSED_LOST" ? "Lost" : "Passed";
      toast.success(`Deal marked as ${label}`);
      router.refresh();
    } catch {
      toast.error("Failed to close deal");
    } finally {
      setLoading(false);
      setCloseDialog({ open: false, type: null });
      setPassReasonCategory("");
      setPassReason("");
    }
  }

  async function handleToggleHold() {
    setLoading(true);
    try {
      const newStatus = isOnHold ? "ACTIVE" : "ON_HOLD";
      await updateDeal(dealId, { status: newStatus as never });
      toast.success(isOnHold ? "Deal reactivated" : "Deal put on hold");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  if (isClosed) {
    return (
      <Badge variant="secondary" className="text-sm">
        {status === "CLOSED_WON" ? "Won" : status === "CLOSED_LOST" ? "Lost" : "Passed"}
      </Badge>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!isLastStage && (
          <Button onClick={handleAdvance} disabled={loading} size="sm">
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            Advance Stage
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleHold}>
              {isOnHold ? (
                <><Play className="h-4 w-4 mr-2" /> Reactivate</>
              ) : (
                <><Pause className="h-4 w-4 mr-2" /> Put on Hold</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setCloseDialog({ open: true, type: "CLOSED_WON" })}
              className="text-green-600"
            >
              <Trophy className="h-4 w-4 mr-2" /> Close — Won
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setCloseDialog({ open: true, type: "PASSED" })}
            >
              <XCircle className="h-4 w-4 mr-2" /> Pass
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setCloseDialog({ open: true, type: "CLOSED_LOST" })}
              className="text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" /> Close — Lost
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stage Gate Dialog */}
      <AlertDialog open={gateDialog.open} onOpenChange={(open) => setGateDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot advance stage</AlertDialogTitle>
            <AlertDialogDescription>
              The following fields are required before advancing to{" "}
              <strong>{DEAL_STAGES.find((s) => s.key === gateDialog.nextStage)?.label}</strong>:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="list-disc pl-6 text-sm space-y-1">
            {gateDialog.missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Deal Confirmation */}
      <AlertDialog open={closeDialog.open} onOpenChange={(open) => {
        setCloseDialog((prev) => ({ ...prev, open }));
        if (!open) { setPassReasonCategory(""); setPassReason(""); }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {closeDialog.type === "CLOSED_WON"
                ? "Close deal as Won?"
                : closeDialog.type === "PASSED"
                ? "Pass on this deal?"
                : "Close deal as Lost?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {closeDialog.type === "CLOSED_WON"
                ? "This will mark the deal as won and create a portfolio company entry."
                : closeDialog.type === "PASSED"
                ? "Select a reason for passing. You can reopen it later if needed."
                : "This will mark the deal as lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {closeDialog.type === "PASSED" && (
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label className="text-sm">Pass Reason Category *</Label>
                <Select value={passReasonCategory} onValueChange={setPassReasonCategory}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    {PASS_REASON_CATEGORIES.map((c) => (
                      <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Notes (optional)</Label>
                <Textarea
                  value={passReason}
                  onChange={(e) => setPassReason(e.target.value)}
                  rows={3}
                  placeholder="Why are you passing on this deal?"
                />
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closeDialog.type && handleClose(closeDialog.type)}
              disabled={loading || (closeDialog.type === "PASSED" && !passReasonCategory)}
              className={closeDialog.type === "CLOSED_WON" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
