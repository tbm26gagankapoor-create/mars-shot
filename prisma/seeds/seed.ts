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
  await prisma.termSheetRevision.deleteMany();
  await prisma.termSheet.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.founder.deleteMany();
  await prisma.followOnRound.deleteMany();
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

  // 5. Create sample Activities
  const allDeals = await prisma.deal.findMany({ take: 3 });
  for (const deal of allDeals) {
    await prisma.activity.create({
      data: {
        type: "STAGE_CHANGE",
        title: `Deal moved to ${deal.stage}`,
        description: `${deal.companyName} advanced in pipeline`,
        dealId: deal.id,
        userId: vp.id,
      },
    });
  }
  console.log("✓ Sample activities created");

  // 6. Create Calendar Events
  const allDealsForCal = await prisma.deal.findMany({ take: 4 });
  const now = new Date();
  const calendarEvents = [
    {
      title: "Intro Call — NutriScan",
      type: "INTRO_CALL" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      location: "Google Meet",
      reminderMinutes: 30,
      dealId: allDealsForCal[1]?.id,
      createdById: vp.id,
    },
    {
      title: "Partner Review — CredStack",
      type: "PARTNER_REVIEW" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: "Mars Shot HQ — Board Room",
      reminderMinutes: 60,
      dealId: allDealsForCal[3]?.id,
      createdById: vp.id,
    },
    {
      title: "DD Deep Dive — Lingua Labs",
      type: "DD_MEETING" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      description: "Technical due diligence with CTO Ananya Das",
      dealId: allDealsForCal[2]?.id,
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
      createdById: vp.id,
    },
    {
      title: "Ecosystem Coffee — Vani Kola",
      type: "ECOSYSTEM_CATCHUP" as const,
      status: "SCHEDULED" as const,
      startAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      location: "Third Wave Coffee, Koramangala",
      createdById: vp.id,
    },
  ];

  for (const evt of calendarEvents) {
    await prisma.calendarEvent.create({ data: evt });
  }
  console.log(`✓ Calendar events: ${calendarEvents.length}`);

  // 7. Create Term Sheets (for advanced-stage deals)
  const credStackDeal = await prisma.deal.findFirst({ where: { companyName: "CredStack" } });
  const linguaDeal = await prisma.deal.findFirst({ where: { companyName: "Lingua Labs" } });

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

  // 9. Create Documents
  const documents = [
    {
      name: "PayFlow AI — Pitch Deck",
      type: "PITCH_DECK" as const,
      storagePath: "/documents/payflow-pitch-deck.pdf",
      fileSize: 2400000,
      mimeType: "application/pdf",
      dealId: allDealsForCal[0]?.id,
      uploadedById: vp.id,
    },
    {
      name: "Lingua Labs — Technical DD Report",
      type: "DD_MATERIAL" as const,
      storagePath: "/documents/lingua-labs-dd.pdf",
      fileSize: 1800000,
      mimeType: "application/pdf",
      dealId: linguaDeal?.id,
      uploadedById: vp.id,
    },
    {
      name: "CredStack — Financial Model",
      type: "OTHER" as const,
      storagePath: "/documents/credstack-model.xlsx",
      fileSize: 560000,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dealId: credStackDeal?.id,
      uploadedById: vp.id,
    },
    {
      name: "Mars Shot — Fund Overview 2025",
      type: "OTHER" as const,
      storagePath: "/documents/marsshot-fund-overview.pdf",
      fileSize: 980000,
      mimeType: "application/pdf",
      uploadedById: vp.id,
    },
  ];

  for (const doc of documents) {
    await prisma.document.create({ data: doc });
  }
  console.log(`✓ Documents: ${documents.length}`);

  // 10. Create Audit Log entries
  const auditEntries = [
    { entity: "Deal", entityId: allDealsForCal[0]?.id ?? "", action: "STAGE_CHANGE", changes: { stage: { from: "DEAL_SOURCE", to: "SCREENING" } }, userId: vp.id },
    { entity: "Deal", entityId: credStackDeal?.id ?? "", action: "TERM_SHEET_CREATED", changes: { valuation: 3000000, chequeSize: 60000 }, userId: vp.id },
    { entity: "Contact", entityId: "seed-placeholder", action: "CREATED", changes: { name: "Vani Kola" }, userId: vp.id },
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
  console.log(`  Portfolio: ${await prisma.portfolioCompany.count()}`);
  console.log(`  Contacts: ${await prisma.contact.count()}`);
  console.log(`  Activities: ${await prisma.activity.count()}`);
  console.log(`  Calendar Events: ${await prisma.calendarEvent.count()}`);
  console.log(`  Term Sheets: ${await prisma.termSheet.count()}`);
  console.log(`  Email Templates: ${await prisma.emailTemplate.count()}`);
  console.log(`  Documents: ${await prisma.document.count()}`);
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
