import { getCurrentUser } from "@/lib/auth/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  return Response.json({
    id: user.id,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
  });
}
