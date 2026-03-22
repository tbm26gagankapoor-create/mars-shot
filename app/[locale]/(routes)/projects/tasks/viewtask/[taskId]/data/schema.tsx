import { z } from "zod";

export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  storagePath: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
});

export type Task = z.infer<typeof taskSchema>;
