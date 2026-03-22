// CSV Import Utilities for Mars Shot VC CRM

import { prismadb as prisma } from "@/lib/prisma";
import type { ContactType } from "@prisma/client";

// ─── CSV Parser ─────────────────────────────────────────

/**
 * Parse CSV text into an array of row objects.
 * Handles quoted fields, commas inside quotes, and escaped quotes ("").
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = splitCSVLines(csvText.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVRow(line);
    const row: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? "").trim();
    }

    rows.push(row);
  }

  return rows;
}

/**
 * Split CSV text into lines, respecting quoted fields that span newlines.
 */
function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++; // skip \r\n
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  if (current) lines.push(current);
  return lines;
}

/**
 * Parse a single CSV row into field values.
 * Handles: quoted fields, commas in quotes, escaped quotes ("").
 */
function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }

  fields.push(current);
  return fields;
}

// ─── Column Mapping ────────────────────────────────────

/** Contact fields we support importing into */
const CONTACT_FIELDS = [
  "name",
  "email",
  "phone",
  "linkedin",
  "organization",
  "type",
  "notes",
  "sectorExpertise",
  "coInvestmentHistory",
] as const;

type ContactField = (typeof CONTACT_FIELDS)[number];

/** Mapping of common CSV header variations to Contact fields */
const HEADER_ALIASES: Record<string, ContactField> = {
  // name
  name: "name",
  "full name": "name",
  "first name": "name",
  "contact name": "name",
  "display name": "name",

  // email
  email: "email",
  "email address": "email",
  "e-mail": "email",
  "email id": "email",

  // phone
  phone: "phone",
  "phone number": "phone",
  telephone: "phone",
  mobile: "phone",
  "mobile number": "phone",
  tel: "phone",

  // linkedin
  linkedin: "linkedin",
  "linkedin url": "linkedin",
  "linkedin profile": "linkedin",

  // organization
  organization: "organization",
  company: "organization",
  org: "organization",
  firm: "organization",
  "company name": "organization",
  employer: "organization",

  // type
  type: "type",
  "contact type": "type",
  role: "type",
  category: "type",

  // notes
  notes: "notes",
  note: "notes",
  comments: "notes",
  description: "notes",

  // sectorExpertise
  "sector expertise": "sectorExpertise",
  sectors: "sectorExpertise",
  sector: "sectorExpertise",
  expertise: "sectorExpertise",
  industries: "sectorExpertise",

  // coInvestmentHistory
  "co-investment history": "coInvestmentHistory",
  "coinvestment history": "coInvestmentHistory",
  "co investment history": "coInvestmentHistory",
  "investment history": "coInvestmentHistory",
};

/**
 * Auto-suggest mapping of CSV column headers to Contact fields.
 * Returns a map of csvHeader -> contactField (or null if no match).
 */
export function suggestColumnMapping(
  headers: string[]
): Record<string, ContactField | null> {
  const mapping: Record<string, ContactField | null> = {};

  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    mapping[header] = HEADER_ALIASES[normalized] ?? null;
  }

  return mapping;
}

// ─── Contact Import ────────────────────────────────────

const VALID_CONTACT_TYPES: Set<string> = new Set([
  "VC",
  "CO_INVESTOR",
  "OPERATOR",
  "FOUNDER",
  "ADVISOR",
]);

export interface ImportStats {
  created: number;
  skipped: number;
  errors: string[];
}

/**
 * Import contacts from parsed CSV rows.
 * Auto-maps columns using suggestColumnMapping, validates, and creates records.
 */
export async function importContacts(
  rows: Record<string, string>[],
  _userId?: string
): Promise<ImportStats> {
  if (rows.length === 0) {
    return { created: 0, skipped: 0, errors: ["No rows found in CSV"] };
  }

  const headers = Object.keys(rows[0]);
  const columnMap = suggestColumnMapping(headers);

  // Check that at least "name" is mapped
  const nameColumn = Object.entries(columnMap).find(
    ([, field]) => field === "name"
  );
  if (!nameColumn) {
    return {
      created: 0,
      skipped: 0,
      errors: [
        'Could not find a "name" column. Expected headers like: Name, Full Name, Contact Name',
      ],
    };
  }

  const stats: ImportStats = { created: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 for 1-indexed + header row

    try {
      // Build the contact data from mapped columns
      const mapped: Record<string, string> = {};
      for (const [csvHeader, contactField] of Object.entries(columnMap)) {
        if (contactField && row[csvHeader]) {
          mapped[contactField] = row[csvHeader];
        }
      }

      // Name is required
      if (!mapped.name) {
        stats.skipped++;
        stats.errors.push(`Row ${rowNum}: missing name, skipped`);
        continue;
      }

      // Parse type
      let contactType: ContactType | undefined;
      if (mapped.type) {
        const typeUpper = mapped.type.toUpperCase().replace(/[\s-]/g, "_");
        if (VALID_CONTACT_TYPES.has(typeUpper)) {
          contactType = typeUpper as ContactType;
        }
      }

      // Parse sectorExpertise (comma-separated string -> array)
      let sectorExpertise: string[] | undefined;
      if (mapped.sectorExpertise) {
        sectorExpertise = mapped.sectorExpertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // Create the contact
      const contact = await prisma.contact.create({
        data: {
          name: mapped.name,
          email: mapped.email || undefined,
          phone: mapped.phone || undefined,
          linkedin: mapped.linkedin || undefined,
          organization: mapped.organization || undefined,
          type: contactType,
          sectorExpertise: sectorExpertise ?? [],
          coInvestmentHistory: mapped.coInvestmentHistory || undefined,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: "CONTACT_CREATED",
          title: `Contact imported: ${contact.name}`,
          description: "Imported via CSV upload",
          contactId: contact.id,
        },
      });

      stats.created++;
    } catch (err) {
      stats.skipped++;
      const message =
        err instanceof Error ? err.message : "Unknown error";
      stats.errors.push(`Row ${rowNum}: ${message}`);
    }
  }

  return stats;
}
