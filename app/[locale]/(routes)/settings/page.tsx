"use client";

import { useState } from "react";
import { Copy, Check, Mail, MessageCircle, Send, Bot, Cpu, Clock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEAL_STAGES } from "@/lib/constants";

function CopyableText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-mono hover:bg-muted/80 transition-colors"
    >
      {text}
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

function formatSlaHours(hours: number | null): string {
  if (hours === null) return "No SLA";
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  if (Number.isInteger(days)) return `${days}d`;
  return `${hours}h (~${days.toFixed(1)}d)`;
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Channel integrations, AI configuration, and system preferences
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Channel Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Channel Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Email Forwarding Address</p>
              <p className="text-xs text-muted-foreground mb-1.5">
                Forward startup pitch emails to this address for automatic deal capture.
              </p>
              <CopyableText text="deals@marsshot.app" />
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">WhatsApp Bot</p>
                <Badge variant="outline" className="text-xs">Not configured</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Send startup details via WhatsApp to auto-create draft deals. Setup instructions coming soon.
              </p>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Telegram Bot</p>
                <Badge variant="outline" className="text-xs">Not configured</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Forward messages to the Mars Shot Telegram bot for deal ingestion. Setup instructions coming soon.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4" />
              AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Extraction Model</p>
              <p className="text-sm text-muted-foreground">
                Llama 3.3 70B via Cerebras
              </p>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Auto-Approve Threshold</p>
              <p className="text-sm text-muted-foreground">
                Deals with AI confidence at or above <span className="font-mono font-medium text-foreground">90%</span> are auto-approved into the active pipeline.
              </p>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-sm font-medium">API Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-health-green" />
                <p className="text-sm text-muted-foreground">Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              SLA Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Maximum time allowed in each pipeline stage before a deal is flagged as breached.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEAL_STAGES.map((stage) => (
                  <TableRow key={stage.key}>
                    <TableCell className="text-sm">{stage.label}</TableCell>
                    <TableCell className="text-right text-sm font-mono tabular-nums">
                      {formatSlaHours(stage.slaHours)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-display font-semibold">Mars Shot VC CRM</p>
              <p className="text-sm text-muted-foreground">
                Built for Razorpay founders&apos; investment arm
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Version</p>
              <Badge variant="secondary" className="font-display font-mono tabular-nums">1.0.0</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
