import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Никнейм должен содержать минимум 3 символа.")
  .max(32, "Никнейм должен содержать максимум 32 символа.")
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    "Используйте только латиницу, цифры и символы . _ -"
  );

export const passwordSchema = z
  .string()
  .min(10, "Пароль должен содержать минимум 10 символов.")
  .max(128, "Пароль слишком длинный.");

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Введите email или логин."),
  password: z.string().min(1, "Введите пароль.")
});

export const registerSchema = z.object({
  email: z.string().trim().email("Введите корректный email."),
  username: usernameSchema,
  password: passwordSchema
});

export const profileSchema = z.object({
  username: usernameSchema
});
