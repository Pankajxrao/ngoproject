
import { z } from "zod";

export const restaurantSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name must be at most 100 characters"),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters"),

  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be at least -90")
    .max(90, "Latitude must be at most 90"),

  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be at least -180")
    .max(180, "Longitude must be at most 180"),
});
