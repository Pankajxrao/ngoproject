interface IDonation {
  id: string;

  restaurantId: string;
  ngoId?: string;

  foodName: string;
  foodType: string;

  quantity: number;
  unit: string;

  expiryTime: Date;
  pickupDeadline: Date;

  status:
    | "available"
    | "accepted"
    | "picked_up"
    | "completed"
    | "expired"
    | "cancelled";

  pickupTime?: Date;
  pickedUpAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}