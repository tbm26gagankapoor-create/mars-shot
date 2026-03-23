"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  SECTORS,
  FUNDING_STAGES,
  SECTOR_LABELS,
  FUNDING_STAGE_LABELS,
  SOURCE_TYPE_LABELS,
} from "@/lib/constants";
import {
  fullDealSchema,
  type FullDealData,
  type FounderFormData,
} from "@/lib/schemas/deal";
import { createDeal } from "@/actions/deals";
import {
  checkDuplicateDeal,
  type DuplicateCheckResult,
} from "@/actions/deals/check-duplicate";
import { DuplicateWarning } from "./duplicate-warning";
import { ChequeHelper } from "./cheque-helper";
import { WizardSteps } from "./wizard-steps";

const WIZARD_STEPS = [
  { label: "Company & Source", description: "Basic deal info" },
  { label: "Founders & Deck", description: "Team details" },
  { label: "Screening & Review", description: "Fit criteria" },
];

// ─── Step 1: Company & Source ──────────────────────────

function StepCompany({ form }: { form: ReturnType<typeof useForm<FullDealData>> }) {
  const [duplicates, setDuplicates] = useState<
    DuplicateCheckResult["existingDeals"]
  >([]);

  const handleCompanyBlur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      const name = e.target.value.trim();
      if (name.length < 2) {
        setDuplicates([]);
        return;
      }
      const res = await checkDuplicateDeal(name);
      setDuplicates(res.existingDeals);
    },
    []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    handleCompanyBlur(e);
                  }}
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
                <Input placeholder="https://" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Input type="number" placeholder="50000" {...field} />
              </FormControl>
              <ChequeHelper value={field.value} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source (who referred)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SOURCE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2">
          <DuplicateWarning deals={duplicates} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 2: Founders & Deck ───────────────────────────

