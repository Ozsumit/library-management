// app/api/get-backups/route.ts
import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const downloadId = searchParams.get("download");

  try {
    if (!uri || !dbName) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    // Handle download request
    if (downloadId) {
      const backup = await db
        .collection("backups")
        .findOne({ _id: new ObjectId(downloadId) });

      await client.close();

      if (!backup) {
        return NextResponse.json(
          { message: "Backup not found" },
          { status: 404 }
        );
      }

      // Validate backup data structure
      if (!backup.data || typeof backup.data !== "object") {
        return NextResponse.json(
          { message: "Invalid backup data structure" },
          { status: 500 }
        );
      }

      // Create the download data with all collections (books, users, rentals)
      const downloadData = {
        books: backup.data.books || [],
        users: backup.data.users || [],
        rentals: backup.data.rentals || [],
      };

      // Create the response with the specified data
      const response = new Response(JSON.stringify(downloadData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="backup-${
            new Date().toISOString().split("T")[0]
          }.json"`,
        },
      });

      return response;
    }

    // Return list of backups
    const backups = await db
      .collection("backups")
      .find({})
      .project({
        filename: 1,
        createdAt: 1,
        size: 1,
      })
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();
    return NextResponse.json(backups);
  } catch (error) {
    console.error("Error with backup operation:", error);
    return NextResponse.json(
      { message: "Error with backup operation", error: String(error) },
      { status: 500 }
    );
  }
}
