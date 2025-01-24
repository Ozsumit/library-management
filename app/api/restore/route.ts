import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

export async function POST(request: Request) {
  try {
    const { books, users } = await request.json();

    const data = await request.json();

    if (!Array.isArray(data.books) || !Array.isArray(data.users)) {
      return NextResponse.json(
        { message: "Invalid backup format" },
        { status: 400 }
      );
    }
    if (!books || !users) {
      return NextResponse.json(
        { message: "Invalid backup format" },
        { status: 400 }
      );
    }

    if (!uri) {
      throw new Error("MONGODB_URI is not defined");
    }
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    // Clear existing collections
    await Promise.all([
      db.collection("books").deleteMany({}),
      db.collection("users").deleteMany({}),
    ]);

    // Insert backup data
    await Promise.all([
      books.length > 0 && db.collection("books").insertMany(books),
      users.length > 0 && db.collection("users").insertMany(users),
    ]);

    await client.close();

    return NextResponse.json({ message: "Database restored successfully" });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { message: "Error restoring database", error: String(error) },
      { status: 500 }
    );
  }
}
