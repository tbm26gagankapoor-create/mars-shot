"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ExtractionResult = {
  companyName: string;
  website?: string;
  sector?: string;
  fundingStage?: string;
  chequeSize?: number;
  founders: { name: string; email?: string; phone?: string; linkedin?: string; title?: string }[];
  source?: string;
  sourceType?: string;
  summary?: string;
  confidence: number;
};

type AIExtractionProps = {
  onExtracted: (result: ExtractionResult) => void;
};

export function AIExtraction({ onExtracted }: AIExtractionProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  async function handleExtract() {
    if (!text.trim()) {
      toast.error("Please paste some text first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Extraction failed");

      const data = await res.json();
      setResult(data);
      toast.success(`Extracted: ${data.companyName} (${data.confidence}% confidence)`);
    } catch {
      toast.error("AI extraction failed. Try manual entry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Deal Extraction
          </CardTitle>
          <CardDescription>
            Paste a raw lead — email forward, WhatsApp message, pitch text — and AI will extract structured deal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`Paste raw deal text here...

Example:
"Hey, sharing a deal — TechCorp, SaaS analytics platform for SMBs.
Pre-seed, looking for $50K. Founded by Arjun (ex-Stripe, IIT-B).
Referred by Nikhil from Zerodha. Website: techcorp.io"`}
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={handleExtract} disabled={loading || !text.trim()}>
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Extracting...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-1" /> Extract with AI</>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Extraction Result</CardTitle>
              <Badge
                variant={result.confidence >= 80 ? "default" : "secondary"}
                className={result.confidence >= 80 ? "bg-green-600" : ""}
              >
                {result.confidence}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Company:</span> {result.companyName}</div>
              {result.website && <div><span className="text-muted-foreground">Website:</span> {result.website}</div>}
              {result.sector && <div><span className="text-muted-foreground">Sector:</span> {result.sector}</div>}
              {result.fundingStage && <div><span className="text-muted-foreground">Stage:</span> {result.fundingStage}</div>}
              {result.chequeSize && <div><span className="text-muted-foreground">Cheque:</span> ${(result.chequeSize / 1000).toFixed(0)}K</div>}
              {result.source && <div><span className="text-muted-foreground">Source:</span> {result.source}</div>}
            </div>
            {result.founders.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Founders:</span>{" "}
                {result.founders.map((f) => `${f.name}${f.title ? ` (${f.title})` : ""}`).join(", ")}
              </div>
            )}
            {result.summary && (
              <p className="text-sm text-muted-foreground italic">{result.summary}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => onExtracted(result)}>
                Use This Data
              </Button>
              <Button variant="outline" onClick={() => setResult(null)}>
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
