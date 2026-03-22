"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createTermSheet,
  getDealsWithoutTermSheet,
} from "@/actions/term-sheets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Deal = {
  id: string;
  companyName: string;
  stage: string;
  chequeSize: number | null;
};

export function TermSheetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [boardSeat, setBoardSeat] = useState(false);
  const [proRataRights, setProRataRights] = useState(false);

  useEffect(() => {
    async function loadDeals() {
      try {
        const result = await getDealsWithoutTermSheet();
        setDeals(result as Deal[]);
      } catch {
        // DB not connected
      }
    }
    loadDeals();
  }, []);

  // Auto-fill cheque size when deal is selected
  const selectedDeal = deals.find((d) => d.id === selectedDealId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const termSheet = await createTermSheet({
        dealId: selectedDealId,
        valuation: formData.get("valuation")
          ? Number(formData.get("valuation"))
          : undefined,
        chequeSize: formData.get("chequeSize")
          ? Number(formData.get("chequeSize"))
          : undefined,
        equityPercent: formData.get("equityPercent")
          ? Number(formData.get("equityPercent"))
          : undefined,
        investorRights:
          (formData.get("investorRights") as string) || undefined,
        boardSeat,
        proRataRights,
        liquidationPref:
          (formData.get("liquidationPref") as string) || undefined,
        otherTerms: (formData.get("otherTerms") as string) || undefined,
        expiresAt: formData.get("expiresAt")
          ? new Date(formData.get("expiresAt") as string)
          : undefined,
      });

      toast.success(`Term sheet created for ${termSheet.deal.companyName}`);
      router.push(`/term-sheets/${termSheet.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create term sheet"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Deal Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Deal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="dealId">Deal *</Label>
            <Select
              value={selectedDealId}
              onValueChange={setSelectedDealId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a deal" />
              </SelectTrigger>
              <SelectContent>
                {deals.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No eligible deals found
                  </SelectItem>
                ) : (
                  deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.companyName} ({deal.stage})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {deals.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Only active deals in DD, Partner Review, or Decision stages
                without an existing term sheet are shown.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial Terms</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valuation">Valuation ($)</Label>
            <Input
              id="valuation"
              name="valuation"
              type="number"
              placeholder="10000000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chequeSize">Cheque Size ($)</Label>
            <Input
              id="chequeSize"
              name="chequeSize"
              type="number"
              defaultValue={selectedDeal?.chequeSize ?? undefined}
              placeholder="500000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equityPercent">Equity %</Label>
            <Input
              id="equityPercent"
              name="equityPercent"
              type="number"
              step="0.01"
              placeholder="5.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="liquidationPref">Liquidation Preference</Label>
            <Input
              id="liquidationPref"
              name="liquidationPref"
              placeholder="1x non-participating"
            />
          </div>
        </CardContent>
      </Card>

      {/* Investor Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Investor Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="boardSeat"
                checked={boardSeat}
                onCheckedChange={(checked) => setBoardSeat(checked === true)}
              />
              <Label htmlFor="boardSeat">Board Seat</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="proRataRights"
                checked={proRataRights}
                onCheckedChange={(checked) =>
                  setProRataRights(checked === true)
                }
              />
              <Label htmlFor="proRataRights">Pro-Rata Rights</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="investorRights">Additional Investor Rights</Label>
            <Textarea
              id="investorRights"
              name="investorRights"
              rows={3}
              placeholder="Information rights, anti-dilution provisions, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Other Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otherTerms">Other Terms</Label>
            <Textarea
              id="otherTerms"
              name="otherTerms"
              rows={4}
              placeholder="Any additional terms or conditions..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date</Label>
            <Input id="expiresAt" name="expiresAt" type="date" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !selectedDealId}>
          {loading ? "Creating..." : "Create Term Sheet"}
        </Button>
      </div>
    </form>
  );
}
