import z from "zod";

export const nameValidation = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(/^[A-Za-z ]+$/, "Name must contain only letters and spaces");

export const phoneValidation = z
  .string()
  .min(10, "Phone number must be 10 digits")
  .max(10, "Phone number must be 10 digits")
  .regex(/^[0-9]+$/, "Phone number must contain only numbers");

export const passwordValidation = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const signUpSchema = z.object({
  name: nameValidation,

  email: z
    .string()
    .email("Invalid email address"),

  phone: phoneValidation,

  password: passwordValidation,

  role: z.enum(["admin", "ngo", "restaurant"]),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});