function StepFounders({ form }: { form: ReturnType<typeof useForm<FullDealData>> }) {
  const founders = form.watch("founders") || [
    { name: "", email: "", phone: "", linkedin: "", title: "" },
  ];
  const [deckFile, setDeckFile] = useState<File | null>(null);

  const updateFounder = (
    idx: number,
    field: keyof FounderFormData,
    value: string
  ) => {
    const updated = [...founders];
    updated[idx] = { ...updated[idx], [field]: value };
    form.setValue("founders", updated);
  };

  const addFounder = () => {
    form.setValue("founders", [
      ...founders,
      { name: "", email: "", phone: "", linkedin: "", title: "" },
    ]);
  };

  const removeFounder = (idx: number) => {
    form.setValue(
      "founders",
      founders.filter((_, i) => i !== idx)
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Founders</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFounder}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Founder
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {founders.map((founder, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end border-b pb-3"
            >
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={founder.name || ""}
                  onChange={(e) => updateFounder(idx, "name", e.target.value)}
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={founder.email || ""}
                  onChange={(e) => updateFounder(idx, "email", e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={founder.phone || ""}
                  onChange={(e) => updateFounder(idx, "phone", e.target.value)}
                  placeholder="Phone"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={founder.title || ""}
                  onChange={(e) => updateFounder(idx, "title", e.target.value)}
                  placeholder="CEO"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFounder(idx)}
                disabled={founders.length <= 1}
                className="self-end"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pitch Deck (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.pptx,.ppt,.doc,.docx"
              onChange={(e) => setDeckFile(e.target.files?.[0] || null)}
              className="text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80"
              data-deck-input
            />
            {deckFile && (
              <Badge variant="secondary" className="text-xs">
                {deckFile.name}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Upload a pitch deck now to satisfy the Screening stage gate.
            Supports PDF, PPTX, DOC.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Step 3: Screening & Review ────────────────────────

function StepScreening({ form }: { form: ReturnType<typeof useForm<FullDealData>> }) {
  const values = form.watch();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Screening Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(
              [
                ["sectorFit", "Sector Fit"],
                ["stageFit", "Stage Fit"],
                ["chequeFit", "Cheque Fit"],
                ["razorpayRelevance", "Razorpay Relevance"],
              ] as const
            ).map(([key, label]) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">{label}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <FormField
            control={form.control}
            name="founderBackground"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Founder Background</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormDescription>
                  Notable experience, education, domain expertise.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Review summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Company:</span>{" "}
              <span className="font-medium">{values.companyName || "—"}</span>
            </div>
            {values.website && (
              <div>
                <span className="text-muted-foreground">Website:</span>{" "}
                {values.website}
              </div>
            )}
            {values.sector && (
              <div>
                <span className="text-muted-foreground">Sector:</span>{" "}
                {SECTOR_LABELS[values.sector] || values.sector}
              </div>
            )}
            {values.fundingStage && (
              <div>
                <span className="text-muted-foreground">Stage:</span>{" "}
                {FUNDING_STAGE_LABELS[values.fundingStage] ||
                  values.fundingStage}
              </div>
            )}
            {values.chequeSize && (
              <div>
                <span className="text-muted-foreground">Cheque:</span> $
                {(Number(values.chequeSize) / 1000).toFixed(0)}K
              </div>
            )}
            {values.source && (
              <div>
                <span className="text-muted-foreground">Source:</span>{" "}
                {values.source}
              </div>
            )}
            {values.sourceType && (
              <div>
                <span className="text-muted-foreground">Source Type:</span>{" "}
                {SOURCE_TYPE_LABELS[values.sourceType] || values.sourceType}
              </div>
            )}
            {values.founders &&
              values.founders.filter((f) => f.name).length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Founders:</span>{" "}
                  {values.founders
                    .filter((f) => f.name)
                    .map(
                      (f) => `${f.name}${f.title ? ` (${f.title})` : ""}`
                    )
                    .join(", ")}
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Wizard Container ──────────────────────────────────

export function DealFormWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const form = useForm<FullDealData>({
    resolver: zodResolver(fullDealSchema) as any,
    defaultValues: {
      founders: [{ name: "", email: "", phone: "", linkedin: "", title: "" }],
    },
  });

  const { trigger, getValues, handleSubmit } = form;

  const stepFields: (keyof FullDealData)[][] = [
    [
      "companyName",
      "website",
      "sector",
      "fundingStage",
      "chequeSize",
      "source",
      "sourceType",
    ],
    ["founders"],
    [
      "sectorFit",
      "stageFit",
      "chequeFit",
      "razorpayRelevance",
      "founderBackground",
    ],
  ];

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function uploadDeck(dealId: string) {
    const deckInput =
      document.querySelector<HTMLInputElement>("[data-deck-input]");
    const file = deckInput?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dealId", dealId);
    formData.append("documentType", "PITCH_DECK");

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success(`Uploaded "${file.name}"`);
    } catch {
      toast.error("Deck upload failed — you can upload it from the deal page.");
    }
  }

  async function onSubmit(data: FullDealData) {
    setLoading(true);
    try {
      const deal = await createDeal({
        companyName: data.companyName,
        website: data.website || undefined,
        sector: data.sector as never,
        fundingStage: data.fundingStage as never,
        chequeSize: data.chequeSize || undefined,
        source: data.source || undefined,
        sourceType: data.sourceType as never,
        sectorFit: data.sectorFit,
        stageFit: data.stageFit,
        chequeFit: data.chequeFit,
        razorpayRelevance: data.razorpayRelevance,
        founderBackground: data.founderBackground || undefined,
        founders: data.founders?.filter((f) => f.name.trim()) || [],
        status: "ACTIVE",
        stage: "DEAL_SOURCE",
        ingestionChannel: "WEB",
      });

      await uploadDeck(deal.id);
      toast.success(`Deal created: ${deal.companyName}`);
      router.push(`/deals/${deal.id}`);
    } catch {
      toast.error("Failed to create deal");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    const data = getValues();
    if (!data.companyName?.trim()) {
      toast.error("Company name is required to save a draft");
      return;
    }
    setSavingDraft(true);
    try {
      const deal = await createDeal({
        companyName: data.companyName,
        website: data.website || undefined,
        sector: data.sector as never,
        fundingStage: data.fundingStage as never,
        chequeSize: data.chequeSize || undefined,
        source: data.source || undefined,
        sourceType: data.sourceType as never,
        sectorFit: data.sectorFit,
        stageFit: data.stageFit,
        chequeFit: data.chequeFit,
        razorpayRelevance: data.razorpayRelevance,
        founderBackground: data.founderBackground || undefined,
        founders: data.founders?.filter((f) => f.name.trim()) || [],
        status: "DRAFT",
        stage: "DEAL_SOURCE",
        ingestionChannel: "WEB",
      });

      await uploadDeck(deal.id);
      toast.success(`Draft saved: ${deal.companyName}`);
      router.push(`/deals/${deal.id}`);
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <WizardSteps steps={WIZARD_STEPS} currentStep={step} />

        {step === 0 && <StepCompany form={form} />}
        {step === 1 && <StepFounders form={form} />}
        {step === 2 && <StepScreening form={form} />}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={savingDraft}
            >
              {savingDraft ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save as Draft
            </Button>

            {step < WIZARD_STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Deal"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
