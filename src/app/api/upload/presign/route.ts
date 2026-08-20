import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getPresignedUrl, uploadToS3 } from "@/lib/s3";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { key, contentType } = await request.json();
    if (!key) return Response.json({ error: "Key required" }, { status: 400 });

    const url = await getPresignedUrl(key);
    return Response.json({ url, key });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
