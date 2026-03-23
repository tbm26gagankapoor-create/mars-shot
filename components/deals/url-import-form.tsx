"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SECTORS, FUNDING_STAGES } from "@/lib/constants";
import { createDeal } from "@/actions/deals";
import {
  checkDuplicateDeal,
  type DuplicateCheckResult,
} from "@/actions/deals/check-duplicate";
import { DuplicateWarning } from "./duplicate-warning";
import { ChequeHelper } from "./cheque-helper";

type ExtractionResult = {
  companyName: string;
  website?: string;
  sector?: string;
  fundingStage?: string;
  chequeSize?: number;
  founders: {
    name: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    title?: string;
  }[];
  source?: string;
  sourceType?: string;
  summary?: string;
  confidence: number;
};

export function URLImportForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [data, setData] = useState<ExtractionResult | null>(null);
  const [duplicates, setDuplicates] = useState<
    DuplicateCheckResult["existingDeals"]
  >([]);

  const form = useForm({
    values: data
      ? {
          companyName: data.companyName,
          website: data.website || "",
          sector: data.sector || "",
          fundingStage: data.fundingStage || "",
          chequeSize: data.chequeSize || undefined,
          source: data.source || "",
        }
      : undefined,
  });

  const updateField = <K extends keyof ExtractionResult>(
    key: K,
    value: ExtractionResult[K]
  ) => {
    if (!data) return;
    setData({ ...data, [key]: value });
  };

  const handleCheckDuplicate = useCallback(async (name: string) => {
    if (name.trim().length < 2) {
      setDuplicates([]);
      return;
    }
    const res = await checkDuplicateDeal(name);
    setDuplicates(res.existingDeals);
  }, []);

  async function handleFetch() {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/url-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to import from URL");
        return;
      }

      setData(result);
      toast.success(
        `Extracted: ${result.companyName} (${result.confidence}% confidence)`
      );

      if (result.companyName) {
        handleCheckDuplicate(result.companyName);
      }
    } catch {
      toast.error("Failed to fetch URL. Try pasting the text via AI Extract.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!data) return;
    setCreating(true);
    try {
      const deal = await createDeal({
        companyName: data.companyName,
        website: data.website || undefined,
        sector: data.sector as never,
        fundingStage: data.fundingStage as never,
        chequeSize: data.chequeSize || undefined,
        source: data.source || undefined,
        sourceType: data.sourceType as never,
        founders: data.founders.filter((f) => f.name.trim()),
        aiConfidence: data.confidence,
        ingestionChannel: "WEB",
        status: "ACTIVE",
        stage: "DEAL_SOURCE",
      });
      toast.success(`Deal created: ${deal.companyName}`);
      router.push(`/deals/${deal.id}`);
    } catch {
      toast.error("Failed to create deal");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            URL Import
          </CardTitle>
          <CardDescription>
            Paste a company website or landing page URL. AI will extract deal
            information from the page content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleFetch())
              }
            />
            <Button onClick={handleFetch} disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Fetching...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1" /> Fetch &amp; Extract
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Extraction Result</CardTitle>
              <Badge
                variant={data.confidence >= 80 ? "default" : "secondary"}
                className={data.confidence >= 80 ? "bg-green-600" : ""}
              >
                {data.confidence}% confidence
              </Badge>
            </div>
            <CardDescription>
              Review and edit before creating the deal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            updateField("companyName", e.target.value);
                          }}
                          onBlur={(e) => handleCheckDuplicate(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            updateField("website", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          updateField("sector", v);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SECTORS.map((s) => (
                            <SelectItem key={s.key} value={s.key}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fundingStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Stage</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          updateField("fundingStage", v);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FUNDING_STAGES.map((s) => (
                            <SelectItem key={s.key} value={s.key}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chequeSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cheque Size ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value
                              ? Number(e.target.value)
                              : undefined;
                            field.onChange(val);
                            updateField("chequeSize", val);
                          }}
                        />
                      </FormControl>
                      <ChequeHelper value={data.chequeSize} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            updateField("source", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>

            {data.founders.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    Founders
                  </Label>
                  {data.founders.map((f, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-2 md:grid-cols-3 gap-2"
                    >
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          value={f.name}
                          onChange={(e) => {
                            const updated = [...data.founders];
                            updated[idx] = {
                              ...updated[idx],
                              name: e.target.value,
                            };
                            updateField("founders", updated);
                          }}
                          placeholder="Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Title
                        </Label>
                        <Input
                          value={f.title || ""}
                          onChange={(e) => {
                            const updated = [...data.founders];
                            updated[idx] = {
                              ...updated[idx],
                              title: e.target.value,
                            };
                            updateField("founders", updated);
                          }}
                          placeholder="Title"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Email
                        </Label>
                        <Input
                          value={f.email || ""}
                          onChange={(e) => {
                            const updated = [...data.founders];
                            updated[idx] = {
                              ...updated[idx],
                              email: e.target.value,
                            };
                            updateField("founders", updated);
                          }}
                          placeholder="Email"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.summary && (
              <p className="text-sm text-muted-foreground italic">
                {data.summary}
              </p>
            )}

            <DuplicateWarning deals={duplicates} />

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={creating || !data.companyName.trim()}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" /> Confirm &amp; Create
                    Deal
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setData(null);
                  setDuplicates([]);
                }}
              >
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
