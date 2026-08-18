import { seedDatabase } from "@/lib/db/seed";

export async function POST() {
  try {
    await seedDatabase();
    return Response.json({ message: "Database seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    return Response.json(
      { error: "Seed failed", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
