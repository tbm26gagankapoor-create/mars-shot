"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Sparkles,
  Loader2,
  Globe,
  Mail,
  MessageCircle,
  Send,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  SECTORS,
  FUNDING_STAGES,
  INGESTION_CHANNELS,
  BUSINESS_MODELS,
  REVENUE_TYPES,
} from "@/lib/constants";
import { createDeal } from "@/actions/deals";
import { TagInput } from "./tag-input";
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
  description?: string;
  revenue?: number;
  revenueType?: string;
  location?: string;
  teamSize?: number;
  businessModel?: string;
  tags?: string[];
  totalRoundSize?: number;
  preMoneyValuation?: number;
  existingInvestors?: string;
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  WEB: <Globe className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  WHATSAPP: <MessageCircle className="h-4 w-4" />,
  TELEGRAM: <Send className="h-4 w-4" />,
  MOBILE_PWA: <Smartphone className="h-4 w-4" />,
};

type AIExtractionProps = {
  onExtracted?: (result: ExtractionResult) => void;
  directCreate?: boolean;
};

export function AIExtraction({
  onExtracted,
  directCreate = false,
}: AIExtractionProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [edited, setEdited] = useState<ExtractionResult | null>(null);
  const [channel, setChannel] = useState("WEB");
  const [duplicates, setDuplicates] = useState<
    DuplicateCheckResult["existingDeals"]
  >([]);

  const data = edited || result;

  // Form for the editable result section
  const form = useForm({
    values: data
      ? {
          companyName: data.companyName,
          website: data.website || "",
          sector: data.sector || "",
          fundingStage: data.fundingStage || "",
          chequeSize: data.chequeSize || undefined,
          source: data.source || "",
          description: data.description || "",
          revenue: data.revenue || undefined,
          revenueType: data.revenueType || "",
          location: data.location || "",
          teamSize: data.teamSize || undefined,
          businessModel: data.businessModel || "",
          totalRoundSize: data.totalRoundSize || undefined,
          preMoneyValuation: data.preMoneyValuation || undefined,
        }
      : undefined,
  });

  const updateField = <K extends keyof ExtractionResult>(
    key: K,
    value: ExtractionResult[K]
  ) => {
    if (!data) return;
    setEdited({ ...data, [key]: value });
  };

  const handleCheckDuplicate = useCallback(async (name: string) => {
    if (name.trim().length < 2) {
      setDuplicates([]);
      return;
    }
    const res = await checkDuplicateDeal(name);
    setDuplicates(res.existingDeals);
  }, []);

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

      const extractedData = await res.json();
      setResult(extractedData);
      setEdited(extractedData);
      toast.success(
        `Extracted: ${extractedData.companyName} (${extractedData.confidence}% confidence)`
      );

      if (extractedData.companyName) {
        handleCheckDuplicate(extractedData.companyName);
      }
    } catch {
      toast.error("AI extraction failed. Try manual entry.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectCreate() {
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
        rawIngestionText: text,
        aiConfidence: data.confidence,
        ingestionChannel: channel as never,
        status: "ACTIVE",
        stage: "DEAL_SOURCE",
        description: data.description || undefined,
        revenue: data.revenue || undefined,
        revenueType: data.revenueType as never,
        location: data.location || undefined,
        teamSize: data.teamSize || undefined,
        businessModel: data.businessModel as never,
        tags: data.tags || undefined,
        totalRoundSize: data.totalRoundSize || undefined,
        preMoneyValuation: data.preMoneyValuation || undefined,
        existingInvestors: data.existingInvestors || undefined,
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
            <Sparkles className="h-4 w-4" />
            AI Deal Extraction
          </CardTitle>
          <CardDescription>
            Paste a raw lead — email forward, WhatsApp message, pitch text —
            and AI will extract structured deal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Source channel</Label>
            <ToggleGroup
              type="single"
              value={channel}
              onValueChange={(v) => {
                if (v) setChannel(v);
              }}
              variant="outline"
              className="justify-start"
            >
              {INGESTION_CHANNELS.map((ch) => (
                <ToggleGroupItem
                  key={ch.key}
                  value={ch.key}
                  aria-label={ch.label}
                  className="gap-1.5"
                >
                  {CHANNEL_ICONS[ch.key]}
                  <span className="hidden sm:inline text-xs">{ch.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Textarea
            placeholder={`Paste raw deal text here...\n\nExample:\n"Hey, sharing a deal — TechCorp, SaaS analytics platform for SMBs.\nPre-seed, looking for $50K. Founded by Arjun (ex-Stripe, IIT-B).\nReferred by Nikhil from Zerodha. Website: techcorp.io"`}
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={handleExtract} disabled={loading || !text.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Extracting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" /> Extract with AI
              </>
            )}
          </Button>
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
              Review and edit the extracted fields before creating.
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
                          placeholder="https://"
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

            {/* Additional extracted fields */}
            {(data.description ||
              data.revenue ||
              data.location ||
              data.teamSize ||
              data.businessModel ||
              (data.tags && data.tags.length > 0) ||
              data.totalRoundSize ||
              data.preMoneyValuation) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    Additional Extracted Fields
                  </Label>
                  <Form {...form}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={2}
                                placeholder="One-line company description"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  updateField("description", e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="revenue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Revenue ($)</FormLabel>
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
                                  updateField("revenue", val);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="revenueType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Revenue Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(v) => {
                                field.onChange(v);
                                updateField("revenueType", v);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {REVENUE_TYPES.map((r) => (
                                  <SelectItem key={r.key} value={r.key}>
                                    {r.label}
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
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City, Country"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  updateField("location", e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Size</FormLabel>
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
                                  updateField("teamSize", val);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Model</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(v) => {
                                field.onChange(v);
                                updateField("businessModel", v);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BUSINESS_MODELS.map((b) => (
                                  <SelectItem key={b.key} value={b.key}>
                                    {b.label}
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
                        name="totalRoundSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Round Size ($)</FormLabel>
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
                                  updateField("totalRoundSize", val);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preMoneyValuation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pre-Money Valuation ($)</FormLabel>
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
                                  updateField("preMoneyValuation", val);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium">Tags</Label>
                        <TagInput
                          value={data.tags || []}
                          onChange={(tags) => updateField("tags", tags)}
                        />
                      </div>
                    </div>
                  </Form>
                </div>
              </>
            )}

            {/* Founders */}
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
                      className="grid grid-cols-2 md:grid-cols-4 gap-2"
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
                          Phone
                        </Label>
                        <Input
                          value={f.phone || ""}
                          onChange={(e) => {
                            const updated = [...data.founders];
                            updated[idx] = {
                              ...updated[idx],
                              phone: e.target.value,
                            };
                            updateField("founders", updated);
                          }}
                          placeholder="Phone"
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
              {directCreate ? (
                <Button
                  onClick={handleDirectCreate}
                  disabled={creating || !data.companyName.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1" /> Confirm &amp;
                      Create Deal
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={() => onExtracted?.(data)}>
                  Use This Data
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setEdited(null);
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
