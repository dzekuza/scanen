"use client"

import * as React from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState, useRef } from "react"
import { useDashboardTitle } from "@/components/dashboard-title-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, PlusIcon, GlobeIcon, FileTextIcon, UploadIcon } from "lucide-react"
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
import { ImageUploadDemo } from "@/components/ui/image-upload-demo"
import { Badge } from "@/components/ui/badge"
import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react"

interface FileMeta {
  filename: string
  original_name: string
  uploaded_at: string
  url: string
}

const DATA_SOURCES = [
  { id: 1, name: "scanen.vercel.app", type: "Website", usedBy: ["Lyro", "Copilot"], updated: "Jul 3, 2025, 10:42 PM" },
];

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
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // DataTable state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Website tab state (from chatbot page)
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [websiteStep, setWebsiteStep] = useState(0);
  const [websiteSelectedType, setWebsiteSelectedType] = useState<string | null>(null);
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([""]);
  const [websiteSelectedRows, setWebsiteSelectedRows] = useState<number[]>([]);

  // Remove all tab state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Modal state for business knowledge
  const [businessKnowledgeMode, setBusinessKnowledgeMode] = useState<'csv' | 'manual'>('csv');
  const [businessKnowledgeText, setBusinessKnowledgeText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Modal state for pricing
  const [pricingName, setPricingName] = useState('');
  const [pricingDescription, setPricingDescription] = useState('');
  const [pricingValue, setPricingValue] = useState('');

  // Add loading state for modal save
  const [modalSaving, setModalSaving] = useState(false);

  // Unified data (merge uploadedFiles, businessFiles, pricing, DATA_SOURCES, etc.)
  const unifiedData = React.useMemo(() => {
    // Example mapping, real logic should merge all sources
    const docs = uploadedFiles.map(f => ({
      id: f.filename,
      contentType: "Proposal",
      fileName: f.original_name,
      uploadedAt: f.uploaded_at,
      updatedAt: f.uploaded_at,
      analyzed: false, // TODO: real logic
    }));
    const business = businessFiles.map(f => ({
      id: f.filename,
      contentType: "Business knowledge",
      fileName: f.original_name,
      uploadedAt: f.uploaded_at,
      updatedAt: f.uploaded_at,
      analyzed: false,
    }));
    const prices = pricing.map(p => ({
      id: p.id,
      contentType: "Pricing",
      fileName: p.headline,
      uploadedAt: p.created_at,
      updatedAt: p.created_at,
      analyzed: false,
    }));
    const websites = DATA_SOURCES.map(w => ({
      id: w.id,
      contentType: "Website data",
      fileName: w.name,
      uploadedAt: w.updated,
      updatedAt: w.updated,
      analyzed: false,
    }));
    return [...docs, ...business, ...prices, ...websites];
  }, [uploadedFiles, businessFiles, pricing]);

  // Table columns
  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "contentType", header: "Content type" },
    { accessorKey: "fileName", header: "File name" },
    { accessorKey: "uploadedAt", header: "Uploaded at", cell: ({ row }) => new Date(row.original.uploadedAt).toLocaleString() },
    { accessorKey: "updatedAt", header: "Updated at", cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString() },
    {
      accessorKey: "analyzed",
      header: "Analyzed",
      cell: ({ row }) => row.original.analyzed ? (
        <Badge variant="secondary" className="bg-green-500 text-white flex items-center gap-1"><CheckIcon className="w-4 h-4" /> <span className="text-white">Analyzed</span></Badge>
      ) : (
        <Badge variant="destructive" className="bg-red-600 text-white flex items-center gap-1"><AlertCircleIcon className="w-4 h-4" /> <span className="text-white">Not analyzed</span></Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right w-full">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: unifiedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  // Multistep modal logic
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setModalStep(1);
    if (type === "Website data") setWebsiteUrls([""]); // reset URLs
  };
  const handleModalBack = () => {
    if (modalStep === 0) setModalOpen(false);
    else setModalStep(s => s - 1);
  };

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
    else if (activeTab === "website") setTitle("Website")
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

  // Modal step handlers
  const handleWebsiteTypeSelect = (type: string) => {
    setWebsiteSelectedType(type);
    setWebsiteStep(1);
  };
  const handleWebsiteUrlChange = (idx: number, value: string) => {
    setWebsiteUrls(urls => urls.map((u, i) => (i === idx ? value : u)));
  };
  const addWebsiteUrlField = () => setWebsiteUrls(urls => [...urls, ""]);
  // Table row selection
  const toggleWebsiteRow = (id: number) => {
    setWebsiteSelectedRows(rows => rows.includes(id) ? rows.filter(r => r !== id) : [...rows, id]);
  };

  // Save handler for modal
  const handleModalSave = async () => {
    setModalSaving(true);
    try {
      if (selectedType === "Pricing") {
        if (!pricingName || !pricingValue) throw new Error("Service name and price are required");
        if (!businessId) throw new Error("No business ID found");
        const { error } = await supabase.from("pricing").insert({
          business_id: businessId,
          headline: pricingName,
          description: pricingDescription,
          price: parseFloat(pricingValue),
        });
        if (error) throw error;
      }
      // Proposals and Business knowledge (CSV) handled by ImageUploadDemo, but ensure metadata is inserted
      // (Assume ImageUploadDemo already uploads to storage and inserts metadata into documents)
      // If you want to handle manual insertion here, add logic as needed
      setModalOpen(false);
      // Optionally, refresh data here
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to save");
      }
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button onClick={() => { setModalOpen(true); setModalStep(0); setSelectedType(null); }}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add new
          </Button>
          <Button
            variant="default"
            disabled={Object.keys(rowSelection).length === 0}
            onClick={() => {/* TODO: handle analyze action */}}
          >
            Analyze
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow border p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.column.id === 'actions' ? 'text-right' : ''}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'text-right' : ''}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          {modalStep === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select content type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Proposals", "Business knowledge", "Pricing", "Website data"].map(type => (
                  <Button key={type} variant={selectedType === type ? "default" : "outline"} onClick={() => handleTypeSelect(type)}>{type}</Button>
                ))}
              </div>
            </div>
          )}
          {modalStep === 1 && selectedType && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Add {selectedType}</h2>
              {selectedType === "Website data" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Website URLs</label>
                  {websiteUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input
                        placeholder="https://example.com"
                        value={url}
                        onChange={e => setWebsiteUrls(urls => urls.map((u, i) => i === idx ? e.target.value : u))}
                      />
                      {websiteUrls.length > 1 && (
                        <Button variant="destructive" size="icon" onClick={() => setWebsiteUrls(urls => urls.filter((_, i) => i !== idx))}>-</Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => setWebsiteUrls(urls => [...urls, ""])} className="w-full mb-2">+ Add another URL</Button>
                </div>
              )}
              {selectedType === "Proposals" && (
                <div className="mb-4">
                  <ImageUploadDemo />
                </div>
              )}
              {selectedType === "Business knowledge" && (
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant={businessKnowledgeMode === 'csv' ? 'default' : 'outline'}
                      onClick={() => setBusinessKnowledgeMode('csv')}
                    >
                      Upload CSV
                    </Button>
                    <Button
                      variant={businessKnowledgeMode === 'manual' ? 'default' : 'outline'}
                      onClick={() => setBusinessKnowledgeMode('manual')}
                    >
                      Write manually
                    </Button>
                  </div>
                  {businessKnowledgeMode === 'csv' ? (
                    <ImageUploadDemo />
                  ) : (
                    <textarea
                      className="w-full px-3 py-2 rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={5}
                      placeholder="Enter business knowledge manually..."
                      value={businessKnowledgeText}
                      onChange={e => setBusinessKnowledgeText(e.target.value)}
                    />
                  )}
                </div>
              )}
              {selectedType === "Pricing" && (
                <div className="mb-4 space-y-2">
                  <Input
                    placeholder="Service name"
                    value={pricingName}
                    onChange={e => setPricingName(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={pricingDescription}
                    onChange={e => setPricingDescription(e.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price (€)"
                    value={pricingValue}
                    onChange={e => setPricingValue(e.target.value)}
                  />
                </div>
              )}
              <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={handleModalBack} disabled={modalSaving}>Back</Button>
                <Button onClick={handleModalSave} disabled={modalSaving}>{modalSaving ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 