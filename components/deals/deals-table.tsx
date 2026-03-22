"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SlaTimer } from "./sla-timer";
import { SECTOR_LABELS, FUNDING_STAGE_LABELS, STAGE_LABEL_MAP, SOURCE_TYPE_LABELS } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { DealCardData } from "./deal-card";

type DealsTableProps = {
  deals: DealCardData[];
};

export function DealsTable({ deals }: DealsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Round</TableHead>
            <TableHead>Cheque</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Founders</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No deals found
              </TableCell>
            </TableRow>
          )}
          {deals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell className="font-medium">
                <div>
                  {deal.companyName}
                  {deal.status === "DRAFT" && (
                    <Badge className="ml-2 bg-amber-100 text-amber-800 text-[10px]">Draft</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {STAGE_LABEL_MAP[deal.stage] || deal.stage}
                </Badge>
              </TableCell>
              <TableCell>
                <SlaTimer stageEnteredAt={deal.stageEnteredAt} slaDueAt={deal.slaDueAt} />
              </TableCell>
              <TableCell className="text-sm">
                {deal.sector ? SECTOR_LABELS[deal.sector] || deal.sector : "—"}
              </TableCell>
              <TableCell className="text-sm">
                {deal.fundingStage ? FUNDING_STAGE_LABELS[deal.fundingStage] || deal.fundingStage : "—"}
              </TableCell>
              <TableCell className="text-sm">
                {deal.chequeSize ? `$${(deal.chequeSize / 1000).toFixed(0)}K` : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {deal.sourceType ? SOURCE_TYPE_LABELS[deal.sourceType] || deal.sourceType : "—"}
              </TableCell>
              <TableCell className="text-sm">
                {deal.founders.map((f) => f.name).join(", ") || "—"}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/deals/${deal.id}`}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
