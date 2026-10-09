
import dns from "node:dns";
import "dotenv/config";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("TEST SCRIPT STARTED");
console.log("DNS servers:", dns.getServers());
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

async function testConnection() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  } finally {
    await mongoose.disconnect().catch(() => {});
    console.log("TEST FINISHED");
  }
}

testConnection();