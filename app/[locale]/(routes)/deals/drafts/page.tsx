import Link from "next/link";
import { ArrowLeft, Globe, Mail, MessageCircle, Send, Smartphone, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDraftDeals } from "@/actions/deals";
import { INGESTION_CHANNELS, SECTOR_LABELS } from "@/lib/constants";
import { DraftActions } from "@/components/deals/draft-actions";
import { DraftRawText } from "./draft-raw-text";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  WEB: <Globe className="h-3.5 w-3.5" />,
  EMAIL: <Mail className="h-3.5 w-3.5" />,
  WHATSAPP: <MessageCircle className="h-3.5 w-3.5" />,
  TELEGRAM: <Send className="h-3.5 w-3.5" />,
  MOBILE_PWA: <Smartphone className="h-3.5 w-3.5" />,
};

function getChannelLabel(key: string): string {
  return INGESTION_CHANNELS.find((c) => c.key === key)?.label ?? key;
}

export default async function DealDraftsPage() {
  let drafts: Awaited<ReturnType<typeof getDraftDeals>> = [];
  let error: string | null = null;

  try {
    drafts = await getDraftDeals();
  } catch (e) {
    error = "Failed to load draft deals. Please try again.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/deals"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Deals
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Draft Deals</h1>
        <p className="text-muted-foreground">
          Deals auto-captured from email, WhatsApp, and Telegram — pending your approval
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!error && drafts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-display font-medium">No draft deals</p>
            <p className="text-xs text-muted-foreground">
              Forward emails or send WhatsApp messages to auto-capture leads
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {drafts.map((deal) => {
          const confidence = deal.aiConfidence ?? 0;
          const confidencePercent = Math.round(confidence * 100);
          const isHighConfidence = confidencePercent >= 80;
          const channelKey = deal.ingestionChannel ?? "WEB";

          return (
            <Card key={deal.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{deal.companyName}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {deal.sector && (
                        <span>{SECTOR_LABELS[deal.sector] ?? deal.sector}</span>
                      )}
                      {deal.chequeSize && (
                        <>
                          <span className="text-muted-foreground/50">|</span>
                          <span>${(deal.chequeSize / 1000).toFixed(0)}K</span>
                        </>
                      )}
                      {deal.source && (
                        <>
                          <span className="text-muted-foreground/50">|</span>
                          <span>{deal.source}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        isHighConfidence
                          ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                          : "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                      }
                    >
                      AI {confidencePercent}%
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {CHANNEL_ICONS[channelKey]}
                      {getChannelLabel(channelKey)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Founders */}
                {deal.founders.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Founders</p>
                    <div className="flex flex-wrap gap-2">
                      {deal.founders.map((f) => (
                        <span key={f.id} className="text-sm">
                          {f.name}
                          {f.title && (
                            <span className="text-muted-foreground"> ({f.title})</span>
                          )}
                          {f.email && (
                            <span className="text-muted-foreground"> — {f.email}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw ingestion text */}
                {deal.rawIngestionText && (
                  <DraftRawText text={deal.rawIngestionText} />
                )}

                <Separator />

                {/* Actions */}
                <DraftActions dealId={deal.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
