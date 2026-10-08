import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected === 1) {
        console.log("Already connected to database");
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in .env.local");
        }

        const db = await mongoose.connect(mongoUri);

        connection.isConnected = db.connections[0].readyState;

        console.log("DB connected successfully");
    } catch (error) {
        connection.isConnected = 0;
        console.error("Database connection failed:", error);

        throw error;
    }
}

export default dbConnect;