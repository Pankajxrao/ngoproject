import z from "zod";

export const restaurantSchema = z.object({
  restaurantName: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name must be at most 100 characters"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters"),

  latitude: z
    .number()
    .min(-90)
    .max(90),

  longitude: z
    .number()
    .min(-180)
    .max(180),
});