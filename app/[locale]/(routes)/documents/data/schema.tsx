import { z } from "zod";

export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  storagePath: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  createdAt: z.coerce.date().nullable().optional(),
});

export type DocumentRow = z.infer<typeof documentSchema>;
