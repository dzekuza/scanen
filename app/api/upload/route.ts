import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  }

  // Get user from Supabase Auth (if using RLS, you may need to pass a token)
  // For now, we assume public upload; for production, secure this!

  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)
  const fileName = `${Date.now()}-${file.name}`

  // Upload to Supabase Storage (files bucket)
  const { data: storageData, error: storageError } = await supabase.storage
    .from("files")
    .upload(fileName, buffer, {
      contentType: file.type || "application/pdf",
      upsert: false,
    })
  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // Store metadata in Supabase table
  const { error: dbError } = await supabase.from("documents").insert([
    {
      filename: fileName,
      original_name: file.name,
      uploaded_at: new Date().toISOString(),
      // user_id: ... (add if you have user context)
    },
  ])
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, filename: fileName })
} 