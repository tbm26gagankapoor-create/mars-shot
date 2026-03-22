"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  sendTermSheet,
  signTermSheet,
  expireTermSheet,
} from "@/actions/term-sheets";
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

type StatusActionsProps = {
  termSheetId: string;
  currentStatus: string;
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SENT"],
  SENT: ["SIGNED", "EXPIRED"],
  NEGOTIATING: ["SIGNED", "EXPIRED"],
  SIGNED: [],
  EXPIRED: [],
};

export function StatusActions({ termSheetId, currentStatus }: StatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "send" | "sign" | "expire" | null;
  }>({ open: false, action: null });

  const validActions = VALID_TRANSITIONS[currentStatus] || [];

  async function executeAction(action: "send" | "sign" | "expire") {
    setLoading(true);
    try {
      switch (action) {
        case "send":
          await sendTermSheet(termSheetId);
          toast.success("Term sheet marked as sent");
          break;
        case "sign":
          await signTermSheet(termSheetId);
          toast.success("Term sheet marked as signed");
          break;
        case "expire":
          await expireTermSheet(termSheetId);
          toast.success("Term sheet marked as expired");
          break;
      }
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
      console.error(err);
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  }

  if (validActions.length === 0) return null;

  return (
    <>
      <div className="flex gap-2">
        {validActions.includes("SENT") && (
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => setConfirmDialog({ open: true, action: "send" })}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Send
          </Button>
        )}
        {validActions.includes("SIGNED") && (
          <Button
            size="sm"
            disabled={loading}
            onClick={() => setConfirmDialog({ open: true, action: "sign" })}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            Mark Signed
          </Button>
        )}
        {validActions.includes("EXPIRED") && (
          <Button
            size="sm"
            variant="destructive"
            disabled={loading}
            onClick={() => setConfirmDialog({ open: true, action: "expire" })}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            Expire
          </Button>
        )}
      </div>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: open ? confirmDialog.action : null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "send" && "Send Term Sheet?"}
              {confirmDialog.action === "sign" && "Mark as Signed?"}
              {confirmDialog.action === "expire" && "Expire Term Sheet?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "send" &&
                "This will mark the term sheet as sent. The sent date will be recorded."}
              {confirmDialog.action === "sign" &&
                "This will mark the term sheet as signed. This action signifies the deal is closing."}
              {confirmDialog.action === "expire" &&
                "This will mark the term sheet as expired. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={() =>
                confirmDialog.action && executeAction(confirmDialog.action)
              }
            >
              {loading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
