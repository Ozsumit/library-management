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
    // In the GET function where download is handled
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

export async function POST(request: Request) {
  try {
    if (!uri || !dbName) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    const backup = {
      filename: `backup-${new Date().toLocaleTimeString()}`,
      createdAt: new Date(),
      data: body.data,
      size: JSON.stringify(body.data).length,
    };

    const result = await db.collection("backups").insertOne(backup);
    await client.close();

    return NextResponse.json({
      message: "Backup created successfully",
      backupId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { message: "Error creating backup", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const backupId = searchParams.get("id");

  if (!backupId) {
    return NextResponse.json(
      { message: "Backup ID is required" },
      { status: 400 }
    );
  }

  try {
    if (!uri || !dbName) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    const result = await db
      .collection("backups")
      .deleteOne({ _id: new ObjectId(backupId) });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Backup not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Backup deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting backup:", error);
    return NextResponse.json(
      { message: "Error deleting backup", error: String(error) },
      { status: 500 }
    );
  }
}
