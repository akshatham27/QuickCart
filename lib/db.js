import mongoose from "mongoose"

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  try {
    if (cached.conn) {
      console.log("Using cached database connection");
      return cached.conn;
    }

    // Get the connection string and ensure it's properly formatted
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    // Construct the connection string manually to ensure proper formatting
    const username = "makshatha129";
    const password = "akshatha129";
    const cluster = "cluster0.pcpfjss.mongodb.net";
    const dbName = "quickcart";

    const connectionString = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
    
    console.log("Attempting to connect to MongoDB...");

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }

      cached.promise = mongoose.connect(connectionString, opts)
        .then((mongoose) => {
          console.log("Successfully connected to MongoDB");
          return mongoose;
        })
        .catch((error) => {
          console.error("MongoDB connection error:", {
            message: error.message,
            code: error.code,
            name: error.name
          });
          throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("Database connection error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

export default connectDB; 