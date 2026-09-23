import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

export const eventConfigSchema = z.object({
  hostName: z.string().min(1),
  eventTitle: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  locationText: z.string().min(1),
  description: z.string().min(1),
  slotStartHour: z.number().int().min(0).max(23),
  slotEndHour: z.number().int().min(1).max(24),
  availableWeekdays: z.array(z.number().int().min(0).max(6)).min(1),
});

export type EventConfig = z.infer<typeof eventConfigSchema>;

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

export async function getEventConfig(): Promise<EventConfig> {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  return eventConfigSchema.parse(JSON.parse(raw));
}

export async function saveEventConfig(config: EventConfig): Promise<EventConfig> {
  const parsed = eventConfigSchema.parse(config);
  await fs.writeFile(CONFIG_PATH, JSON.stringify(parsed, null, 2), "utf-8");
  return parsed;
}
