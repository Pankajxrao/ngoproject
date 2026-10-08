 
import mongoose, { Schema, Document } from "mongoose";

export interface DonationModel extends Document {
  restaurantId: mongoose.Types.ObjectId;
  ngoId?: mongoose.Types.ObjectId;

  foodName: string;
  foodType:
    | "cooked_food"
    | "packaged_food"
    | "bakery"
    | "fruits"
    | "vegetables"
    | "other";

  quantity: number;
  unit: string;

  preparedAt?: Date;
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

const DonationSchema = new Schema<DonationModel>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    ngoId: {
      type: Schema.Types.ObjectId,
      ref: "NGO",
      default: null,
    },

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    foodType: {
      type: String,
      enum: [
        "cooked_food",
        "packaged_food",
        "bakery",
        "fruits",
        "vegetables",
        "other",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    preparedAt: {
      type: Date,
    },

    expiryTime: {
      type: Date,
      required: true,
    },

    pickupDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "available",
        "accepted",
        "picked_up",
        "completed",
        "expired",
        "cancelled",
      ],
      default: "available",
    },

    pickupTime: {
      type: Date,
    },

    pickedUpAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

DonationSchema.index({ restaurantId: 1 });
DonationSchema.index({ ngoId: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ expiryTime: 1 });

const Donation =
  mongoose.models.Donation ||
  mongoose.model<DonationModel>("Donation", DonationSchema);

export default Donation;