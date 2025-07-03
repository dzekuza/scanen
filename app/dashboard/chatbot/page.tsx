"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlusIcon, GlobeIcon, FileTextIcon, UploadIcon } from "lucide-react";
import { ImageUploadDemo } from "@/components/ui/image-upload-demo";

const DATA_SOURCES = [
  { id: 1, name: "scanen.vercel.app", type: "Website", usedBy: ["Lyro", "Copilot"], updated: "Jul 3, 2025, 10:42 PM" },
];

export default function ChatbotPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>([""]);

  // Table selection state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Modal step handlers
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setStep(1);
  };

  const handleUrlChange = (idx: number, value: string) => {
    setUrls(urls => urls.map((u, i) => (i === idx ? value : u)));
  };

  const addUrlField = () => setUrls(urls => [...urls, ""]);

  // Table row selection
  const toggleRow = (id: number) => {
    setSelectedRows(rows => rows.includes(id) ? rows.filter(r => r !== id) : [...rows, id]);
  };

  return (
    <div className="px-4 lg:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data sources</h1>
        <div className="flex gap-2">
          <Button onClick={() => setUploadModalOpen(true)} variant="default">
            Upload files
          </Button>
          <Button onClick={() => { setModalOpen(true); setStep(0); setSelectedType(null); setUrls([""]); }}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add new source
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow border p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3"><Checkbox checked={selectedRows.length === DATA_SOURCES.length} onCheckedChange={checked => setSelectedRows(checked ? DATA_SOURCES.map(d => d.id) : [])} /></th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Used by</th>
              <th className="p-3 text-left">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {DATA_SOURCES.map(ds => (
              <tr key={ds.id} className="border-b hover:bg-muted">
                <td className="p-3"><Checkbox checked={selectedRows.includes(ds.id)} onCheckedChange={() => toggleRow(ds.id)} /></td>
                <td className="p-3 font-medium">{ds.name}</td>
                <td className="p-3">{ds.type}</td>
                <td className="p-3 flex gap-2">{ds.usedBy.map(u => <span key={u} className="bg-muted px-2 py-0.5 rounded text-xs">{u}</span>)}</td>
                <td className="p-3">{ds.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-lg">
          <ImageUploadDemo />
        </DialogContent>
      </Dialog>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Add more knowledge</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button type="button" onClick={() => handleTypeSelect('website')} className={`flex flex-col items-center p-6 cursor-pointer border-2 rounded-lg bg-white transition-colors ${selectedType === 'website' ? 'border-primary' : 'border-muted'}`}> 
                  <GlobeIcon className="h-8 w-8 mb-2" />
                  <span className="font-medium">Website URL</span>
                </button>
                <button type="button" onClick={() => handleTypeSelect('manual')} className={`flex flex-col items-center p-6 cursor-pointer border-2 rounded-lg bg-white transition-colors ${selectedType === 'manual' ? 'border-primary' : 'border-muted'}`}> 
                  <FileTextIcon className="h-8 w-8 mb-2" />
                  <span className="font-medium">Add manually</span>
                </button>
                <button type="button" onClick={() => handleTypeSelect('csv')} className={`flex flex-col items-center p-6 cursor-pointer border-2 rounded-lg bg-white transition-colors ${selectedType === 'csv' ? 'border-primary' : 'border-muted'}`}> 
                  <UploadIcon className="h-8 w-8 mb-2" />
                  <span className="font-medium">Import from CSV</span>
                </button>
              </div>
            </div>
          )}
          {step === 1 && selectedType === 'website' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Provide website URLs</h2>
              <div className="space-y-2">
                {urls.map((url, idx) => (
                  <Input key={idx} placeholder="https://example.com" value={url} onChange={e => handleUrlChange(idx, e.target.value)} className="mb-2" />
                ))}
                <Button variant="outline" onClick={addUrlField} className="w-full mb-2">+ Add another URL</Button>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setModalOpen(false)}>Save</Button>
              </div>
            </div>
          )}
          {/* Placeholder for other types */}
          {step === 1 && selectedType === 'manual' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Add knowledge manually</h2>
              <div className="mb-4">(Manual entry form placeholder)</div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setModalOpen(false)}>Save</Button>
              </div>
            </div>
          )}
          {step === 1 && selectedType === 'csv' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Import from CSV</h2>
              <div className="mb-4">(CSV upload form placeholder)</div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setModalOpen(false)}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 