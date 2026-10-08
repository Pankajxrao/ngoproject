 
import mongoose, { Schema, Document } from "mongoose";

export interface NGOSchema extends Document {
  userId: mongoose.Types.ObjectId;
  ngoName: string;
  address: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  verified: boolean;
  capacity?: number;

  createdAt: Date;
  updatedAt: Date;
}

const ngoSchema = new Schema<NGOSchema>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    ngoName: {
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

    capacity: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

ngoSchema.index({ location: "2dsphere" });

const NGO =
  mongoose.models.NGO ||
  mongoose.model<NGOSchema>("NGO", ngoSchema);

export default NGO;