import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createImage } from "@/lib/imagegen/createImage";

export async function POST(request: Request) {
  console.log("[generate-image] Received a request");
  try {
    const { promptId } = (await request.json()) as { promptId?: string };
    if (!promptId) {
      return NextResponse.json({ error: "Missing promptId in request body" }, { status: 400 });
    }

    const supabase = await createClient();
    await createImage(supabase, { promptId, api: "openai" });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Error in /api/generate-image:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
