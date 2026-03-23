import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDealById } from "@/actions/deals";
import {
  DEAL_STAGES,
  SECTOR_LABELS,
  FUNDING_STAGE_LABELS,
  SOURCE_TYPE_LABELS,
  BUSINESS_MODEL_LABELS,
  REVENUE_TYPE_LABELS,
  PASS_REASON_LABELS,
} from "@/lib/constants";
import { SlaTimer } from "@/components/deals/sla-timer";
import { DealStageProgress } from "@/components/deals/deal-stage-progress";
import { DealActions } from "@/components/deals/deal-actions";
import { DocumentUpload } from "@/components/deals/document-upload";
import { AiGenerateButtons } from "@/components/deals/ai-generate-buttons";
import { DealEditTrigger } from "@/components/deals/deal-edit-trigger";
import {
  ExternalLink, Mail, Phone, Linkedin, User, MapPin, Users, Building,
  Calendar, Star, AlertTriangle, Twitter, TrendingUp, DollarSign,
} from "lucide-react";
import { formatDistanceToNow, format, isPast, differenceInHours } from "date-fns";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;

  let deal;
  try {
    deal = await getDealById(id);
  } catch {
    // DB not connected
  }

  if (!deal) return notFound();

  const stageLabel = DEAL_STAGES.find((s) => s.key === deal.stage)?.label || deal.stage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{deal.companyName}</h1>
            <DealEditTrigger deal={deal} />
            <Badge variant={deal.status === "ACTIVE" ? "default" : "secondary"}>
              {deal.status}
            </Badge>
            <SlaTimer stageEnteredAt={deal.stageEnteredAt} slaDueAt={deal.slaDueAt} />
          </div>
          <p className="text-muted-foreground mt-1">
            {stageLabel} &middot; Created {formatDistanceToNow(deal.createdAt, { addSuffix: true })}
          </p>
        </div>
        <DealActions dealId={deal.id} currentStage={deal.stage} status={deal.status} />
      </div>

      {/* Stage Progress */}
      <DealStageProgress currentStage={deal.stage} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({deal.documents.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity ({deal.activities.length})
          </TabsTrigger>
          <TabsTrigger value="ai">
            AI Outputs ({deal.aiOutputs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Pass Reason Banner */}
          {deal.status === "PASSED" && deal.passReasonCategory && (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="py-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Passed — {PASS_REASON_LABELS[deal.passReasonCategory] || deal.passReasonCategory}
                  </p>
                  {deal.passReason && (
                    <p className="text-amber-700 dark:text-amber-400 mt-1">{deal.passReason}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deal.description && (
                  <p className="text-sm text-muted-foreground">{deal.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sector</span>
                    <p>{deal.sector ? SECTOR_LABELS[deal.sector] || deal.sector : "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Funding Stage</span>
                    <p>{deal.fundingStage ? FUNDING_STAGE_LABELS[deal.fundingStage] || deal.fundingStage : "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Business Model</span>
                    <p>{deal.businessModel ? BUSINESS_MODEL_LABELS[deal.businessModel] || deal.businessModel : "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source</span>
                    <p>{deal.sourceType ? SOURCE_TYPE_LABELS[deal.sourceType] || deal.sourceType : "—"}</p>
                  </div>
                  {deal.location && (
                    <div>
                      <span className="text-muted-foreground">Location</span>
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {deal.location}</p>
                    </div>
                  )}
                  {deal.teamSize && (
                    <div>
                      <span className="text-muted-foreground">Team Size</span>
                      <p className="flex items-center gap-1"><Users className="h-3 w-3" /> {deal.teamSize}</p>
                    </div>
                  )}
                  {deal.foundedDate && (
                    <div>
                      <span className="text-muted-foreground">Founded</span>
                      <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(deal.foundedDate, "MMM yyyy")}</p>
                    </div>
                  )}
                  {deal.legalEntityName && (
                    <div>
                      <span className="text-muted-foreground">Legal Entity</span>
                      <p className="flex items-center gap-1"><Building className="h-3 w-3" /> {deal.legalEntityName}</p>
                    </div>
                  )}
                </div>
                {deal.website && (
                  <a
                    href={deal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {deal.website}
                  </a>
                )}
                {deal.referredByContact ? (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Referred by:</span>{" "}
                    <a href={`/en/ecosystem/${deal.referredByContact.id}`} className="text-primary hover:underline">
                      {deal.referredByContact.name}
                      {deal.referredByContact.organization && ` (${deal.referredByContact.organization})`}
                    </a>
                  </p>
                ) : deal.source ? (
                  <p className="text-sm"><span className="text-muted-foreground">Referred by:</span> {deal.source}</p>
                ) : null}
              </CardContent>
            </Card>

            {/* Deal Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deal Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Our Cheque</span>
                    <p>{deal.chequeSize ? `$${(deal.chequeSize / 1000).toFixed(0)}K` : "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Round</span>
                    <p>{deal.totalRoundSize ? `$${(deal.totalRoundSize / 1_000_000).toFixed(1)}M` : "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pre-Money Valuation</span>
                    <p>{deal.preMoneyValuation ? `$${(deal.preMoneyValuation / 1_000_000).toFixed(1)}M` : "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Existing Investors</span>
                    <p>{deal.existingInvestors || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traction & Financials — only if any field present */}
            {(deal.revenue || deal.burnRate || deal.runway) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Traction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {deal.revenue != null && (
                      <div>
                        <span className="text-muted-foreground">Revenue</span>
                        <p className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {`$${(deal.revenue / 1000).toFixed(0)}K`}
                          {deal.revenueType && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              {REVENUE_TYPE_LABELS[deal.revenueType] || deal.revenueType}
                            </Badge>
                          )}
                        </p>
                      </div>
                    )}
                    {deal.burnRate != null && (
                      <div>
                        <span className="text-muted-foreground">Burn Rate</span>
                        <p>${(deal.burnRate / 1000).toFixed(0)}K/mo</p>
                      </div>
                    )}
                    {deal.runway != null && (
                      <div>
                        <span className="text-muted-foreground">Runway</span>
                        <p>{deal.runway} months</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Founders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Founders ({deal.founders.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deal.founders.map((founder) => (
                  <div key={founder.id} className="flex items-start gap-3 text-sm">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{founder.name} {founder.title && <span className="text-muted-foreground font-normal">({founder.title})</span>}</p>
                      <div className="flex flex-wrap gap-3 text-muted-foreground">
                        {founder.email && (
                          <a href={`mailto:${founder.email}`} className="flex items-center gap-1 hover:text-primary">
                            <Mail className="h-3 w-3" /> {founder.email}
                          </a>
                        )}
                        {founder.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {founder.phone}
                          </span>
                        )}
                        {founder.linkedin && (
                          <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                            <Linkedin className="h-3 w-3" />
                          </a>
                        )}
                        {founder.twitter && (
                          <a href={founder.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                            <Twitter className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {(founder.previousCompanies || founder.education) && (
                        <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                          {founder.previousCompanies && <p>Previously: {founder.previousCompanies}</p>}
                          {founder.education && <p>Education: {founder.education}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {deal.founders.length === 0 && (
                  <p className="text-sm text-muted-foreground">No founders added</p>
                )}
              </CardContent>
            </Card>

            {/* Screening */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Screening</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "Sector Fit", value: deal.sectorFit },
                    { label: "Stage Fit", value: deal.stageFit },
                    { label: "Cheque Fit", value: deal.chequeFit },
                    { label: "Razorpay Relevance", value: deal.razorpayRelevance },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        value === true ? "bg-green-500" : value === false ? "bg-red-500" : "bg-gray-300"
                      }`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                {deal.founderBackground && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <span className="text-sm text-muted-foreground">Founder Background</span>
                      <p className="text-sm mt-1">{deal.founderBackground}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Call Notes */}
            {deal.callNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Call Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{deal.callNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tags & Internal */}
          {(deal.tags?.length > 0 || deal.convictionScore || deal.nextAction) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Internal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deal.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {deal.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-6 text-sm">
                  {deal.convictionScore && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground mr-1">Conviction:</span>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < deal.convictionScore! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  )}
                  {deal.nextAction && (
                    <div>
                      <span className="text-muted-foreground">Next action:</span>{" "}
                      <span>{deal.nextAction}</span>
                      {deal.nextActionDueAt && (
                        <Badge
                          variant="outline"
                          className={`ml-2 text-xs ${
                            isPast(deal.nextActionDueAt)
                              ? "border-red-500 text-red-600"
                              : differenceInHours(deal.nextActionDueAt, new Date()) < 24
                                ? "border-yellow-500 text-yellow-600"
                                : ""
                          }`}
                        >
                          Due {format(deal.nextActionDueAt, "MMM d")}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Documents</CardTitle>
                <DocumentUpload dealId={deal.id} />
              </div>
            </CardHeader>
            <CardContent>
              {deal.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No documents uploaded yet. Upload a pitch deck to advance past Screening.
                </p>
              ) : (
                <div className="space-y-2">
                  {deal.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded border text-sm">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} &middot; v{doc.version}</p>
                      </div>
                      <Badge variant="outline">{doc.mimeType || "file"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {deal.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {deal.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-muted-foreground">{activity.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(activity.createdAt, "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">AI Outputs</CardTitle>
                <AiGenerateButtons dealId={deal.id} />
              </div>
            </CardHeader>
            <CardContent>
              {deal.aiOutputs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No AI outputs yet. Use the buttons above to generate.
                </p>
              ) : (
                <div className="space-y-4">
                  {deal.aiOutputs.map((output) => (
                    <div key={output.id} className="rounded border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{output.type}</Badge>
                        <div className="flex items-center gap-2">
                          {output.confidence && (
                            <span className="text-xs text-muted-foreground">{Math.round(output.confidence * 100)}%</span>
                          )}
                          <Badge variant={output.approved ? "default" : "secondary"}>
                            {output.approved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{output.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
