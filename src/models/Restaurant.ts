import mongoose, { Schema, Document } from "mongoose";

export interface RestaurantModel extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantName: string;
  address: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  verified: boolean;
  donating: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<RestaurantModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    verified: {
      type: Boolean,
      default: false,
    },
    donating: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

restaurantSchema.index({ location: "2dsphere" });

const Restaurant =
  mongoose.models.Restaurant ||
  mongoose.model<RestaurantModel>("Restaurant", restaurantSchema);

export default Restaurant;
