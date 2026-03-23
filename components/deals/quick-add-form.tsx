"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  FormDescription,
} from "@/components/ui/form";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { SECTORS } from "@/lib/constants";
import { quickAddDealSchema, type QuickAddDealData } from "@/lib/schemas/deal";
import { createDeal } from "@/actions/deals";
import {
  checkDuplicateDeal,
  type DuplicateCheckResult,
} from "@/actions/deals/check-duplicate";
import { DuplicateWarning } from "./duplicate-warning";

export function QuickAddForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<
    DuplicateCheckResult["existingDeals"]
  >([]);

  const form = useForm<QuickAddDealData>({
    resolver: zodResolver(quickAddDealSchema) as any,
    defaultValues: {
      companyName: "",
      source: "",
      sector: undefined,
      notes: "",
    },
  });

  const handleCompanyNameBlur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      const name = e.target.value.trim();
      if (name.length < 2) {
        setDuplicates([]);
        return;
      }
      const result = await checkDuplicateDeal(name);
      setDuplicates(result.existingDeals);
    },
    []
  );

  async function onSubmit(data: QuickAddDealData) {
    setLoading(true);
    try {
      const deal = await createDeal({
        companyName: data.companyName,
        source: data.source || undefined,
        sector: data.sector as never,
        founderBackground: data.notes || undefined,
        status: "ACTIVE",
        stage: "DEAL_SOURCE",
        ingestionChannel: "WEB",
      });
      toast.success(`Deal created: ${deal.companyName}`);
      router.push(`/deals/${deal.id}`);
    } catch {
      toast.error("Failed to create deal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Add
        </CardTitle>
        <CardDescription>
          Log a deal in seconds — just the essentials. You can add details
          later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. TechCorp"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          handleCompanyNameBlur(e);
                        }}
                      />
                    </FormControl>
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
                      <Input
                        placeholder="e.g. Nikhil from Zerodha"
                        {...field}
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Quick Note</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="One-liner about this deal..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional context — founder background, why it&apos;s
                      interesting, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DuplicateWarning deals={duplicates} />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" /> Quick Create
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
