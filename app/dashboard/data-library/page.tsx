"use client"

import * as React from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { useDashboardTitle } from "@/components/dashboard-title-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

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
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [businessFiles, setBusinessFiles] = useState<FileMeta[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("")
  const [businessFile, setBusinessFile] = useState<File | null>(null)
  const [isBusinessUploading, setIsBusinessUploading] = useState(false)
  const [businessUploadMessage, setBusinessUploadMessage] = useState("")
  const [pricing, setPricing] = useState<any[]>([])
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState<any | null>(null)
  const [priceHeadline, setPriceHeadline] = useState("")
  const [priceDescription, setPriceDescription] = useState("")
  const [priceValue, setPriceValue] = useState<string>("")
  const [pricingLoading, setPricingLoading] = useState(false)
  const [pricingError, setPricingError] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)

  // DataTable state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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

  // Fetch business files for 'My business data' tab
  useEffect(() => {
    if (!user) return
    const fetchBusinessFiles = async () => {
      // Get all businesses owned by the user
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
      const businessIds = (businesses || []).map((b: any) => b.id)
      if (businessIds.length === 0) {
        setBusinessFiles([])
        return
      }
      // Fetch all documents for these businesses
      const { data, error } = await supabase
        .from("documents")
        .select("filename, original_name, uploaded_at, user_id, business_id")
        .in("business_id", businessIds)
        .order("uploaded_at", { ascending: false })
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
        setBusinessFiles(files)
      } else {
        setBusinessFiles([])
      }
    }
    fetchBusinessFiles()
  }, [user])

  // Fetch businesses for business data upload
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("user_id", user.id);
      setBusinesses(data || []);
      if (data && data.length > 0) setSelectedBusinessId(data[0].id);
    })();
  }, [user]);

  // Fetch business_id for pricing
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (business) setBusinessId(business.id);
    })();
  }, [user]);

  // Fetch pricing
  useEffect(() => {
    if (!businessId) return;
    (async () => {
      setPricingLoading(true);
      const { data, error } = await supabase
        .from("pricing")
        .select("id, headline, description, created_at, price")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      setPricing(data || []);
      setPricingLoading(false);
    })();
  }, [businessId]);

  useEffect(() => {
    if (activeTab === "uploaded") setTitle("Your Uploaded Files")
    else if (activeTab === "shared") setTitle("My business data")
    else if (activeTab === "pricing") setTitle("Pricing")
    // Add more as needed
  }, [activeTab, setTitle])

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
      // Refresh the file list
      setLoading(true)
      // Re-fetch files
      let query = supabase.from("documents").select("filename, original_name, uploaded_at, user_id")
      const isAdmin = user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin"
      if (!isAdmin) {
        query = query.eq("user_id", user.id)
      }
      const { data, error } = await query.order("uploaded_at", { ascending: false })
      if (!error && data) {
        const files = data.map((file) => {
          const { data: urlData } = supabase.storage.from("files").getPublicUrl(file.filename)
          return {
            ...file,
            url: urlData.publicUrl,
          }
        })
        setUploadedFiles(files)
      }
      setLoading(false)
    }
    setIsUploading(false)
  }

  const handleBusinessFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBusinessFile(e.target.files[0]);
    }
  };

  const handleBusinessUpload = async () => {
    if (!businessFile) {
      setBusinessUploadMessage("Please select a file to upload.");
      return;
    }
    if (!user || !selectedBusinessId) {
      setBusinessUploadMessage("You must select a business and be logged in to upload.");
      setIsBusinessUploading(false);
      return;
    }
    setIsBusinessUploading(true);
    setBusinessUploadMessage("");
    const fileName = `docs/${Date.now()}-${businessFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, businessFile, {
        contentType: businessFile.type || "application/pdf",
        upsert: false,
      });
    if (uploadError) {
      setBusinessUploadMessage(uploadError.message || "Something went wrong.");
      setIsBusinessUploading(false);
      return;
    }
    const { error: dbError } = await supabase.from("documents").insert([
      {
        filename: fileName,
        original_name: businessFile.name,
        uploaded_at: new Date().toISOString(),
        user_id: user.id,
        business_id: selectedBusinessId,
      },
    ]);
    if (dbError) {
      setBusinessUploadMessage(dbError.message || "File uploaded but failed to save metadata.");
    } else {
      setBusinessUploadMessage(`File "${businessFile.name}" uploaded successfully!`);
      setBusinessFile(null);
      // Refresh the business files list
      // Get all businesses owned by the user
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id);
      const businessIds = (businesses || []).map((b: any) => b.id);
      if (businessIds.length > 0) {
        const { data, error } = await supabase
          .from("documents")
          .select("filename, original_name, uploaded_at, user_id, business_id")
          .in("business_id", businessIds)
          .order("uploaded_at", { ascending: false });
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
          setBusinessFiles(files);
        }
      }
    }
    setIsBusinessUploading(false);
  };

  const handleOpenPricingModal = (price?: any) => {
    setEditingPrice(price || null);
    setPriceHeadline(price?.headline || "");
    setPriceDescription(price?.description || "");
    setPriceValue(price?.price?.toString() || "");
    setPricingModalOpen(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setPricingLoading(true);
    setPricingError(null);
    const priceNum = priceValue ? parseFloat(priceValue) : null;
    if (editingPrice) {
      // Update
      const { error } = await supabase
        .from("pricing")
        .update({ headline: priceHeadline, description: priceDescription, price: priceNum })
        .eq("id", editingPrice.id);
      if (error) setPricingError(error.message);
    } else {
      // Insert
      const { error } = await supabase
        .from("pricing")
        .insert([{ business_id: businessId, headline: priceHeadline, description: priceDescription, price: priceNum }]);
      if (error) setPricingError(error.message);
    }
    setPricingModalOpen(false);
    setEditingPrice(null);
    setPriceHeadline("");
    setPriceDescription("");
    setPriceValue("");
    // Refresh
    const { data } = await supabase
      .from("pricing")
      .select("id, headline, description, created_at, price")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    setPricing(data || []);
    setPricingLoading(false);
  };

  const handleDeletePrice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this price?")) return;
    setPricingLoading(true);
    await supabase.from("pricing").delete().eq("id", id);
    // Refresh
    const { data } = await supabase
      .from("pricing")
      .select("id, headline, description, created_at, price")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    setPricing(data || []);
    setPricingLoading(false);
  };

  // DataTable columns
  const columns: ColumnDef<FileMeta>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "original_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          File Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("original_name")}</div>,
    },
    {
      accessorKey: "uploaded_at",
      header: "Uploaded At",
      cell: ({ row }) => <div>{new Date(row.getValue("uploaded_at")).toLocaleString()}</div>,
    },
    {
      id: "download",
      header: "Download",
      cell: ({ row }) => {
        const file = row.original
        return (
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800"
          >
            Download
          </a>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  const table = useReactTable({
    data: uploadedFiles,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="px-4 lg:px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="uploaded">My proposals</TabsTrigger>
          <TabsTrigger value="shared">My business data</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        <TabsContent value="uploaded">
          <div className="w-full">
            <div className="flex items-center gap-2 py-4">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                className="max-w-xs"
              />
              <Button onClick={handleUpload} isDisabled={isUploading || !file}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              {uploadMessage && (
                <span className="text-sm text-muted-foreground ml-4">{uploadMessage}</span>
              )}
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="shared">
          <div className="w-full">
            <div className="flex items-center gap-2 py-4">
              {businesses.length > 1 && (
                <select
                  value={selectedBusinessId}
                  onChange={e => setSelectedBusinessId(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
              <Input
                type="file"
                onChange={handleBusinessFileChange}
                accept=".pdf"
                className="max-w-xs"
              />
              <Button onClick={handleBusinessUpload} isDisabled={isBusinessUploading || !businessFile}>
                {isBusinessUploading ? "Uploading..." : "Upload"}
              </Button>
              {businessUploadMessage && (
                <span className="text-sm text-muted-foreground ml-4">{businessUploadMessage}</span>
              )}
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessFiles.length ? (
                    businessFiles.map((file) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="pricing">
          <div className="flex justify-end mb-4">
            <Button onClick={() => handleOpenPricingModal()}>Add Price</Button>
          </div>
          {pricingLoading ? (
            <div className="p-8 text-center">Loading pricing...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricing.map(price => (
                <Card key={price.id}>
                  <CardHeader>
                    <CardTitle>{price.headline}</CardTitle>
                    <CardDescription>{price.description}</CardDescription>
                    {price.price !== null && price.price !== undefined && (
                      <div className="mt-2 text-lg font-bold">{price.price} €</div>
                    )}
                  </CardHeader>
                  <CardFooter className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleOpenPricingModal(price)}>Update</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeletePrice(price.id)}>Remove</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <Dialog open={pricingModalOpen} onOpenChange={setPricingModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPrice ? "Update Price" : "Add Price"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSavePrice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Headline</label>
                  <Input
                    value={priceHeadline}
                    onChange={e => setPriceHeadline(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={priceDescription}
                    onChange={e => setPriceDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (€)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceValue}
                    onChange={e => setPriceValue(e.target.value)}
                    required
                  />
                </div>
                {pricingError && <div className="text-red-600 text-sm">{pricingError}</div>}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" variant="default">{editingPrice ? "Update" : "Add"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
} 