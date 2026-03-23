import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("-------- Seeding Mars Shot CRM --------");

  // Clean up existing data (order matters for FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.aIOutput.deleteMany();
  await prisma.termSheetRevision.deleteMany();
  await prisma.termSheet.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.founder.deleteMany();
  await prisma.boardNote.deleteMany();
  await prisma.followOnRound.deleteMany();
  await prisma.kpiSnapshot.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.portfolioCompany.deleteMany();
  await prisma.contact.deleteMany();
  console.log("✓ Cleaned existing data");

  // 1. Create Users
  const vp = await prisma.user.upsert({
    where: { email: "vp@marsshot.vc" },
    update: {},
    create: {
      email: "vp@marsshot.vc",
      name: "Mars Shot VP",
      isAdmin: true,
    },
  });
  console.log("✓ User created:", vp.email);

  // 2. Create Deals across all pipeline stages
  const deals = [
    {
      companyName: "PayFlow AI",
      website: "https://payflow.ai",
      sector: "FINTECH" as const,
      fundingStage: "PRE_SEED" as const,
      chequeSize: 50000,
      source: "Nikhil Kamath",
      sourceType: "VC_FORWARD" as const,
      stage: "SCREENING" as const,
      status: "ACTIVE" as const,
      ingestionChannel: "EMAIL" as const,
      sectorFit: true,
      stageFit: true,
      chequeFit: true,
      razorpayRelevance: true,
      founderBackground: "Ex-Stripe engineer, IIT-B CS 2018",
      aiConfidence: 0.92,
      founders: [
        { name: "Arjun Mehta", email: "arjun@payflow.ai", phone: "+91-98765-43210", linkedin: "https://linkedin.com/in/arjunmehta", title: "CEO" },
        { name: "Priya Sharma", email: "priya@payflow.ai", title: "CTO" },
      ],
    },
    {
      companyName: "NutriScan",
      website: "https://nutriscan.in",
      sector: "HEALTHTECH" as const,
      fundingStage: "SEED" as const,
      chequeSize: 75000,
      source: "Inbound — YC Demo Day",
      sourceType: "INBOUND" as const,
      stage: "INTRO_CALL" as const,
      status: "ACTIVE" as const,
      ingestionChannel: "WEB" as const,
      sectorFit: true,
      stageFit: true,
      chequeFit: true,
      razorpayRelevance: false,
      founderBackground: "Doctor + ML researcher, Stanford postdoc",
      callNotes: "Great founding team. Doctor-led, strong ML background. Product is a nutrition scanner app using computer vision. 50K MAU, $8K MRR.",
      founderEmailConfirmed: true,
      aiConfidence: 0.87,
      founders: [
        { name: "Dr. Kavya Reddy", email: "kavya@nutriscan.in", phone: "+91-87654-32109", title: "CEO & Co-founder" },
      ],
    },
    {
      companyName: "BuildStack",
      website: "https://buildstack.dev",
      sector: "SAAS" as const,
      fundingStage: "PRE_SEED" as const,
      chequeSize: 25000,
      source: "Shashank Kumar (Razorpay)",
      sourceType: "RAZORPAY_NETWORK" as const,
      stage: "PARTNER_GUT_CHECK" as const,
      status: "ACTIVE" as const,
      ingestionChannel: "WHATSAPP" as const,
      sectorFit: true,
      stageFit: true,
      chequeFit: true,
      razorpayRelevance: true,
      founderBackground: "Razorpay ex-engineering lead, 8yr SaaS experience",
      callNotes: "Dev tools for construction companies. Niche but large TAM in India. Founder has deep domain knowledge.",
      founderEmailConfirmed: true,
      onePagerApproved: true,
      partnerNotified: true,
      aiConfidence: 0.95,
      founders: [
        { name: "Rahul Desai", email: "rahul@buildstack.dev", linkedin: "https://linkedin.com/in/rahuldesai", title: "Founder" },
      ],
    },
    {
      companyName: "Lingua Labs",
      website: "https://lingualabs.co",
      sector: "AI" as const,
      fundingStage: "SEED" as const,
      chequeSize: 100000,
      source: "Sequoia scout",
      sourceType: "VC_FORWARD" as const,
      stage: "ACTIVE_DD" as const,
      status: "ACTIVE" as const,
      ingestionChannel: "EMAIL" as const,
      sectorFit: true,
      stageFit: true,
      chequeFit: true,
      razorpayRelevance: false,
      founderBackground: "Ex-Google Brain, published NeurIPS papers, IIT-D",
      callNotes: "AI translation API. 200+ enterprise customers. $45K MRR. Gross margin 78%.",
      founderEmailConfirmed: true,
      onePagerApproved: true,
      partnerNotified: true,
      ddChecklistStarted: true,
      aiConfidence: 0.91,
      founders: [
        { name: "Vikram Iyer", email: "vikram@lingualabs.co", title: "CEO" },
        { name: "Ananya Das", email: "ananya@lingualabs.co", title: "CTO" },
      ],
    },
    {
      companyName: "QuickShip",
      website: "https://quickship.io",
      sector: "D2C" as const,
      fundingStage: "PRE_SEED" as const,
      chequeSize: 40000,
      source: "Cold DM on Twitter",
      sourceType: "COLD_DM" as const,
      stage: "RADAR" as const,
      status: "DRAFT" as const,
      ingestionChannel: "TELEGRAM" as const,
      aiConfidence: 0.73,
      rawIngestionText: "QuickShip - D2C logistics platform, pre-seed, looking for $40K. Founded by ex-Delhivery ops lead. Telegram forward from founder.",
      founders: [
        { name: "Siddharth Jain", email: "sid@quickship.io", title: "Founder" },
      ],
    },
    {
      companyName: "CredStack",
      website: "https://credstack.com",
      sector: "FINTECH" as const,
      fundingStage: "SEED" as const,
      chequeSize: 60000,
      source: "Harshil Mathur (Razorpay)",
      sourceType: "RAZORPAY_NETWORK" as const,
      stage: "PARTNER_REVIEW" as const,
      status: "ACTIVE" as const,
      ingestionChannel: "WEB" as const,
      sectorFit: true,
      stageFit: true,
      chequeFit: true,
      razorpayRelevance: true,
      founderBackground: "CRED ex-product head, built lending vertical from 0→1",
      callNotes: "Credit scoring for SMBs using GST + bank statement data. 500+ SMBs onboarded. Strong Razorpay merchant overlap.",
      founderEmailConfirmed: true,
      onePagerApproved: true,
      partnerNotified: true,
      ddChecklistStarted: true,
      partnerBriefUploaded: true,
      aiConfidence: 0.94,
      founders: [
        { name: "Meera Nair", email: "meera@credstack.com", phone: "+91-76543-21098", title: "CEO" },
        { name: "Rohan Gupta", email: "rohan@credstack.com", title: "CTO" },
      ],
    },
    {
      companyName: "FarmConnect",
      website: "https://farmconnect.ag",
      sector: "OTHER" as const,
      fundingStage: "PRE_SEED" as const,
      chequeSize: 30000,
      source: "Angel network",
      sourceType: "INBOUND" as const,
      stage: "SCREENING" as const,
      status: "PASSED" as const,
      ingestionChannel: "WEB" as const,
      sectorFit: false,
      stageFit: true,
      chequeFit: true,
      razorpayRelevance: false,
      founderBackground: "Agritech background, IIM-A MBA",
      aiConfidence: 0.81,
      founders: [
        { name: "Amit Patel", email: "amit@farmconnect.ag", title: "Founder" },
      ],
    },
    {
      companyName: "CloudKitchen OS",
      website: "https://cloudkitchenos.com",
      sector: "CONSUMER" as const,
      fundingStage: "PRE_SEED" as const,
      chequeSize: 50000,
      source: "Matrix Partners scout",
      sourceType: "VC_FORWARD" as const,
      stage: "DEAL_SOURCE" as const,
      status: "ACTIVE" as const,
      ingestionChannel: "EMAIL" as const,
      aiConfidence: 0.65,
      rawIngestionText: "Cloud kitchen management SaaS. Pre-seed. Ex-Swiggy founding team. Matrix scout intro.",
      founders: [
        { name: "Deepak Rao", email: "deepak@ckos.com", title: "CEO" },
      ],
    },
  ];

  for (const dealData of deals) {
    const { founders, ...dealFields } = dealData;

    // Set SLA timestamps
    const stageEnteredAt = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000); // 0-3 days ago
    const slaHoursMap: Record<string, number | null> = {
      DEAL_SOURCE: null,
      RADAR: 24,
      SCREENING: 48,
      INTRO_CALL: 120,
      PARTNER_GUT_CHECK: 72,
      ACTIVE_DD: 336,
      PARTNER_REVIEW: 168,
      DECISION: 48,
    };
    const slaHours = slaHoursMap[dealFields.stage];
    const slaDueAt = slaHours
      ? new Date(stageEnteredAt.getTime() + slaHours * 60 * 60 * 1000)
      : null;

    const deal = await prisma.deal.create({
      data: {
        ...dealFields,
        stageEnteredAt,
        slaDueAt,
        founders: {
          create: founders,
        },
      },
    });
    console.log(`✓ Deal: ${deal.companyName} (${deal.stage})`);
  }

  // 3. Create Portfolio Companies (closed-won deals)
  const portfolioCompanies = [
    {
      companyName: "RapidPay",
      sector: "FINTECH" as const,
      website: "https://rapidpay.in",
      chequeAmount: 75000,
      dateInvested: new Date("2024-06-15"),
      fundingStage: "SEED" as const,
      founderName: "Karan Bhatia",
      founderEmail: "karan@rapidpay.in",
      founderPhone: "+91-99887-76655",
      entryValuation: 3000000,
      ownershipPct: 2.5,
      currentValuation: 8000000,
      proRataRights: true,
      boardSeat: false,
      healthStatus: "ON_TRACK" as const,
      nextMilestone: "Close Series A by Q2 2026",
      coInvestors: ["Sequoia Capital India", "Kalaari Capital"],
    },
    {
      companyName: "StyleAI",
      sector: "AI" as const,
      website: "https://styleai.fashion",
      chequeAmount: 50000,
      dateInvested: new Date("2024-09-01"),
      fundingStage: "PRE_SEED" as const,
      founderName: "Sneha Verma",
      founderEmail: "sneha@styleai.fashion",
      entryValuation: 2000000,
      ownershipPct: 2.5,
      currentValuation: 2500000,
      proRataRights: false,
      boardSeat: false,
      healthStatus: "WATCH" as const,
      nextMilestone: "Hit 10K DAU by Apr 2026",
      coInvestors: ["Y Combinator"],
    },
    {
      companyName: "DataMesh",
      sector: "SAAS" as const,
      website: "https://datamesh.io",
      chequeAmount: 100000,
      dateInvested: new Date("2024-03-20"),
      fundingStage: "SEED" as const,
      founderName: "Aditya Kulkarni",
      founderEmail: "aditya@datamesh.io",
      founderPhone: "+91-88776-65544",
      entryValuation: 5000000,
      ownershipPct: 2.0,
      currentValuation: 12000000,
      proRataRights: true,
      boardSeat: true,
      healthStatus: "ON_TRACK" as const,
      nextMilestone: "Series A close — term sheet from Accel",
      coInvestors: ["Accel Partners", "Kalaari Capital"],
    },
    {
      companyName: "HealthBridge",
      sector: "HEALTHTECH" as const,
      website: "https://healthbridge.care",
      chequeAmount: 40000,
      dateInvested: new Date("2025-01-10"),
      fundingStage: "PRE_SEED" as const,
      founderName: "Dr. Rishi Aggarwal",
      founderEmail: "rishi@healthbridge.care",
      entryValuation: 1500000,
      ownershipPct: 2.67,
      currentValuation: 1500000,
      proRataRights: false,
      boardSeat: false,
      healthStatus: "AT_RISK" as const,
      nextMilestone: "Secure pilot with Apollo Hospitals",
      coInvestors: [],
    },
    {
      companyName: "SupplyLens",
      sector: "SAAS" as const,
      website: "https://supplylens.co",
      chequeAmount: 60000,
      dateInvested: new Date("2024-11-05"),
      fundingStage: "SEED" as const,
      founderName: "Pooja Menon",
      founderEmail: "pooja@supplylens.co",
      entryValuation: 4000000,
      ownershipPct: 1.5,
      currentValuation: 6000000,
      proRataRights: true,
      boardSeat: false,
      healthStatus: "ON_TRACK" as const,
      nextMilestone: "Expand to 3 new enterprise clients",
      coInvestors: ["Stellaris Venture Partners"],
    },
  ];

  for (const pc of portfolioCompanies) {
    const company = await prisma.portfolioCompany.create({ data: pc });
    console.log(`✓ Portfolio: ${company.companyName}`);

    // Add a follow-on round to some
    if (pc.companyName === "RapidPay") {
      await prisma.followOnRound.create({
        data: {
          portfolioCompanyId: company.id,
          roundName: "Series A",
          amount: 5000000,
          leadInvestor: "Sequoia Capital India",
          marsShotParticipated: false,
          date: new Date("2025-02-01"),
        },
      });
      console.log("  ✓ Follow-on: RapidPay Series A");
    }
    if (pc.companyName === "DataMesh") {
      await prisma.followOnRound.create({
        data: {
          portfolioCompanyId: company.id,
          roundName: "Seed Extension",
          amount: 500000,
          leadInvestor: "Accel Partners",
          marsShotParticipated: true,
          date: new Date("2025-01-15"),
        },
      });
      console.log("  ✓ Follow-on: DataMesh Seed Extension");
    }

    // Add KPI snapshots for companies with operating metrics
    const kpiData: Record<string, Array<{ month: string; mrr?: number; arr?: number; burnRate?: number; runway?: number; headcount?: number; customers?: number }>> = {
      RapidPay: [
        { month: "2025-10", mrr: 18000, arr: 216000, burnRate: 45000, runway: 14, headcount: 12, customers: 85 },
        { month: "2025-11", mrr: 22000, arr: 264000, burnRate: 48000, runway: 13, headcount: 14, customers: 102 },
        { month: "2025-12", mrr: 26000, arr: 312000, burnRate: 50000, runway: 12, headcount: 15, customers: 118 },
        { month: "2026-01", mrr: 31000, arr: 372000, burnRate: 52000, runway: 11, headcount: 16, customers: 140 },
        { month: "2026-02", mrr: 35000, arr: 420000, burnRate: 55000, runway: 10, headcount: 18, customers: 158 },
        { month: "2026-03", mrr: 40000, arr: 480000, burnRate: 58000, runway: 9, headcount: 19, customers: 175 },
      ],
      DataMesh: [
        { month: "2025-10", mrr: 45000, arr: 540000, burnRate: 80000, runway: 10, headcount: 22, customers: 35 },
        { month: "2025-11", mrr: 52000, arr: 624000, burnRate: 82000, runway: 10, headcount: 24, customers: 38 },
        { month: "2025-12", mrr: 58000, arr: 696000, burnRate: 85000, runway: 9, headcount: 25, customers: 42 },
        { month: "2026-01", mrr: 65000, arr: 780000, burnRate: 88000, runway: 9, headcount: 26, customers: 46 },
        { month: "2026-02", mrr: 72000, arr: 864000, burnRate: 90000, runway: 8, headcount: 28, customers: 50 },
        { month: "2026-03", mrr: 78000, arr: 936000, burnRate: 92000, runway: 8, headcount: 30, customers: 54 },
      ],
      HealthBridge: [
        { month: "2025-10", mrr: 800, burnRate: 15000, runway: 4, headcount: 4, customers: 3 },
        { month: "2025-11", mrr: 900, burnRate: 16000, runway: 3.5, headcount: 4, customers: 3 },
        { month: "2025-12", mrr: 1100, burnRate: 17000, runway: 3, headcount: 5, customers: 4 },
        { month: "2026-01", mrr: 1200, burnRate: 18000, runway: 2.5, headcount: 5, customers: 5 },
        { month: "2026-02", mrr: 1400, burnRate: 18500, runway: 2, headcount: 5, customers: 5 },
        { month: "2026-03", mrr: 1500, burnRate: 19000, runway: 1.5, headcount: 5, customers: 6 },
      ],
      SupplyLens: [
        { month: "2025-12", mrr: 12000, arr: 144000, burnRate: 35000, runway: 8, headcount: 9, customers: 12 },
        { month: "2026-01", mrr: 14000, arr: 168000, burnRate: 36000, runway: 8, headcount: 10, customers: 14 },
        { month: "2026-02", mrr: 16000, arr: 192000, burnRate: 38000, runway: 7, headcount: 10, customers: 15 },
        { month: "2026-03", mrr: 18000, arr: 216000, burnRate: 40000, runway: 7, headcount: 11, customers: 17 },
      ],
      StyleAI: [
        { month: "2026-01", mrr: 2000, burnRate: 20000, runway: 5, headcount: 6, customers: 15 },
        { month: "2026-02", mrr: 2200, burnRate: 21000, runway: 4.5, headcount: 6, customers: 18 },
        { month: "2026-03", mrr: 2500, burnRate: 22000, runway: 4, headcount: 7, customers: 22 },
      ],
    };

    const snapshots = kpiData[pc.companyName];
    if (snapshots) {
      for (const snap of snapshots) {
        await prisma.kpiSnapshot.create({
          data: {
            portfolioCompanyId: company.id,
            periodDate: new Date(`${snap.month}-01T00:00:00Z`),
            mrr: snap.mrr,
            arr: snap.arr,
            burnRate: snap.burnRate,
            runway: snap.runway,
            headcount: snap.headcount,
            customers: snap.customers,
          },
        });
      }
      console.log(`  ✓ KPI snapshots: ${pc.companyName} (${snapshots.length} months)`);
    }
  }

  // 4. Create Ecosystem Contacts
  const contacts = [
    {
      name: "Nikhil Kamath",
      email: "nikhil@zerodha.com",
      organization: "Zerodha / Gruhas",
      type: "CO_INVESTOR" as const,
      warmthScore: "HOT" as const,
      lastInteractionAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      interactionCount: 12,
      sectorExpertise: ["FINTECH", "D2C"],
      dealSourceCount: 3,
    },
    {
      name: "Rajan Anandan",
      email: "rajan@peakxv.com",
      organization: "Peak XV Partners",
      type: "VC" as const,
      warmthScore: "HOT" as const,
      lastInteractionAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      interactionCount: 8,
      sectorExpertise: ["SAAS", "AI"],
      dealSourceCount: 2,
    },
    {
      name: "Kunal Shah",
      email: "kunal@cred.club",
      organization: "CRED",
      type: "OPERATOR" as const,
      warmthScore: "WARM" as const,
      lastInteractionAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      interactionCount: 5,
      sectorExpertise: ["FINTECH", "CONSUMER"],
      dealSourceCount: 1,
    },
    {
      name: "Anupam Mittal",
      email: "anupam@shaadi.com",
      organization: "Shaadi.com / People Group",
      type: "CO_INVESTOR" as const,
      warmthScore: "WARM" as const,
      lastInteractionAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      interactionCount: 4,
      sectorExpertise: ["CONSUMER", "D2C"],
      dealSourceCount: 0,
    },
    {
      name: "Alok Goyal",
      email: "alok@stellaris.vc",
      organization: "Stellaris Venture Partners",
      type: "VC" as const,
      warmthScore: "COLD" as const,
      lastInteractionAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      interactionCount: 2,
      sectorExpertise: ["SAAS"],
      dealSourceCount: 0,
    },
    {
      name: "Vani Kola",
      email: "vani@kalaari.com",
      organization: "Kalaari Capital",
      type: "VC" as const,
      warmthScore: "HOT" as const,
      lastInteractionAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      interactionCount: 15,
      sectorExpertise: ["HEALTHTECH", "AI", "SAAS"],
      coInvestmentHistory: "Co-invested in DataMesh seed round",
      dealSourceCount: 4,
    },
    {
      name: "Ashish Hemrajani",
      email: "ashish@bigtree.in",
      organization: "BigTree Entertainment (BookMyShow)",
      type: "OPERATOR" as const,
      warmthScore: "COLD" as const,
      lastInteractionAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      interactionCount: 1,
      sectorExpertise: ["CONSUMER"],
      dealSourceCount: 0,
    },
    {
      name: "Nandan Nilekani",
      email: "nandan@fundamentum.in",
      organization: "Fundamentum Partnership",
      type: "ADVISOR" as const,
      warmthScore: "WARM" as const,
      lastInteractionAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      interactionCount: 3,
      sectorExpertise: ["FINTECH", "SAAS", "AI"],
      dealSourceCount: 1,
    },
  ];

  for (const contactData of contacts) {
    const contact = await prisma.contact.create({ data: contactData });
    console.log(`✓ Contact: ${contact.name} (${contact.warmthScore})`);
  }

  // 5. Create rich Activities for ALL deals
  const allDeals = await prisma.deal.findMany({ include: { founders: true } });
  const dealsByName: Record<string, typeof allDeals[0]> = {};
  for (const d of allDeals) dealsByName[d.companyName] = d;

  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

  // Activities per deal — realistic VC workflow
  const dealActivities: { dealName: string; activities: { type: string; title: string; description: string; createdAt: Date }[] }[] = [
    {
      dealName: "PayFlow AI",
      activities: [
        { type: "DEAL_CREATED", title: "Deal ingested from email forward", description: "Nikhil Kamath forwarded PayFlow AI pitch deck via email. Auto-extracted by AI with 92% confidence.", createdAt: daysAgo(14) },
        { type: "STAGE_CHANGE", title: "Moved to Radar", description: "PayFlow AI moved from Deal Source to Radar for initial review.", createdAt: daysAgo(13) },
        { type: "NOTE", title: "Initial review note", description: "Payments infra play — interesting angle on UPI reconciliation for SMBs. Founder is ex-Stripe, strong technical background. Worth screening.", createdAt: daysAgo(12) },
        { type: "STAGE_CHANGE", title: "Moved to Screening", description: "PayFlow AI advanced to Screening. All radar criteria met.", createdAt: daysAgo(10) },
        { type: "DOCUMENT_UPLOADED", title: "Pitch deck uploaded", description: "PayFlow AI pitch deck (v2, March 2026) uploaded — 18 slides covering problem, solution, TAM, traction, team.", createdAt: daysAgo(9) },
        { type: "NOTE", title: "Screening checklist completed", description: "Sector fit: ✅ Fintech/payments. Stage fit: ✅ Pre-seed. Cheque fit: ✅ $50K. Razorpay relevance: ✅ UPI infra overlap. Founder: Ex-Stripe, IIT-B.", createdAt: daysAgo(8) },
        { type: "EMAIL_SENT", title: "Screening pass email sent", description: "Sent screening pass email to Arjun Mehta (arjun@payflow.ai). Requesting intro call availability.", createdAt: daysAgo(7) },
      ],
    },
    {
      dealName: "NutriScan",
      activities: [
        { type: "DEAL_CREATED", title: "Deal sourced from YC Demo Day", description: "Inbound from YC W26 Demo Day. NutriScan — nutrition scanner using computer vision. Doctor-led founding team.", createdAt: daysAgo(21) },
        { type: "STAGE_CHANGE", title: "Moved to Radar", description: "NutriScan moved to Radar after YC Demo Day triage.", createdAt: daysAgo(20) },
        { type: "NOTE", title: "YC batch notes", description: "Strong YC batch company. Dr. Kavya Reddy — Stanford postdoc in ML, practicing physician. Product has 50K MAU and $8K MRR. Unusual for pre-revenue healthtech to have this traction.", createdAt: daysAgo(19) },
        { type: "STAGE_CHANGE", title: "Moved to Screening", description: "Advanced to Screening. Healthtech thesis alignment confirmed.", createdAt: daysAgo(17) },
        { type: "DOCUMENT_UPLOADED", title: "YC one-pager uploaded", description: "NutriScan YC one-pager with key metrics: 50K MAU, $8K MRR, 15% MoM growth, 72% D7 retention.", createdAt: daysAgo(16) },
        { type: "STAGE_CHANGE", title: "Moved to Intro Call", description: "Screening complete. All criteria met except Razorpay relevance (N/A for healthtech). Scheduling intro call.", createdAt: daysAgo(14) },
        { type: "EMAIL_SENT", title: "Intro call booking sent", description: "Sent intro call invite to Dr. Kavya Reddy for 30-min Google Meet.", createdAt: daysAgo(13) },
        { type: "CALL_COMPLETED", title: "Intro call completed", description: "45-min call with Dr. Kavya Reddy. Impressive domain depth. Product roadmap includes B2B API for health insurers. Discussed $75K cheque at seed.", createdAt: daysAgo(10) },
        { type: "NOTE", title: "Post-call assessment", description: "Strong conviction. Founder is rare combo of medical + ML expertise. Revenue growing, retention is excellent. Risk: crowded nutrition app space, but B2B pivot is differentiated. Recommend advancing.", createdAt: daysAgo(9) },
      ],
    },
    {
      dealName: "BuildStack",
      activities: [
        { type: "DEAL_CREATED", title: "Deal forwarded via WhatsApp", description: "Shashank Kumar (Razorpay) forwarded BuildStack founder intro via WhatsApp. Construction-tech dev tools.", createdAt: daysAgo(28) },
        { type: "STAGE_CHANGE", title: "Moved to Radar", description: "BuildStack moved to Radar. Razorpay network referral — high signal.", createdAt: daysAgo(27) },
        { type: "NOTE", title: "Razorpay network signal", description: "Rahul Desai was engineering lead at Razorpay for 4 years. Shashank personally vouches. Deep SaaS expertise, now building dev tools for construction cos.", createdAt: daysAgo(26) },
        { type: "STAGE_CHANGE", title: "Moved to Screening", description: "Advanced to Screening based on strong referral and founder profile.", createdAt: daysAgo(24) },
        { type: "STAGE_CHANGE", title: "Moved to Intro Call", description: "Screening passed. All four criteria met including Razorpay relevance.", createdAt: daysAgo(20) },
        { type: "CALL_COMPLETED", title: "Intro call completed", description: "30-min call with Rahul Desai. Niche but large TAM — India construction is $600B. Product: API-first tools for project management, billing, compliance.", createdAt: daysAgo(17) },
        { type: "DOCUMENT_UPLOADED", title: "One-pager uploaded", description: "BuildStack one-pager approved. Key metrics: 12 paying customers, $3K MRR, 0% churn (sticky enterprise contracts).", createdAt: daysAgo(15) },
        { type: "STAGE_CHANGE", title: "Moved to Partner Gut-Check", description: "One-pager approved. Partner notified for gut-check. Strong Razorpay network deal.", createdAt: daysAgo(12) },
        { type: "NOTE", title: "Partner gut-check notes", description: "Partners reviewed. Consensus: niche but defensible. Construction-tech is underserved in India. Founder has right background. Proceed to DD if cheque size works at $25K.", createdAt: daysAgo(8) },
      ],
    },
    {
      dealName: "Lingua Labs",
      activities: [
        { type: "DEAL_CREATED", title: "Deal forwarded by Sequoia scout", description: "Sequoia scout referred Lingua Labs — AI translation API. Ex-Google Brain founders.", createdAt: daysAgo(35) },
        { type: "STAGE_CHANGE", title: "Moved to Radar", description: "Lingua Labs moved to Radar. High-quality VC forward from Sequoia network.", createdAt: daysAgo(34) },
        { type: "STAGE_CHANGE", title: "Moved to Screening", description: "Quick screening advancement — AI sector, strong founders, $100K cheque.", createdAt: daysAgo(32) },
        { type: "NOTE", title: "Founder deep-dive", description: "Vikram Iyer: ex-Google Brain, 3 NeurIPS papers, IIT-D gold medalist. Ananya Das: ex-DeepMind, PhD NLP from CMU. World-class AI founding team.", createdAt: daysAgo(31) },
        { type: "STAGE_CHANGE", title: "Moved to Intro Call", description: "Screening complete. Fast-tracked due to competitive round — Sequoia, Matrix also looking.", createdAt: daysAgo(29) },
        { type: "CALL_COMPLETED", title: "Intro call completed", description: "60-min deep call with both founders. Product: AI translation API supporting 40 Indic languages. 200+ enterprise customers. $45K MRR, 78% gross margin. Raised from angels, now doing seed.", createdAt: daysAgo(25) },
        { type: "DOCUMENT_UPLOADED", title: "Pitch deck uploaded", description: "Lingua Labs seed pitch deck — 22 slides. Impressive enterprise logos: Flipkart, Meesho, PhonePe using the API.", createdAt: daysAgo(24) },
        { type: "STAGE_CHANGE", title: "Moved to Partner Gut-Check", description: "Strong intro call. One-pager drafted and approved. Partners notified.", createdAt: daysAgo(22) },
        { type: "NOTE", title: "Competitive dynamics", description: "Round is competitive — Sequoia leading at $8M pre-money. We can get $100K allocation as co-investor. Need to move fast.", createdAt: daysAgo(20) },
        { type: "STAGE_CHANGE", title: "Moved to Active DD", description: "Partner gut-check passed unanimously. DD checklist started. Scheduling technical deep-dive with CTO.", createdAt: daysAgo(16) },
        { type: "DOCUMENT_UPLOADED", title: "Technical DD report draft", description: "Initial technical DD: API architecture review, latency benchmarks, model evaluation. Strong technical moat — proprietary Indic language models.", createdAt: daysAgo(10) },
        { type: "NOTE", title: "Customer reference calls", description: "Completed 3 customer reference calls (Flipkart PM, Meesho CTO, PhonePe product lead). All extremely positive. Translation accuracy 40% better than Google Translate for Indic languages.", createdAt: daysAgo(7) },
        { type: "NOTE", title: "Financial DD update", description: "Revenue growing 25% MoM. Net revenue retention 135%. CAC payback < 3 months. Unit economics are strong. No red flags in financial DD.", createdAt: daysAgo(4) },
      ],
    },
    {
      dealName: "QuickShip",
      activities: [
        { type: "DEAL_CREATED", title: "Deal ingested from Telegram forward", description: "Telegram forward from founder. QuickShip — D2C logistics platform. Ex-Delhivery ops lead. Auto-extracted with 73% confidence.", createdAt: daysAgo(5) },
        { type: "NOTE", title: "AI extraction review needed", description: "Lower confidence extraction (73%). Raw text captured. Needs manual review — founder details and metrics may be incomplete.", createdAt: daysAgo(5) },
        { type: "STAGE_CHANGE", title: "Moved to Radar", description: "QuickShip moved to Radar for initial triage. D2C logistics is interesting but crowded space.", createdAt: daysAgo(3) },
        { type: "NOTE", title: "Initial assessment", description: "Siddharth Jain — 6 years at Delhivery, led last-mile ops for South India. Now building logistics aggregator for D2C brands. Pre-revenue, has LOIs from 5 D2C brands.", createdAt: daysAgo(2) },
      ],
    },
    {
      dealName: "CredStack",
      activities: [
        { type: "DEAL_CREATED", title: "Deal sourced via Razorpay network", description: "Harshil Mathur (Razorpay CEO) personally introduced CredStack. SMB credit scoring using alternative data.", createdAt: daysAgo(42) },
        { type: "STAGE_CHANGE", title: "Moved to Radar", description: "CredStack moved to Radar. Direct intro from Harshil — highest-signal referral.", createdAt: daysAgo(41) },
        { type: "STAGE_CHANGE", title: "Moved to Screening", description: "Fast-tracked to Screening. Razorpay network + fintech thesis alignment.", createdAt: daysAgo(39) },
        { type: "NOTE", title: "Founder background", description: "Meera Nair: ex-CRED product head, built lending vertical from 0→1. Rohan Gupta: ex-Razorpay senior engineer, built payment gateway. Power duo.", createdAt: daysAgo(38) },
        { type: "STAGE_CHANGE", title: "Moved to Intro Call", description: "All screening criteria met. Strong Razorpay relevance — merchant data overlap.", createdAt: daysAgo(35) },
        { type: "CALL_COMPLETED", title: "Intro call completed", description: "45-min call with Meera and Rohan. Credit scoring for SMBs using GST + bank statement data. 500+ SMBs onboarded. Razorpay merchant overlap is huge — potential distribution channel.", createdAt: daysAgo(30) },
        { type: "DOCUMENT_UPLOADED", title: "Pitch deck and financial model uploaded", description: "Uploaded pitch deck (16 slides) and detailed financial model with 3-year projections.", createdAt: daysAgo(28) },
        { type: "STAGE_CHANGE", title: "Moved to Partner Gut-Check", description: "One-pager approved. Strong fintech thesis fit. Notifying partners.", createdAt: daysAgo(25) },
        { type: "STAGE_CHANGE", title: "Moved to Active DD", description: "Partner gut-check passed. Starting due diligence. Key areas: credit model accuracy, regulatory compliance, Razorpay integration feasibility.", createdAt: daysAgo(20) },
        { type: "NOTE", title: "DD progress — credit model review", description: "Reviewed credit scoring model with independent data scientist. Default prediction accuracy: 89% (vs industry avg 72%). Uses GST filing patterns, bank statement velocity, and UPI transaction graphs.", createdAt: daysAgo(15) },
        { type: "DOCUMENT_UPLOADED", title: "Partner brief uploaded", description: "Comprehensive partner brief uploaded: market sizing ($12B TAM), competitive landscape, unit economics, risk matrix, and recommendation.", createdAt: daysAgo(12) },
        { type: "STAGE_CHANGE", title: "Moved to Partner Review", description: "DD complete. Partner brief uploaded. Scheduling partner review meeting.", createdAt: daysAgo(10) },
        { type: "NOTE", title: "Term sheet drafted", description: "Drafted term sheet: $3M pre-money valuation, $60K cheque, 2% equity, 1x non-participating liquidation preference, pro-rata rights.", createdAt: daysAgo(8) },
        { type: "NOTE", title: "Founder negotiation", description: "Meera countered at $3.5M valuation. We met in the middle — $3M with better pro-rata terms. Version 2 of term sheet shared.", createdAt: daysAgo(5) },
      ],
    },
    {
      dealName: "FarmConnect",
      activities: [
        { type: "DEAL_CREATED", title: "Inbound deal from angel network", description: "FarmConnect submitted via web form. Agritech marketplace connecting farmers to retailers.", createdAt: daysAgo(18) },
        { type: "STAGE_CHANGE", title: "Moved to Radar", description: "FarmConnect moved to Radar for initial assessment.", createdAt: daysAgo(17) },
        { type: "STAGE_CHANGE", title: "Moved to Screening", description: "Advanced to Screening. Founder has IIM-A MBA, interesting agritech angle.", createdAt: daysAgo(15) },
        { type: "NOTE", title: "Screening assessment — sector mismatch", description: "Sector fit: ❌ Agritech doesn't align with current fund thesis (fintech, SaaS, AI, healthtech). Stage fit: ✅. Cheque fit: ✅. Good founder but wrong sector for us.", createdAt: daysAgo(13) },
        { type: "STAGE_CHANGE", title: "Deal passed", description: "Passed on FarmConnect. Sector doesn't align with fund thesis. Shared feedback with founder and offered to intro to Omnivore Partners (agritech-focused fund).", createdAt: daysAgo(12) },
        { type: "EMAIL_SENT", title: "Pass email sent with warm intro", description: "Sent polite pass to Amit Patel. Offered warm intro to Omnivore Partners and Agfunder — better thesis fit.", createdAt: daysAgo(12) },
      ],
    },
    {
      dealName: "CloudKitchen OS",
      activities: [
        { type: "DEAL_CREATED", title: "Deal forwarded by Matrix Partners scout", description: "Matrix Partners scout sent CloudKitchen OS intro via email. Cloud kitchen management SaaS by ex-Swiggy founding team.", createdAt: hoursAgo(12) },
        { type: "NOTE", title: "Initial triage note", description: "Interesting lead. Deepak Rao was part of Swiggy's founding team (employee #8), ran kitchen ops. Cloud kitchen SaaS is a growing space — Rebel Foods, Curefoods all need better tooling. Pre-seed, $50K ask. Need to review deck.", createdAt: hoursAgo(10) },
        { type: "NOTE", title: "AI extraction review", description: "AI confidence: 65% — lower than usual. Raw ingestion text was brief. Manually verified company name, sector (Consumer), funding stage (Pre-seed), and cheque size ($50K). Need pitch deck for fuller picture.", createdAt: hoursAgo(8) },
      ],
    },
  ];

  for (const { dealName, activities } of dealActivities) {
    const deal = dealsByName[dealName];
    if (!deal) continue;
    for (const act of activities) {
      await prisma.activity.create({
        data: {
          type: act.type,
          title: act.title,
          description: act.description,
          createdAt: act.createdAt,
          dealId: deal.id,
          userId: vp.id,
        },
      });
    }
  }
  console.log(`✓ Deal activities created for ${dealActivities.length} deals`);

  // 5b. Create Activities for Portfolio Companies
  const allPortfolio = await prisma.portfolioCompany.findMany();
  const portfolioByName: Record<string, typeof allPortfolio[0]> = {};
  for (const p of allPortfolio) portfolioByName[p.companyName] = p;

  const portfolioActivities: { companyName: string; activities: { type: string; title: string; description: string; createdAt: Date }[] }[] = [
    {
      companyName: "RapidPay",
      activities: [
        { type: "INVESTMENT", title: "Initial investment closed", description: "Invested $75K in RapidPay seed round. Payment processing for SMBs.", createdAt: new Date("2024-06-15") },
        { type: "BOARD_MEETING", title: "Q3 2024 board meeting", description: "Revenue at $120K ARR. 450 merchants onboarded. Burn rate healthy at $25K/month. Discussed Series A timeline.", createdAt: new Date("2024-09-20") },
        { type: "MILESTONE", title: "Hit 1,000 merchants", description: "RapidPay crossed 1,000 active merchants. Processing $2M TPV monthly.", createdAt: new Date("2024-11-15") },
        { type: "FOLLOW_ON", title: "Series A raised — Sequoia led", description: "RapidPay closed $5M Series A led by Sequoia Capital India. Mars Shot did not participate (pro-rata waived). 20x markup from seed.", createdAt: new Date("2025-02-01") },
        { type: "BOARD_MEETING", title: "Q1 2025 board meeting", description: "Post Series A: $450K ARR, 2,200 merchants. Hiring aggressively — team growing from 12 to 30. Expanding to 3 new cities.", createdAt: new Date("2025-03-15") },
        { type: "NOTE", title: "Quarterly check-in with Karan", description: "Karan reports strong growth. Targeting $1M ARR by EOY. Exploring embedded lending product. Sequoia very supportive.", createdAt: daysAgo(15) },
      ],
    },
    {
      companyName: "StyleAI",
      activities: [
        { type: "INVESTMENT", title: "Initial investment closed", description: "Invested $50K in StyleAI pre-seed. AI-powered fashion recommendation engine.", createdAt: new Date("2024-09-01") },
        { type: "NOTE", title: "Product launch review", description: "StyleAI launched on Product Hunt — #3 product of the day. 5K signups in first week. Good early signal.", createdAt: new Date("2024-10-15") },
        { type: "MILESTONE", title: "First enterprise contract", description: "Signed first enterprise deal with Myntra for AI styling recommendations. $15K annual contract.", createdAt: new Date("2025-01-10") },
        { type: "NOTE", title: "Monthly check-in", description: "Sneha is navigating competitive landscape well. Differentiator is Indic body-type models. Exploring seed raise for Q2 2025.", createdAt: daysAgo(20) },
      ],
    },
    {
      companyName: "DataMesh",
      activities: [
        { type: "INVESTMENT", title: "Initial investment closed", description: "Invested $100K in DataMesh seed round. Data integration platform for mid-market companies.", createdAt: new Date("2024-03-20") },
        { type: "BOARD_MEETING", title: "Q2 2024 board meeting", description: "Early traction: 15 paying customers, $35K MRR. Product-market fit indicators strong — NPS 72.", createdAt: new Date("2024-06-15") },
        { type: "MILESTONE", title: "Hit $100K MRR", description: "DataMesh crossed $100K MRR milestone. 45 enterprise customers. Net revenue retention 140%.", createdAt: new Date("2024-10-20") },
        { type: "FOLLOW_ON", title: "Seed extension raised — Accel led", description: "DataMesh closed $500K seed extension led by Accel Partners. Mars Shot participated with $20K follow-on.", createdAt: new Date("2025-01-15") },
        { type: "BOARD_MEETING", title: "Q4 2024 board meeting", description: "Strong growth: $100K MRR, 45 customers, 140% NRR. Discussing Series A timing — targeting Q3 2025.", createdAt: new Date("2024-12-10") },
        { type: "NOTE", title: "Series A preparation", description: "Aditya preparing for Series A. Targeting $3-5M raise at $25-30M pre-money. Introduced to Lightspeed and Elevation.", createdAt: daysAgo(10) },
      ],
    },
    {
      companyName: "HealthBridge",
      activities: [
        { type: "INVESTMENT", title: "Initial investment closed", description: "Invested $40K in HealthBridge pre-seed. Telemedicine platform for rural India.", createdAt: new Date("2025-01-10") },
        { type: "NOTE", title: "Post-investment onboarding", description: "Completed onboarding with Dr. Rishi. Set up monthly check-ins. Intro'd to our healthtech network — connected with Dr. Kavya (NutriScan) for potential synergies.", createdAt: new Date("2025-01-20") },
        { type: "MILESTONE", title: "Pilot launched in 3 districts", description: "HealthBridge launched pilot in 3 districts of Karnataka. 200 patients served in first month. Partnership with PHCs (Primary Health Centers).", createdAt: new Date("2025-02-15") },
        { type: "NOTE", title: "Monthly check-in", description: "Rishi reports strong initial traction in pilot districts. 500+ consultations completed. Working on government partnership for Ayushman Bharat integration.", createdAt: daysAgo(8) },
      ],
    },
    {
      companyName: "SupplyLens",
      activities: [
        { type: "INVESTMENT", title: "Initial investment closed", description: "Invested $60K in SupplyLens seed round. Supply chain visibility SaaS for manufacturers.", createdAt: new Date("2024-11-05") },
        { type: "BOARD_MEETING", title: "First board meeting", description: "Post-investment board meeting. 20 paying customers, $18K MRR. Product roadmap aligned on predictive analytics module.", createdAt: new Date("2024-12-15") },
        { type: "NOTE", title: "Customer expansion update", description: "Pooja landed 3 new enterprise accounts including Tata Steel. Pipeline looking strong for Q1 2025.", createdAt: new Date("2025-01-25") },
        { type: "MILESTONE", title: "Crossed 50 customers", description: "SupplyLens now has 50+ paying customers. $42K MRR. Gross margins at 82%. Exploring seed extension.", createdAt: daysAgo(12) },
      ],
    },
  ];

  for (const { companyName, activities } of portfolioActivities) {
    const company = portfolioByName[companyName];
    if (!company) continue;
    for (const act of activities) {
      await prisma.activity.create({
        data: {
          type: act.type,
          title: act.title,
          description: act.description,
          createdAt: act.createdAt,
          portfolioCompanyId: company.id,
          userId: vp.id,
        },
      });
    }
  }
  console.log(`✓ Portfolio activities created for ${portfolioActivities.length} companies`);

  // 5c. Create Activities for Contacts
  const allContacts = await prisma.contact.findMany();
  const contactByName: Record<string, typeof allContacts[0]> = {};
  for (const c of allContacts) contactByName[c.name] = c;

  const contactActivities: { contactName: string; activities: { type: string; title: string; description: string; createdAt: Date }[] }[] = [
    {
      contactName: "Nikhil Kamath",
      activities: [
        { type: "DEAL_REFERRAL", title: "Referred PayFlow AI", description: "Nikhil forwarded PayFlow AI pitch deck. Strong conviction in the team — knows Arjun from Zerodha vendor network.", createdAt: daysAgo(14) },
        { type: "MEETING", title: "Lunch catch-up", description: "Lunch at Karavalli. Discussed fintech market trends, potential co-investment in CredStack. Nikhil interested in credit infra plays.", createdAt: daysAgo(5) },
        { type: "NOTE", title: "Co-investment interest", description: "Nikhil expressed interest in co-investing in 2-3 deals per quarter. Sweet spot: fintech and D2C, $25-50K cheques.", createdAt: daysAgo(5) },
      ],
    },
    {
      contactName: "Rajan Anandan",
      activities: [
        { type: "MEETING", title: "Peak XV partnership discussion", description: "Met at Peak XV office. Discussed deal flow sharing and potential co-investment framework.", createdAt: daysAgo(10) },
        { type: "DEAL_REFERRAL", title: "Shared 2 deals from Peak XV pipeline", description: "Rajan shared 2 early-stage SaaS companies from Peak XV's scouting pipeline that don't fit their cheque size.", createdAt: daysAgo(10) },
      ],
    },
    {
      contactName: "Vani Kola",
      activities: [
        { type: "DEAL_REFERRAL", title: "Referred DataMesh originally", description: "Vani co-invested in DataMesh seed round with us. Continues to be a strong relationship.", createdAt: new Date("2024-03-15") },
        { type: "MEETING", title: "Monthly catch-up", description: "Coffee at Third Wave. Discussed healthtech thesis — Vani sees big opportunity in AI diagnostics. Mentioned potential intro to 2 healthtech founders.", createdAt: daysAgo(3) },
        { type: "DEAL_REFERRAL", title: "Intro to AI diagnostics startup", description: "Vani intro'd us to MedScan AI — AI-powered radiology. Pre-seed, doctor-founded. Will review this week.", createdAt: daysAgo(2) },
        { type: "NOTE", title: "Portfolio synergies", description: "Vani offered to connect HealthBridge with Kalaari's healthtech portfolio for partnership opportunities.", createdAt: daysAgo(2) },
      ],
    },
    {
      contactName: "Kunal Shah",
      activities: [
        { type: "NOTE", title: "CredStack founder intro", description: "Kunal connected us with Meera Nair (CredStack CEO) — she was his product lead at CRED.", createdAt: daysAgo(45) },
        { type: "MEETING", title: "Operator perspective on fintech", description: "Kunal shared insights on embedded finance trends. Believes credit scoring for SMBs is a $10B+ opportunity in India.", createdAt: daysAgo(35) },
      ],
    },
    {
      contactName: "Nandan Nilekani",
      activities: [
        { type: "MEETING", title: "Advisory session — fund strategy", description: "Nandan provided strategic advice on fund positioning. Recommended deepening Aadhaar/UPI stack thesis for fintech deals.", createdAt: daysAgo(20) },
        { type: "NOTE", title: "India stack opportunity", description: "Nandan believes ONDC + Account Aggregator will create next wave of fintech startups. Offered to review our fintech pipeline quarterly.", createdAt: daysAgo(20) },
      ],
    },
  ];

  for (const { contactName, activities } of contactActivities) {
    const contact = contactByName[contactName];
    if (!contact) continue;
    for (const act of activities) {
      await prisma.activity.create({
        data: {
          type: act.type,
          title: act.title,
          description: act.description,
          createdAt: act.createdAt,
          contactId: contact.id,
          userId: vp.id,
        },
      });
    }
  }
  console.log(`✓ Contact activities created for ${contactActivities.length} contacts`);

  // 6. Create Calendar Events
  const now = new Date();
  const calendarEvents = [
    {
      title: "Intro Call — NutriScan",
      type: "INTRO_CALL" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      location: "Google Meet",
      description: "Follow-up call with Dr. Kavya Reddy to discuss B2B API roadmap and seed terms.",
      reminderMinutes: 30,
      dealId: dealsByName["NutriScan"]?.id,
      createdById: vp.id,
    },
    {
      title: "Partner Review — CredStack",
      type: "PARTNER_REVIEW" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: "Mars Shot HQ — Board Room",
      description: "Final partner review for CredStack investment decision. Partner brief circulated. Term sheet v2 under negotiation.",
      reminderMinutes: 60,
      dealId: dealsByName["CredStack"]?.id,
      createdById: vp.id,
    },
    {
      title: "DD Deep Dive — Lingua Labs",
      type: "DD_MEETING" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      description: "Technical due diligence deep-dive with CTO Ananya Das. Focus: API architecture, model benchmarks, and scaling roadmap.",
      dealId: dealsByName["Lingua Labs"]?.id,
      createdById: vp.id,
    },
    {
      title: "Quarterly Board Prep — RapidPay",
      type: "BOARD_MEETING" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      allDay: false,
      location: "Zoom",
      description: "Q1 2026 board meeting. Agenda: post-Series A progress, hiring plan, expansion metrics.",
      portfolioCompanyId: portfolioByName["RapidPay"]?.id,
      createdById: vp.id,
    },
    {
      title: "Ecosystem Coffee — Vani Kola",
      type: "ECOSYSTEM_CATCHUP" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      location: "Third Wave Coffee, Koramangala",
      description: "Monthly catch-up with Vani. Discuss healthtech pipeline and potential co-investments.",
      contactId: contactByName["Vani Kola"]?.id,
      createdById: vp.id,
    },
    {
      title: "Screening Call — CloudKitchen OS",
      type: "INTRO_CALL" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      location: "Google Meet",
      description: "Initial screening call with Deepak Rao (CloudKitchen OS). Ex-Swiggy founding team. Discuss product, traction, and ask.",
      dealId: dealsByName["CloudKitchen OS"]?.id,
      createdById: vp.id,
    },
    {
      title: "BuildStack — Partner Gut-Check Follow-up",
      type: "PARTNER_REVIEW" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      location: "Mars Shot HQ",
      description: "Follow-up discussion on BuildStack. Partners to decide on advancing to Active DD.",
      dealId: dealsByName["BuildStack"]?.id,
      createdById: vp.id,
    },
    {
      title: "DataMesh Board Meeting",
      type: "BOARD_MEETING" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      location: "Zoom",
      description: "Q1 2026 board meeting. Agenda: Series A prep, growth metrics review, hiring plan.",
      portfolioCompanyId: portfolioByName["DataMesh"]?.id,
      createdById: vp.id,
    },
    {
      title: "Lunch — Nikhil Kamath",
      type: "ECOSYSTEM_CATCHUP" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: "Karavalli, Bangalore",
      description: "Monthly co-investor catch-up. Discuss CredStack co-investment and new fintech pipeline.",
      contactId: contactByName["Nikhil Kamath"]?.id,
      createdById: vp.id,
    },
    {
      title: "HealthBridge — Monthly Check-in",
      type: "OTHER" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      location: "Google Meet",
      description: "Monthly founder check-in with Dr. Rishi. Review pilot progress and Ayushman Bharat integration timeline.",
      portfolioCompanyId: portfolioByName["HealthBridge"]?.id,
      createdById: vp.id,
    },
    {
      title: "SLA Reminder — QuickShip Radar Review",
      type: "TASK" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      isSlaReminder: true,
      description: "QuickShip has been in Radar for 3 days. SLA is 24 hours. Needs triage decision — advance to Screening or pass.",
      dealId: dealsByName["QuickShip"]?.id,
      createdById: vp.id,
    },
  ];

  for (const evt of calendarEvents) {
    await prisma.calendarEvent.create({ data: evt });
  }
  console.log(`✓ Calendar events: ${calendarEvents.length}`);

  // 7. Create Term Sheets (for advanced-stage deals)
  const credStackDeal = dealsByName["CredStack"];
  const linguaDeal = dealsByName["Lingua Labs"];

  if (credStackDeal) {
    const ts = await prisma.termSheet.create({
      data: {
        dealId: credStackDeal.id,
        valuation: 3000000,
        chequeSize: 60000,
        equityPercent: 2.0,
        boardSeat: false,
        proRataRights: true,
        liquidationPref: "1x non-participating",
        investorRights: "Information rights, pro-rata, ROFR",
        status: "NEGOTIATING",
        version: 2,
        sentAt: daysAgo(8),
        createdById: vp.id,
        revisions: {
          create: [
            {
              versionNumber: 1,
              changes: { valuation: { from: 2500000, to: 3000000 }, equityPercent: { from: 2.4, to: 2.0 } },
              note: "Founder counter — higher valuation, lower equity",
            },
          ],
        },
      },
    });
    console.log(`✓ Term Sheet: CredStack (${ts.status})`);
  }

  if (linguaDeal) {
    const ts = await prisma.termSheet.create({
      data: {
        dealId: linguaDeal.id,
        valuation: 8000000,
        chequeSize: 100000,
        equityPercent: 1.25,
        boardSeat: false,
        proRataRights: true,
        liquidationPref: "1x non-participating",
        status: "DRAFT",
        version: 1,
        createdById: vp.id,
      },
    });
    console.log(`✓ Term Sheet: Lingua Labs (${ts.status})`);
  }

  // 8. Create Email Templates
  const emailTemplates = [
    {
      name: "Screening Pass",
      type: "SCREENING_PASS" as const,
      subject: "Mars Shot — Moving Forward with {{companyName}}",
      body: "Hi {{founderName}},\n\nThanks for sharing {{companyName}} with us. We've completed our initial screening and would love to schedule an intro call.\n\nPlease share your availability for a 30-minute call this week.\n\nBest,\nMars Shot Team",
      isDefault: true,
      forStage: "SCREENING",
      createdById: vp.id,
    },
    {
      name: "Screening Reject",
      type: "SCREENING_REJECT" as const,
      subject: "Mars Shot — Update on {{companyName}}",
      body: "Hi {{founderName}},\n\nThank you for sharing {{companyName}} with us. After careful review, we've decided not to move forward at this time.\n\nThis isn't a reflection on the quality of your work — the space just doesn't align with our current thesis.\n\nWe wish you the best and would love to stay in touch.\n\nBest,\nMars Shot Team",
      isDefault: true,
      forStage: "SCREENING",
      createdById: vp.id,
    },
    {
      name: "Intro Call Booking",
      type: "INTRO_CALL_BOOKING" as const,
      subject: "Intro Call — Mars Shot x {{companyName}}",
      body: "Hi {{founderName}},\n\nLooking forward to our intro call. Here are the details:\n\nDate: {{callDate}}\nTime: {{callTime}}\nLink: {{meetingLink}}\n\nPlease have a brief deck ready — nothing polished, just enough to walk us through the problem, solution, and early traction.\n\nSee you soon!\nMars Shot Team",
      isDefault: true,
      forStage: "INTRO_CALL",
      createdById: vp.id,
    },
    {
      name: "DD Kickoff",
      type: "DD_KICKOFF" as const,
      subject: "Mars Shot — Due Diligence Kickoff for {{companyName}}",
      body: "Hi {{founderName}},\n\nGreat news — {{companyName}} has been approved to move into our Active DD phase. We're excited about the opportunity.\n\nAs part of due diligence, we'll need:\n1. Detailed financial model (P&L, cash flow projections)\n2. Cap table\n3. Customer reference contacts (3-5)\n4. Technical architecture overview\n\nPlease share these at your earliest convenience. Happy to jump on a call to walk through the process.\n\nBest,\nMars Shot Team",
      isDefault: true,
      forStage: "ACTIVE_DD",
      createdById: vp.id,
    },
    {
      name: "Partner Brief Circulation",
      type: "PARTNER_BRIEF" as const,
      subject: "Partner Brief — {{companyName}}",
      body: "Team,\n\nAttached is the partner brief for {{companyName}}.\n\nKey highlights:\n- Sector: {{sector}}\n- Stage: {{fundingStage}}\n- Ask: {{chequeSize}}\n- Valuation: {{valuation}}\n\nPlease review before our partner meeting on {{meetingDate}}.\n\nBest,\nMars Shot Team",
      isDefault: true,
      forStage: "PARTNER_REVIEW",
      createdById: vp.id,
    },
    {
      name: "Term Sheet Send",
      type: "TERM_SHEET_SEND" as const,
      subject: "Mars Shot — Term Sheet for {{companyName}}",
      body: "Hi {{founderName}},\n\nWe're excited to share our term sheet for {{companyName}}. Please find the attached document.\n\nKey terms:\n- Valuation: {{valuation}}\n- Investment: {{chequeSize}}\n- Equity: {{equityPercent}}%\n\nPlease review and let us know if you have any questions. We're happy to schedule a call to walk through the details.\n\nBest,\nMars Shot Team",
      isDefault: true,
      forStage: "DECISION",
      createdById: vp.id,
    },
    {
      name: "Follow Up — General",
      type: "FOLLOW_UP" as const,
      subject: "Checking in — {{companyName}}",
      body: "Hi {{founderName}},\n\nJust checking in on {{companyName}}. Would love to hear how things are progressing.\n\nAny updates on {{lastTopic}}?\n\nBest,\nMars Shot Team",
      isDefault: false,
      createdById: vp.id,
    },
  ];

  for (const tpl of emailTemplates) {
    await prisma.emailTemplate.create({ data: tpl });
  }
  console.log(`✓ Email templates: ${emailTemplates.length}`);

  // 9. Create Documents — comprehensive set across all deals
  const documents = [
    // PayFlow AI
    { name: "PayFlow AI — Pitch Deck v2", type: "PITCH_DECK" as const, storagePath: "/documents/payflow-pitch-deck-v2.pdf", fileSize: 2400000, mimeType: "application/pdf", dealId: dealsByName["PayFlow AI"]?.id, uploadedById: vp.id },
    { name: "PayFlow AI — One Pager", type: "ONE_PAGER" as const, storagePath: "/documents/payflow-one-pager.pdf", fileSize: 320000, mimeType: "application/pdf", dealId: dealsByName["PayFlow AI"]?.id, uploadedById: vp.id },
    // NutriScan
    { name: "NutriScan — YC One Pager", type: "ONE_PAGER" as const, storagePath: "/documents/nutriscan-yc-one-pager.pdf", fileSize: 450000, mimeType: "application/pdf", dealId: dealsByName["NutriScan"]?.id, uploadedById: vp.id },
    { name: "NutriScan — Pitch Deck", type: "PITCH_DECK" as const, storagePath: "/documents/nutriscan-pitch-deck.pdf", fileSize: 3100000, mimeType: "application/pdf", dealId: dealsByName["NutriScan"]?.id, uploadedById: vp.id },
    // BuildStack
    { name: "BuildStack — One Pager (Approved)", type: "ONE_PAGER" as const, storagePath: "/documents/buildstack-one-pager.pdf", fileSize: 380000, mimeType: "application/pdf", dealId: dealsByName["BuildStack"]?.id, uploadedById: vp.id },
    { name: "BuildStack — Product Demo Recording", type: "OTHER" as const, storagePath: "/documents/buildstack-demo.mp4", fileSize: 45000000, mimeType: "video/mp4", dealId: dealsByName["BuildStack"]?.id, uploadedById: vp.id },
    // Lingua Labs
    { name: "Lingua Labs — Seed Pitch Deck", type: "PITCH_DECK" as const, storagePath: "/documents/lingua-labs-pitch-deck.pdf", fileSize: 2800000, mimeType: "application/pdf", dealId: linguaDeal?.id, uploadedById: vp.id },
    { name: "Lingua Labs — Technical DD Report", type: "DD_MATERIAL" as const, storagePath: "/documents/lingua-labs-dd.pdf", fileSize: 1800000, mimeType: "application/pdf", dealId: linguaDeal?.id, uploadedById: vp.id },
    { name: "Lingua Labs — Customer Reference Notes", type: "DD_MATERIAL" as const, storagePath: "/documents/lingua-labs-customer-refs.pdf", fileSize: 520000, mimeType: "application/pdf", dealId: linguaDeal?.id, uploadedById: vp.id },
    { name: "Lingua Labs — One Pager", type: "ONE_PAGER" as const, storagePath: "/documents/lingua-labs-one-pager.pdf", fileSize: 290000, mimeType: "application/pdf", dealId: linguaDeal?.id, uploadedById: vp.id },
    // CredStack
    { name: "CredStack — Pitch Deck", type: "PITCH_DECK" as const, storagePath: "/documents/credstack-pitch-deck.pdf", fileSize: 2100000, mimeType: "application/pdf", dealId: credStackDeal?.id, uploadedById: vp.id },
    { name: "CredStack — Financial Model", type: "DD_MATERIAL" as const, storagePath: "/documents/credstack-model.xlsx", fileSize: 560000, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", dealId: credStackDeal?.id, uploadedById: vp.id },
    { name: "CredStack — Partner Brief", type: "PARTNER_BRIEF" as const, storagePath: "/documents/credstack-partner-brief.pdf", fileSize: 980000, mimeType: "application/pdf", dealId: credStackDeal?.id, uploadedById: vp.id },
    { name: "CredStack — Credit Model Audit", type: "DD_MATERIAL" as const, storagePath: "/documents/credstack-credit-model-audit.pdf", fileSize: 720000, mimeType: "application/pdf", dealId: credStackDeal?.id, uploadedById: vp.id },
    { name: "CredStack — Term Sheet v2", type: "TERM_SHEET" as const, storagePath: "/documents/credstack-term-sheet-v2.pdf", fileSize: 180000, mimeType: "application/pdf", dealId: credStackDeal?.id, uploadedById: vp.id },
    // FarmConnect
    { name: "FarmConnect — Pitch Deck", type: "PITCH_DECK" as const, storagePath: "/documents/farmconnect-pitch-deck.pdf", fileSize: 1900000, mimeType: "application/pdf", dealId: dealsByName["FarmConnect"]?.id, uploadedById: vp.id },
    // CloudKitchen OS
    { name: "CloudKitchen OS — Intro Email Forward", type: "OTHER" as const, storagePath: "/documents/cloudkitchen-intro-email.eml", fileSize: 45000, mimeType: "message/rfc822", dealId: dealsByName["CloudKitchen OS"]?.id, uploadedById: vp.id },
    // Portfolio documents
    { name: "RapidPay — Series A Board Deck", type: "OTHER" as const, storagePath: "/documents/rapidpay-series-a-board.pdf", fileSize: 4200000, mimeType: "application/pdf", portfolioCompanyId: portfolioByName["RapidPay"]?.id, uploadedById: vp.id },
    { name: "DataMesh — Q4 2024 Financials", type: "OTHER" as const, storagePath: "/documents/datamesh-q4-financials.xlsx", fileSize: 680000, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", portfolioCompanyId: portfolioByName["DataMesh"]?.id, uploadedById: vp.id },
    { name: "SupplyLens — Investor Update Feb 2025", type: "OTHER" as const, storagePath: "/documents/supplylens-investor-update.pdf", fileSize: 1200000, mimeType: "application/pdf", portfolioCompanyId: portfolioByName["SupplyLens"]?.id, uploadedById: vp.id },
    // General
    { name: "Mars Shot — Fund Overview 2025", type: "OTHER" as const, storagePath: "/documents/marsshot-fund-overview.pdf", fileSize: 980000, mimeType: "application/pdf", uploadedById: vp.id },
    { name: "Mars Shot — Investment Thesis Memo", type: "OTHER" as const, storagePath: "/documents/marsshot-thesis-memo.pdf", fileSize: 540000, mimeType: "application/pdf", uploadedById: vp.id },
  ];

  for (const doc of documents) {
    await prisma.document.create({ data: doc });
  }
  console.log(`✓ Documents: ${documents.length}`);

  // 10. Create AI Outputs for deals
  const aiOutputs = [
    {
      type: "DEAL_EXTRACTION" as const,
      content: JSON.stringify({
        companyName: "PayFlow AI",
        sector: "Fintech",
        fundingStage: "Pre-Seed",
        chequeSize: 50000,
        founders: [{ name: "Arjun Mehta", role: "CEO", background: "Ex-Stripe engineer" }],
        keyMetrics: { mrr: null, users: null },
        summary: "UPI reconciliation platform for SMBs. Founded by ex-Stripe engineer with deep payments expertise.",
      }),
      confidence: 0.92,
      approved: true,
      approvedAt: daysAgo(13),
      dealId: dealsByName["PayFlow AI"]!.id,
      generatedById: vp.id,
    },
    {
      type: "ONE_PAGER" as const,
      content: "## PayFlow AI — One Pager\n\n**Problem:** SMBs struggle with UPI payment reconciliation. Manual process, error-prone, delays in settlement tracking.\n\n**Solution:** API-first reconciliation engine that auto-matches UPI transactions with invoices. Real-time settlement tracking dashboard.\n\n**Team:** Arjun Mehta (CEO) — Ex-Stripe, 5yr payments experience. Priya Sharma (CTO) — Full-stack, built payment systems at scale.\n\n**Traction:** Pre-revenue. 15 SMBs in pilot. LOIs from 3 payment aggregators.\n\n**Ask:** $50K pre-seed. 18-month runway. Key milestones: launch product, onboard 200 SMBs, hit $5K MRR.",
      confidence: 0.88,
      approved: true,
      approvedAt: daysAgo(8),
      dealId: dealsByName["PayFlow AI"]!.id,
      generatedById: vp.id,
    },
    {
      type: "DEAL_EXTRACTION" as const,
      content: JSON.stringify({
        companyName: "NutriScan",
        sector: "Healthtech",
        fundingStage: "Seed",
        chequeSize: 75000,
        founders: [{ name: "Dr. Kavya Reddy", role: "CEO", background: "Stanford postdoc, practicing physician" }],
        keyMetrics: { mrr: 8000, mau: 50000, d7Retention: "72%", momGrowth: "15%" },
        summary: "AI-powered nutrition scanner using computer vision. Doctor-founded, YC W26. Strong consumer traction with B2B API expansion planned.",
      }),
      confidence: 0.87,
      approved: true,
      approvedAt: daysAgo(19),
      dealId: dealsByName["NutriScan"]!.id,
      generatedById: vp.id,
    },
    {
      type: "SCREENING_SUMMARY" as const,
      content: "## NutriScan — Screening Summary\n\n**Sector Fit:** ✅ Healthtech — aligns with fund thesis on AI-health intersection\n**Stage Fit:** ✅ Seed — appropriate for our cheque size\n**Cheque Fit:** ✅ $75K within fund parameters\n**Razorpay Relevance:** ⚠️ Low — no direct payments/fintech overlap\n**Founder:** ✅ Exceptional — Stanford ML postdoc + practicing physician\n\n**Recommendation:** ADVANCE — despite low Razorpay relevance, founder quality and traction are exceptional. YC validation adds signal. B2B API pivot could create fintech adjacency (health insurance payments).",
      confidence: 0.85,
      approved: true,
      approvedAt: daysAgo(15),
      dealId: dealsByName["NutriScan"]!.id,
      generatedById: vp.id,
    },
    {
      type: "DEAL_EXTRACTION" as const,
      content: JSON.stringify({
        companyName: "CloudKitchen OS",
        sector: "Consumer",
        fundingStage: "Pre-Seed",
        chequeSize: 50000,
        founders: [{ name: "Deepak Rao", role: "CEO", background: "Ex-Swiggy founding team" }],
        keyMetrics: { mrr: null, users: null },
        summary: "Cloud kitchen management SaaS. Pre-seed. Ex-Swiggy founding team. Matrix scout intro.",
      }),
      confidence: 0.65,
      approved: false,
      dealId: dealsByName["CloudKitchen OS"]!.id,
      generatedById: vp.id,
    },
    {
      type: "DEAL_EXTRACTION" as const,
      content: JSON.stringify({
        companyName: "QuickShip",
        sector: "D2C / Logistics",
        fundingStage: "Pre-Seed",
        chequeSize: 40000,
        founders: [{ name: "Siddharth Jain", role: "Founder", background: "Ex-Delhivery ops lead" }],
        keyMetrics: { mrr: null, users: null, lois: 5 },
        summary: "D2C logistics aggregation platform. Founded by ex-Delhivery ops lead (6yr). Pre-revenue with 5 LOIs from D2C brands.",
      }),
      confidence: 0.73,
      approved: false,
      dealId: dealsByName["QuickShip"]!.id,
      generatedById: vp.id,
    },
    {
      type: "PARTNER_BRIEF" as const,
      content: "## CredStack — Partner Brief\n\n### Executive Summary\nCredStack is building AI-powered credit scoring for Indian SMBs using alternative data (GST filings, bank statements, UPI transaction graphs). Founded by ex-CRED product head and ex-Razorpay engineer.\n\n### Market Opportunity\n- TAM: $12B (India SMB lending market)\n- SAM: $3.2B (underserved SMBs without traditional credit scores)\n- 63M+ MSMEs in India, <10% have access to formal credit\n\n### Traction\n- 500+ SMBs onboarded for credit scoring\n- 3 NBFC partnerships for lending\n- Credit model accuracy: 89% (vs 72% industry average)\n- Pipeline: $2M in loan origination volume\n\n### Competitive Landscape\n- CreditVidya (acquired by Upswing) — broader but less accurate\n- Perfios — established but enterprise-focused\n- CredStack differentiation: GST + UPI data fusion, SMB-first\n\n### Risk Matrix\n- Regulatory: RBI data sharing norms evolving — manageable\n- Competition: Large players could build in-house — founder speed is advantage\n- Unit economics: Currently subsidizing onboarding — path to profitability clear\n\n### Recommendation\n**INVEST** — $60K at $3M pre-money. Strong fintech thesis fit, Razorpay merchant overlap creates unique distribution advantage. Founder-market fit is exceptional.",
      confidence: 0.91,
      approved: true,
      approvedAt: daysAgo(12),
      dealId: dealsByName["CredStack"]!.id,
      generatedById: vp.id,
    },
    {
      type: "EMAIL_DRAFT" as const,
      content: "Subject: Mars Shot — Moving Forward with Lingua Labs\n\nHi Vikram,\n\nThank you for the detailed walkthrough of Lingua Labs' translation API. We're very impressed with the technical depth and enterprise traction.\n\nWe'd like to move forward with our due diligence process. As next steps, we'll need:\n\n1. Access to your data room (financial model, cap table, customer contracts)\n2. Technical architecture documentation\n3. 3-5 customer reference contacts\n\nWe're moving quickly on our end and aim to complete DD within 2 weeks. Looking forward to working together.\n\nBest,\nMars Shot Team",
      confidence: 0.89,
      approved: true,
      approvedAt: daysAgo(22),
      dealId: dealsByName["Lingua Labs"]!.id,
      generatedById: vp.id,
    },
  ];

  for (const output of aiOutputs) {
    await prisma.aIOutput.create({ data: output });
  }
  console.log(`✓ AI Outputs: ${aiOutputs.length}`);

  // 11. Create Board Notes for Portfolio Companies
  const boardNotes = [
    {
      title: "Q3 2024 Board Notes — RapidPay",
      content: "## Key Metrics\n- ARR: $120K (up from $45K in Q2)\n- Active merchants: 450\n- Monthly burn: $25K\n- Runway: 14 months\n\n## Highlights\n- Signed partnership with HDFC Bank for merchant onboarding\n- Launched UPI 2.0 support — first in category\n- Hired VP Engineering from PhonePe\n\n## Concerns\n- Customer acquisition cost increasing — need to optimize sales funnel\n- Single-city dependency (Bangalore) — expansion plan needed\n\n## Action Items\n- Karan to present multi-city expansion plan by Nov 2024\n- Mars Shot to intro Karan to Nikhil Kamath for potential Zerodha merchant integration",
      date: new Date("2024-09-20"),
      portfolioCompanyId: portfolioByName["RapidPay"]!.id,
    },
    {
      title: "Q1 2025 Board Notes — RapidPay",
      content: "## Key Metrics\n- ARR: $450K (3.75x since Q3)\n- Active merchants: 2,200\n- Monthly burn: $60K (post Series A hiring)\n- Runway: 24 months (post Series A)\n\n## Highlights\n- Series A closed: $5M from Sequoia Capital India\n- Expanded to Mumbai and Delhi\n- Launched embedded lending product in beta\n\n## Concerns\n- Rapid hiring pace — culture dilution risk\n- Sequoia pushing for aggressive growth — balance with unit economics\n\n## Action Items\n- Quarterly culture review with founding team\n- Mars Shot to provide operational support on lending compliance",
      date: new Date("2025-03-15"),
      portfolioCompanyId: portfolioByName["RapidPay"]!.id,
    },
    {
      title: "Q4 2024 Board Notes — DataMesh",
      content: "## Key Metrics\n- MRR: $100K\n- Customers: 45 enterprise\n- NRR: 140%\n- Gross margin: 78%\n\n## Highlights\n- Crossed $100K MRR milestone — fastest in cohort\n- Launched predictive analytics module — 60% of customers activated\n- Won Tata Digital as strategic account\n\n## Concerns\n- Series A timing — market conditions for SaaS fundraising softening\n- Need to strengthen VP Sales hire\n\n## Action Items\n- Aditya to finalize Series A pitch deck by Jan 2025\n- Mars Shot to intro to Lightspeed and Elevation for Series A",
      date: new Date("2024-12-10"),
      portfolioCompanyId: portfolioByName["DataMesh"]!.id,
    },
    {
      title: "Post-Investment Board Notes — SupplyLens",
      content: "## Key Metrics\n- MRR: $18K\n- Customers: 20 paying\n- Pipeline: $45K in qualified leads\n- Burn: $15K/month\n\n## Highlights\n- Strong product-market fit signals — NPS 68\n- Manufacturing vertical showing highest retention\n- Predictive analytics module in beta with 5 customers\n\n## Concerns\n- Long enterprise sales cycles (3-6 months) impacting growth rate\n- Need dedicated sales hire\n\n## Action Items\n- Pooja to hire first sales rep by Feb 2025\n- Mars Shot to intro to Tata Steel procurement team",
      date: new Date("2024-12-15"),
      portfolioCompanyId: portfolioByName["SupplyLens"]!.id,
    },
  ];

  for (const note of boardNotes) {
    await prisma.boardNote.create({ data: note });
  }
  console.log(`✓ Board Notes: ${boardNotes.length}`);

  // 12. Add more Follow-On Rounds
  const additionalFollowOns = [
    {
      portfolioCompanyId: portfolioByName["StyleAI"]!.id,
      roundName: "Seed",
      amount: 1500000,
      leadInvestor: "Matrix Partners India",
      marsShotParticipated: true,
      date: new Date("2025-03-01"),
    },
    {
      portfolioCompanyId: portfolioByName["SupplyLens"]!.id,
      roundName: "Seed Extension",
      amount: 300000,
      leadInvestor: "Stellaris Venture Partners",
      marsShotParticipated: false,
      date: new Date("2025-02-20"),
    },
  ];

  for (const round of additionalFollowOns) {
    await prisma.followOnRound.create({ data: round });
  }
  console.log(`✓ Additional follow-on rounds: ${additionalFollowOns.length}`);

  // 13. Create Audit Log entries — comprehensive
  const auditEntries = [
    { entity: "Deal", entityId: dealsByName["PayFlow AI"]?.id ?? "", action: "CREATED", changes: { companyName: "PayFlow AI", source: "Nikhil Kamath" }, userId: vp.id },
    { entity: "Deal", entityId: dealsByName["PayFlow AI"]?.id ?? "", action: "STAGE_CHANGE", changes: { stage: { from: "DEAL_SOURCE", to: "RADAR" } }, userId: vp.id },
    { entity: "Deal", entityId: dealsByName["PayFlow AI"]?.id ?? "", action: "STAGE_CHANGE", changes: { stage: { from: "RADAR", to: "SCREENING" } }, userId: vp.id },
    { entity: "Deal", entityId: dealsByName["NutriScan"]?.id ?? "", action: "STAGE_CHANGE", changes: { stage: { from: "SCREENING", to: "INTRO_CALL" } }, userId: vp.id },
    { entity: "Deal", entityId: dealsByName["Lingua Labs"]?.id ?? "", action: "STAGE_CHANGE", changes: { stage: { from: "PARTNER_GUT_CHECK", to: "ACTIVE_DD" } }, userId: vp.id },
    { entity: "Deal", entityId: dealsByName["CredStack"]?.id ?? "", action: "STAGE_CHANGE", changes: { stage: { from: "ACTIVE_DD", to: "PARTNER_REVIEW" } }, userId: vp.id },
    { entity: "Deal", entityId: credStackDeal?.id ?? "", action: "TERM_SHEET_CREATED", changes: { valuation: 3000000, chequeSize: 60000 }, userId: vp.id },
    { entity: "Deal", entityId: credStackDeal?.id ?? "", action: "TERM_SHEET_REVISED", changes: { version: { from: 1, to: 2 }, valuation: { from: 2500000, to: 3000000 } }, userId: vp.id },
    { entity: "Deal", entityId: dealsByName["FarmConnect"]?.id ?? "", action: "STATUS_CHANGE", changes: { status: { from: "ACTIVE", to: "PASSED" }, reason: "Sector mismatch" }, userId: vp.id },
    { entity: "Deal", entityId: dealsByName["CloudKitchen OS"]?.id ?? "", action: "CREATED", changes: { companyName: "CloudKitchen OS", source: "Matrix Partners scout" }, userId: vp.id },
    { entity: "PortfolioCompany", entityId: portfolioByName["RapidPay"]?.id ?? "", action: "FOLLOW_ON_RECORDED", changes: { round: "Series A", amount: 5000000, lead: "Sequoia Capital India" }, userId: vp.id },
    { entity: "PortfolioCompany", entityId: portfolioByName["DataMesh"]?.id ?? "", action: "FOLLOW_ON_RECORDED", changes: { round: "Seed Extension", amount: 500000, lead: "Accel Partners" }, userId: vp.id },
    { entity: "Contact", entityId: contactByName["Vani Kola"]?.id ?? "", action: "CREATED", changes: { name: "Vani Kola", organization: "Kalaari Capital" }, userId: vp.id },
    { entity: "Contact", entityId: contactByName["Nikhil Kamath"]?.id ?? "", action: "INTERACTION_LOGGED", changes: { type: "DEAL_REFERRAL", deal: "PayFlow AI" }, userId: vp.id },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        ...entry,
        changes: entry.changes ? JSON.parse(JSON.stringify(entry.changes)) : undefined,
      },
    });
  }
  console.log(`✓ Audit log entries: ${auditEntries.length}`);

  console.log("\n-------- Seed completed --------");
  console.log(`  Deals: ${await prisma.deal.count()}`);
  console.log(`  Founders: ${await prisma.founder.count()}`);
  console.log(`  Portfolio: ${await prisma.portfolioCompany.count()}`);
  console.log(`  Follow-on Rounds: ${await prisma.followOnRound.count()}`);
  console.log(`  Board Notes: ${await prisma.boardNote.count()}`);
  console.log(`  Contacts: ${await prisma.contact.count()}`);
  console.log(`  Activities: ${await prisma.activity.count()}`);
  console.log(`  Calendar Events: ${await prisma.calendarEvent.count()}`);
  console.log(`  Term Sheets: ${await prisma.termSheet.count()}`);
  console.log(`  Email Templates: ${await prisma.emailTemplate.count()}`);
  console.log(`  Documents: ${await prisma.document.count()}`);
  console.log(`  AI Outputs: ${await prisma.aIOutput.count()}`);
  console.log(`  Audit Logs: ${await prisma.auditLog.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
