"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHeader,
  Row,
  Cell,
  Column,
} from "@/components/ui/table"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth-provider"
import { Checkbox } from "@/components/ui/checkbox"
import { Selection } from "@react-types/shared/src/selection"

interface FileMeta {
  filename: string
  original_name: string
  uploaded_at: string
  url: string
}

export function DataLibrary() {
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadMessage, setUploadMessage] = React.useState("")
  const [uploadedFiles, setUploadedFiles] = React.useState<FileMeta[]>([])
  const { user } = useAuth();
  const [selected, setSelected] = React.useState<Selection>(new Set<string>())

  const fetchFiles = async () => {
    if (!user) return;

    // Check for admin role in app_metadata or user_metadata
    const isAdmin =
      user.app_metadata?.role === "admin" ||
      user.user_metadata?.role === "admin";

    let query = supabase.from("documents").select("filename, original_name, uploaded_at, user_id");

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query.order("uploaded_at", { ascending: false });

    if (!error && data) {
      const files = data.map((file) => {
        const { data: urlData } = supabase.storage
          .from("files")
          .getPublicUrl(file.filename);
        return {
          ...file,
          url: urlData.publicUrl,
        };
      });
      setUploadedFiles(files);
    }
  };

  React.useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a file to upload.")
      return
    }
    if (!user) {
      setUploadMessage("You must be logged in to upload.")
      setIsUploading(false)
      return
    }
    setIsUploading(true)
    setUploadMessage("")
    const fileName = `docs/${Date.now()}-${file.name}`

    // Upload directly to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, file, {
        contentType: file.type || "application/pdf",
        upsert: false,
      })

    if (uploadError) {
      setUploadMessage(uploadError.message || "Something went wrong.")
      setIsUploading(false)
      return
    }

    // Insert metadata into documents table
    const { error: dbError } = await supabase.from("documents").insert([
      {
        filename: fileName,
        original_name: file.name,
        uploaded_at: new Date().toISOString(),
        user_id: user.id,
      },
    ])

    if (dbError) {
      setUploadMessage(dbError.message || "File uploaded but failed to save metadata.")
    } else {
      setUploadMessage(`File "${file.name}" uploaded successfully!`)
      setFile(null)
      fetchFiles() // Refresh the file list
    }
    setIsUploading(false)
  }

  const handleSelect = (filename: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(filename)
      } else {
        next.delete(filename)
      }
      return next
    })
  }

  const handleAnalyze = async () => {
    if (selected instanceof Set ? selected.size === 0 : true) return
    const selectedFiles = Array.from(selected instanceof Set ? selected : [])
      .map(filename => {
        const file = uploadedFiles.find(f => f.filename === filename)
        return file ? { filename: file.filename, original_name: file.original_name } : null
      })
      .filter(Boolean)
    console.log('Selected state:', selected)
    console.log('Selected files payload:', selectedFiles)
    try {
      await fetch("https://n8n.srv824584.hstgr.cloud/webhook/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: selectedFiles, user_id: user?.id }),
      })
      setUploadMessage("Analysis started for selected documents.")
    } catch (err) {
      setUploadMessage("Failed to call analysis webhook.")
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Library</CardTitle>
          <CardDescription>
            Upload and manage your PDF documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              className="max-w-xs"
            />
            <Button onClick={handleUpload} isDisabled={isUploading || !file}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {uploadMessage && (
            <p className="text-sm text-muted-foreground">{uploadMessage}</p>
          )}

          <Table
            aria-label="Data Library Files"
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={(keys) => setSelected(keys)}
          >
            <TableHeader>
              <Column width={40} minWidth={40}>
                <Checkbox
                  slot="selection"
                  isSelected={uploadedFiles.length > 0 && (selected === 'all' || (selected instanceof Set && selected.size === uploadedFiles.length))}
                  isIndeterminate={selected instanceof Set && selected.size > 0 && selected.size < uploadedFiles.length}
                  onChange={(isSelected: boolean) => {
                    if (isSelected) {
                      setSelected('all')
                    } else {
                      setSelected(new Set())
                    }
                  }}
                />
              </Column>
              <Column isRowHeader>File Name</Column>
              <Column>Uploaded At</Column>
              <Column>Download</Column>
            </TableHeader>
            <TableBody>
              {uploadedFiles.map((file) => (
                <Row key={file.filename}>
                  <Cell>
                    <Checkbox slot="selection" />
                  </Cell>
                  <Cell>{file.original_name}</Cell>
                  <Cell>{new Date(file.uploaded_at).toLocaleString()}</Cell>
                  <Cell>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      Download
                    </a>
                  </Cell>
                </Row>
              ))}
            </TableBody>
          </Table>
          {(selected instanceof Set ? selected.size : 0) > 0 && (
            <div className="mt-4">
              <Button onClick={handleAnalyze} variant="default">
                Analyze
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 