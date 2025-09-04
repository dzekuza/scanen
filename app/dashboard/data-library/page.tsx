"use client"

import * as React from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState, useRef } from "react"
import { useDashboardTitle } from "@/components/dashboard-title-context"
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, PlusIcon, GlobeIcon, FileTextIcon, UploadIcon, FileIcon, FileCodeIcon, ListIcon } from "lucide-react"
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
  
  // All data types state
  const [csvFiles, setCsvFiles] = useState<FileMeta[]>([])
  const [jsonFiles, setJsonFiles] = useState<FileMeta[]>([])
  const [websiteSources, setWebsiteSources] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState("")
  
  // Manual Q&A state
  const [manualQuestion, setManualQuestion] = useState("")
  const [manualAnswer, setManualAnswer] = useState("")
  const [manualEntries, setManualEntries] = useState<any[]>([])

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

  // Combine all data types into one unified table
  const filteredData = React.useMemo(() => {
    const allData = [
      // PDF files
      ...uploadedFiles.filter(f => 
        f.original_name.toLowerCase().endsWith('.pdf') || 
        f.original_name.startsWith('PDF from URL:')
      ).map(f => ({
      id: f.filename,
        contentType: f.original_name.startsWith('PDF from URL:') ? "PDF URL" : "PDF Document",
      fileName: f.original_name,
      uploadedAt: f.uploaded_at,
      updatedAt: f.uploaded_at,
        analyzed: f.original_name.startsWith('PDF from URL:'),
      })),
      // CSV files
      ...csvFiles.map(f => ({
      id: f.filename,
        contentType: "CSV Data",
      fileName: f.original_name,
      uploadedAt: f.uploaded_at,
      updatedAt: f.uploaded_at,
      analyzed: false,
      })),
      // JSON files
      ...jsonFiles.map(f => ({
        id: f.filename,
        contentType: "JSON Data",
        fileName: f.original_name,
        uploadedAt: f.uploaded_at,
        updatedAt: f.uploaded_at,
        analyzed: false,
      })),
      // Products
      ...products.map(p => ({
      id: p.id,
        contentType: "Product",
        fileName: p.headline || p.name || p.title,
      uploadedAt: p.created_at,
        updatedAt: p.updated_at || p.created_at,
      analyzed: false,
      })),
      // Website sources
      ...websiteSources.map(w => ({
      id: w.id,
        contentType: "Website Source",
        fileName: w.url,
        uploadedAt: w.created_at,
        updatedAt: w.created_at,
      analyzed: false,
      })),
      // Manual Q&A entries
      ...manualEntries.map(m => ({
        id: m.id,
        contentType: "Manual Q&A",
        fileName: m.question,
        uploadedAt: m.created_at,
        updatedAt: m.created_at,
        analyzed: false,
      })),
    ];
    
    return allData.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [uploadedFiles, csvFiles, products, jsonFiles, websiteSources, manualEntries]);

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
    data: filteredData,
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

  // Fetch products (same as pricing for now)
  useEffect(() => {
    if (!businessId) return;
    (async () => {
      const { data, error } = await supabase
        .from("pricing")
        .select("id, headline, description, created_at, price")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      setProducts(data || []);
    })();
  }, [businessId]);

  // Fetch website sources
  useEffect(() => {
    if (!businessId) return;
    (async () => {
      const { data, error } = await supabase
        .from("website_sources")
        .select("id, url, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      setWebsiteSources(data || []);
    })();
  }, [businessId]);

  // Fetch CSV and JSON files
  useEffect(() => {
    if (!user) return;
    const fetchFilesByType = async (fileType: string) => {
      const isAdmin = user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";
      let query = supabase.from("documents").select("filename, original_name, uploaded_at, user_id");
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }
      const { data, error } = await query.order("uploaded_at", { ascending: false });
      
      if (!error && data) {
        const files = data
          .filter(file => file.original_name.toLowerCase().endsWith(`.${fileType}`))
          .map((file) => {
            const { data: urlData } = supabase.storage
              .from("files")
              .getPublicUrl(file.filename);
            return {
              ...file,
              url: urlData.publicUrl,
            };
          });
        
        if (fileType === 'csv') {
          setCsvFiles(files);
        } else if (fileType === 'json') {
          setJsonFiles(files);
        }
      }
    };
    
    fetchFilesByType('csv');
    fetchFilesByType('json');
  }, [user]);

  useEffect(() => {
    setTitle("Data Library")
  }, [setTitle])

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
      if (selectedType === "PDF Document") {
        if (!user) throw new Error("You must be logged in")
        let publicUrl: string | null = null
        let sourceType: 'file' | 'url' | null = null

        if (pdfFile) {
          const storagePath = `docs/${Date.now()}-${pdfFile.name}`
          const { error: uploadErr } = await supabase.storage
            .from("files")
            .upload(storagePath, pdfFile, {
              contentType: pdfFile.type || 'application/pdf',
              upsert: false,
            })
          if (uploadErr) throw uploadErr
          const { data: urlData } = supabase.storage.from('files').getPublicUrl(storagePath)
          publicUrl = urlData.publicUrl
          sourceType = 'file'
          await supabase.from('documents').insert({
            filename: storagePath,
            original_name: pdfFile.name,
            uploaded_at: new Date().toISOString(),
            user_id: user.id,
            ...(businessId ? { business_id: businessId } : {}),
          })
        } else if (pdfUrl.trim()) {
          publicUrl = pdfUrl.trim()
          sourceType = 'url'
          // Save URL to documents table
          await supabase.from('documents').insert({
            filename: `url-${Date.now()}`,
            original_name: `PDF from URL: ${pdfUrl.trim()}`,
            uploaded_at: new Date().toISOString(),
            user_id: user.id,
            ...(businessId ? { business_id: businessId } : {}),
          })
        } else {
          throw new Error('Provide a PDF file or a URL')
        }

        const questions = [
          { question_text: "Kokia yra Jūsų prekės ženklo vizija ir vertybės, kurias norite atspindėti svetainėje?", question_type: "open-ended", order_index: 1, is_required: true, user_id: "default_user" },
          { question_text: "Kas yra Jūsų tikslinė auditorija ir kokie yra jos poreikiai bei lūkesčiai?", question_type: "open-ended", order_index: 2, is_required: true, user_id: "default_user" },
          { question_text: "Ar turite esamą vizualinį identitetą (logotipą, spalvas, šriftus) ir ar jam reikalingas atnaujinimas?", question_type: "multiple-choice", order_index: 3, is_required: true, user_id: "default_user" },
          { question_text: "Jei taip, ar turite brandbook'ą arba stiliaus gaires?", question_type: "yes/no", order_index: 4, is_required: false, user_id: "default_user" },
          { question_text: "Kiek puslapių planuojate turėti svetainėje ir kokia informacija turėtų būti pateikta kiekviename iš jų?", question_type: "open-ended", order_index: 5, is_required: true, user_id: "default_user" },
          { question_text: "Kokios pagrindinės funkcijos turėtų būti įdiegtos svetainėje (pvz., prekių užsakymas, PDF atsisiuntimo centras, kontaktinė forma)?", question_type: "open-ended", order_index: 6, is_required: true, user_id: "default_user" },
          { question_text: "Ar planuojate naudoti svetainę keliomis kalbomis? Jei taip, kokios kalbos Jums aktualios?", question_type: "multiple-choice", order_index: 7, is_required: true, user_id: "default_user" },
          { question_text: "Ar turite konkretų svetainės dizaino pavyzdį arba viziją, kuria galėtume remtis?", question_type: "yes/no", order_index: 8, is_required: false, user_id: "default_user" },
          { question_text: "Ar Jums reikalinga turinio valdymo sistema (CMS), tokia kaip WordPress, kad galėtumėte patys atnaujinti svetainės turinį?", question_type: "yes/no", order_index: 9, is_required: true, user_id: "default_user" },
          { question_text: "Ar turite serverį svetainei talpinti? Jei ne, ar norėtumėte mūsų rekomendacijos?", question_type: "yes/no", order_index: 10, is_required: true, user_id: "default_user" },
          { question_text: "Ar Jums reikalingos SEO paslaugos, kad Jūsų svetainė būtų geriau matoma Google paieškos rezultatuose?", question_type: "yes/no", order_index: 11, is_required: true, user_id: "default_user" },
          { question_text: "Ar Jums reikalingas tekstų kūrimas svetainei? Jei taip, kokia kalba?", question_type: "multiple-choice", order_index: 12, is_required: false, user_id: "default_user" },
          { question_text: "Ar Jums reikalingas foto/video turinys svetainei?", question_type: "yes/no", order_index: 13, is_required: false, user_id: "default_user" },
          { question_text: "Koks yra Jūsų biudžetas svetainės kūrimui?", question_type: "number", order_index: 14, is_required: false, user_id: "default_user" },
          { question_text: "Kada norėtumėte paleisti svetainę?", question_type: "date", order_index: 15, is_required: true, user_id: "default_user" },
          { question_text: "Ar Jums aktualus svetainės pritaikymas mobiliesiems įrenginiams (responsive design)?", question_type: "yes/no", order_index: 16, is_required: true, user_id: "default_user" },
          { question_text: "Ar turite kokius nors specifinius reikalavimus svetainės saugumui?", question_type: "open-ended", order_index: 17, is_required: false, user_id: "default_user" },
          { question_text: "Kokie yra trys svarbiausi aspektai Jūsų naujai svetainei?", question_type: "open-ended", order_index: 18, is_required: true, user_id: "default_user" },
          { question_text: "Ar integruosite svetainę su kitomis sistemomis, pvz., CRM ar el. pašto rinkodaros įrankiais?", question_type: "yes/no", order_index: 19, is_required: false, user_id: "default_user" },
          { question_text: "Kokie yra Jūsų lūkesčiai dėl svetainės našumo (greitis, stabilumas)?", question_type: "open-ended", order_index: 20, is_required: true, user_id: "default_user" }
        ]

        // Send webhook for analysis with async processing
        const webhookResponse = await fetch('https://n8n.srv824584.hstgr.cloud/webhook/analyze-offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_url: publicUrl,
            source_type: sourceType,
            user_id: user.id,
            business_id: businessId,
            questions,
            // Add async processing flags for PDF.co
            async: true,
            cache: sourceType === 'url' && publicUrl.includes('drive.google.com') ? `cache:${publicUrl}` : publicUrl,
          })
        })

        if (!webhookResponse.ok) {
          throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`)
        }

        const webhookResult = await webhookResponse.json()
        console.log('Webhook response:', webhookResult)

        // Show success message
        alert('PDF added successfully! Analysis is processing in the background.')

        // Refresh the PDF list
        const { data: refreshedData } = await supabase
          .from("documents")
          .select("filename, original_name, uploaded_at, user_id")
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false })
        
        if (refreshedData) {
          const files = refreshedData.map((file) => {
            const { data: urlData } = supabase.storage
              .from("files")
              .getPublicUrl(file.filename)
            return {
              ...file,
              url: urlData.publicUrl,
            }
          })
          setUploadedFiles(files)
        }

        setPdfFile(null)
        setPdfUrl("")
      } else if (selectedType === "Product") {
        if (!pricingName || !pricingValue) throw new Error("Product name and price are required");
        if (!businessId) throw new Error("No business ID found");
        const { error } = await supabase.from("pricing").insert({
          business_id: businessId,
          headline: pricingName,
          description: pricingDescription,
          price: parseFloat(pricingValue),
        });
        if (error) throw error;
        // Refresh products data
        const { data } = await supabase
          .from("pricing")
          .select("id, headline, description, created_at, price")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false });
        setProducts(data || []);
      } else if (selectedType === "Website Source") {
        if (!websiteUrls.some(url => url.trim())) throw new Error("At least one website URL is required");
        if (!businessId) throw new Error("No business ID found");
        
        // Insert website sources
        const websiteInserts = websiteUrls
          .filter(url => url.trim())
          .map(url => ({
            business_id: businessId,
            url: url.trim(),
          }));
        
        const { error } = await supabase.from("website_sources").insert(websiteInserts);
        if (error) throw error;
        
        // Refresh website sources data
        const { data } = await supabase
          .from("website_sources")
          .select("id, url, created_at")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false });
        setWebsiteSources(data || []);
      } else if (selectedType === "Manual") {
        if (!manualQuestion.trim() || !manualAnswer.trim()) throw new Error("Both question and answer are required");
        if (!businessId) throw new Error("No business ID found");
        
        // Create a new manual entry
        const newEntry = {
          id: `manual-${Date.now()}`,
          question: manualQuestion.trim(),
          answer: manualAnswer.trim(),
          created_at: new Date().toISOString(),
          business_id: businessId,
        };
        
        // Add to local state
        setManualEntries(prev => [newEntry, ...prev]);
        
        // Clear form
        setManualQuestion("");
        setManualAnswer("");
      }
      // PDF, CSV, and JSON uploads are handled by ImageUploadDemo component
      setModalOpen(false);
      setPricingName("");
      setPricingDescription("");
      setPricingValue("");
      setWebsiteUrls([""]);
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
        <h1 className="text-2xl font-semibold">Data Library</h1>
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
          <DialogHeader>
            <DialogTitle>Add New Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
          {modalStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Data Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTypeSelect("PDF Document")}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <FileTextIcon className="h-6 w-6 mb-2" />
                    PDF Document
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTypeSelect("CSV Data")}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <FileIcon className="h-6 w-6 mb-2" />
                    CSV Data
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTypeSelect("JSON Data")}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <FileCodeIcon className="h-6 w-6 mb-2" />
                    JSON Data
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTypeSelect("Product")}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <ListIcon className="h-6 w-6 mb-2" />
                    Product
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTypeSelect("Website Source")}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <GlobeIcon className="h-6 w-6 mb-2" />
                    Website Source
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTypeSelect("Manual")}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <FileTextIcon className="h-6 w-6 mb-2" />
                    Manual Q&A
                  </Button>
              </div>
            </div>
          )}
            {modalStep === 1 && selectedType === "PDF Document" && (
              <div className="space-y-4">
            <div>
                  <label className="block text-sm font-medium mb-2">Upload PDF Document</label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">or Add by URL</label>
                      <Input
                    placeholder="https://example.com/file.pdf"
                    value={pdfUrl}
                    onChange={e => setPdfUrl(e.target.value)}
                  />
                    </div>
                </div>
              )}
            {modalStep === 1 && selectedType === "CSV Data" && (
              <div>
                <label className="block text-sm font-medium mb-2">Upload CSV File</label>
                  <ImageUploadDemo />
                </div>
              )}
            {modalStep === 1 && selectedType === "JSON Data" && (
              <div>
                <label className="block text-sm font-medium mb-2">Upload JSON File</label>
                    <ImageUploadDemo />
                </div>
              )}
            {modalStep === 1 && selectedType === "Product" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <Input
                    placeholder="Enter product name"
                    value={pricingName}
                    onChange={e => setPricingName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    placeholder="Enter product description"
                    value={pricingDescription}
                    onChange={e => setPricingDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (€)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    value={pricingValue}
                    onChange={e => setPricingValue(e.target.value)}
                  />
                </div>
                </div>
              )}
            {modalStep === 1 && selectedType === "Website Source" && (
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
            {modalStep === 1 && selectedType === "Manual" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <Input
                    placeholder="Enter your question"
                    value={manualQuestion}
                    onChange={e => setManualQuestion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Answer</label>
                  <Input
                    placeholder="Enter the answer"
                    value={manualAnswer}
                    onChange={e => setManualAnswer(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            {modalStep === 1 && (
              <Button variant="outline" onClick={handleModalBack}>Back</Button>
            )}
            {modalStep === 1 && (
              <Button onClick={handleModalSave} disabled={modalSaving}>
                {modalSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 