import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "File size exceeds 5MB limit." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `receipts/${fileName}`;

  const { error } = await supabase.storage.from("receipts").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      {
        message: "Failed to upload receipt.",
        details: error.message,
      },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
}
