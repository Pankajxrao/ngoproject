import z from "zod";

export const donationSchema = z.object({
  foodName: z
    .string()
    .min(2, "Food name must be at least 2 characters")
    .max(100, "Food name must be at most 100 characters"),

  foodType: z.enum([
    "cooked_food",
    "packaged_food",
    "bakery",
    "fruits",
    "vegetables",
    "other",
  ]),

  quantity: z
    .number()
    .positive("Quantity must be greater than 0"),

  unit: z
    .string()
    .min(1, "Unit is required"),

  preparedAt: z
    .coerce
    .date()
    .optional(),

  expiryTime: z
    .coerce
    .date(),

  pickupDeadline: z
    .coerce
    .date(),
});