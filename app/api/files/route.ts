import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  // Fetch file metadata from Supabase table
  const { data, error } = await supabase
    .from("documents")
    .select("filename, original_name, uploaded_at")
    .order("uploaded_at", { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get public URLs for each file from 'files' bucket
  const files = (data || []).map((file) => {
    const { data: urlData } = supabase.storage
      .from("files")
      .getPublicUrl(file.filename)
    return {
      ...file,
      url: urlData.publicUrl,
    }
  })

  return NextResponse.json({ files })
} 