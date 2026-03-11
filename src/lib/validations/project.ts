import { z } from "zod";

export const projectSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Описание проекта должно содержать минимум 10 символов.")
    .max(5000, "Описание проекта слишком длинное.")
});
