"use client"

import * as React from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabaseClient"
import { Table, TableBody, TableHeader, TableRow, TableCell, TableHead } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { useDashboardTitle } from "@/components/dashboard-title-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface FileMeta {
  filename: string
  original_name: string
  uploaded_at: string
  url: string
}

export default function DataLibraryPage() {
  const { user } = useAuth()
  const [uploadedFiles, setUploadedFiles] = React.useState<FileMeta[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { setTitle } = useDashboardTitle()
  const [activeTab, setActiveTab] = useState("uploaded")

  React.useEffect(() => {
    if (!user) return
    const fetchFiles = async () => {
      setLoading(true)
      setError(null)
      // Check for admin role in app_metadata or user_metadata
      const isAdmin =
        user.app_metadata?.role === "admin" ||
        user.user_metadata?.role === "admin"

      let query = supabase.from("documents").select("filename, original_name, uploaded_at, user_id")
      if (!isAdmin) {
        query = query.eq("user_id", user.id)
      }
      const { data, error } = await query.order("uploaded_at", { ascending: false })
      if (!error && data) {
        const files = data.map((file) => {
          const { data: urlData } = supabase.storage
            .from("files")
            .getPublicUrl(file.filename)
          return {
            ...file,
            url: urlData.publicUrl,
          }
        })
        setUploadedFiles(files)
      } else {
        setError(error?.message || "Failed to fetch files.")
        setUploadedFiles([])
      }
      setLoading(false)
    }
    fetchFiles()
  }, [user])

  useEffect(() => {
    if (activeTab === "uploaded") setTitle("Your Uploaded Files")
    else if (activeTab === "shared") setTitle("Shared With Me")
    // Add more as needed
  }, [activeTab, setTitle])

  return (
    <div className="px-4 lg:px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="uploaded">
          <Table aria-label="Data Library Files">
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadedFiles.map((file) => (
                <TableRow key={file.filename}>
                  <TableCell>{file.original_name}</TableCell>
                  <TableCell>{new Date(file.uploaded_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      Download
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="shared">
          {/* Shared files table */}
        </TabsContent>
      </Tabs>
    </div>
  )
} 