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

    // Parse the request body
    const body = await request.json();

    // Log the received request
    console.log(
      "Received backup request with data structure:",
      Object.keys(body?.data || {})
    );

    // Extract the data from the request body
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { message: "No data provided in request body" },
        { status: 400 }
      );
    }

    // Ensure the data contains books, users, and rentals
    const { books = [], users = [], rentals = [] } = data;

    // Create a timestamp for the backup filename
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const time = currentDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Prepare the backup data
    const backupData = {
      filename: `backup-${day}-${time}.json`,
      createdAt: currentDate,
      data: { books, users, rentals }, // Only include required collections
      size: JSON.stringify({ books, users, rentals }).length,
    };

    // Connect to MongoDB
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db(dbName);

    // Insert the backup data into the backups collection
    const result = await db.collection("backups").insertOne(backupData);

    // Close the MongoDB connection
    await client.close();

    // Return success response
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
