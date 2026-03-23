"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { InvestmentEditSheet } from "./investment-edit-sheet";
import { KpiForm } from "./kpi-form";
import type { getPortfolioCompanyById } from "@/actions/portfolio";

type Company = NonNullable<Awaited<ReturnType<typeof getPortfolioCompanyById>>>;

interface PortfolioDetailActionsProps {
  company: Company;
}

export function EditInvestmentButton({ company }: PortfolioDetailActionsProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
      </Button>
      <InvestmentEditSheet company={company} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function AddKpiButton({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add KPI Snapshot
      </Button>
      <KpiForm portfolioCompanyId={companyId} open={open} onOpenChange={setOpen} />
    </>
  );
}
