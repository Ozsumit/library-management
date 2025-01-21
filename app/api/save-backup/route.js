// app/api/save-backup/route.js
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

export async function POST(request) {
  try {
    // Verify environment variables
    if (!uri || !dbName) {
      console.error("Missing environment variables:", {
        hasUri: !!uri,
        hasDbName: !!dbName,
      });
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Log the received request
    const body = await request.json();
    console.log(
      "Received backup request with data structure:",
      Object.keys(body?.data || {})
    );

    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { message: "No data provided in request body" },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const time = currentDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const backupData = {
      filename: `backup-${day}-${time}.json`,
      createdAt: currentDate,
      data: data,
    };

    // Attempt MongoDB connection
    console.log("Attempting MongoDB connection...");
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB, accessing database:", dbName);
    const db = client.db(dbName);

    console.log("Inserting backup data...");
    const result = await db.collection("backups").insertOne(backupData);

    await client.close();
    console.log("MongoDB connection closed successfully");

    return NextResponse.json({
      message: "Backup saved successfully",
      backupId: result.insertedId,
    });
  } catch (error) {
    console.error("Detailed backup error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    return NextResponse.json(
      {
        message: "Error saving backup",
        error: error.message,
        errorCode: error.code,
      },
      { status: 500 }
    );
  }
}
