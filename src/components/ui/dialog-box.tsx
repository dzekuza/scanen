import React, { useState, ChangeEvent, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const SendProposalDialog = () => {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setClientName(e.target.value);
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setClientEmail(e.target.value);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSend = () => {
    // TODO: Implement send logic (e.g., API call)
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>Send Proposal</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-neutral-900 animate-fadeIn">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-2xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-1 tracking-tight">Send Proposal</h2>
            <p className="text-neutral-500 mb-7 text-sm">Enter your client's name and email. They'll receive a link to answer questions.</p>
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} autoComplete="off">
              <div className="mb-5">
                <label htmlFor="clientName" className="block text-sm font-semibold mb-2">Client Name</label>
                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300 focus:outline-none transition"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="mb-8">
                <label htmlFor="clientEmail" className="block text-sm font-semibold mb-2">Client Email</label>
                <input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300 focus:outline-none transition"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export function BusinessDetailsModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    logoFile: null as File | null,
    logoUrl: "",
    email: "",
    phone: "",
    // Add more fields as needed
  });

  // Check if user has any businesses
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id);
      if (!data || data.length === 0) {
        onOpenChange(true);
      }
    })();
  }, [user, onOpenChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "logoFile" && files) {
      setForm(f => ({ ...f, logoFile: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleLogoUpload = async () => {
    if (!form.logoFile) return "";
    const fileName = `logos/${Date.now()}-${form.logoFile.name}`;
    const { data, error } = await supabase.storage
      .from("files")
      .upload(fileName, form.logoFile, { upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("files").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to create a business.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    let logoUrl = "";
    try {
      if (form.logoFile) {
        logoUrl = await handleLogoUpload();
      }
      const { error } = await supabase.from("businesses").insert([
        {
          user_id: user.id,
          name: form.name,
          description: form.description,
          logo_url: logoUrl,
          email: form.email,
          phone: form.phone,
          // Add more fields as needed
        },
      ]);
      if (error) throw error;
      setSuccess("Business created successfully!");
      setForm({ name: "", description: "", logoFile: null, logoUrl: "", email: "", phone: "" });
      setStep(0);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to create business.");
    }
    setLoading(false);
  };

  const steps = [
    {
      label: "Business Name",
      content: (
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter business name"
          required
        />
      ),
    },
    {
      label: "Business Description",
      content: (
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your business"
          className="w-full border rounded p-2"
          required
        />
      ),
    },
    {
      label: "Business Logo (optional)",
      content: (
        <Input
          name="logoFile"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      ),
    },
    {
      label: "Email",
      content: (
        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Business email"
          required
        />
      ),
    },
    {
      label: "Phone",
      content: (
        <Input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Business phone"
          required
        />
      ),
    },
    // Add more steps as needed
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Business Details</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (step === steps.length - 1) handleSubmit();
            else setStep(s => s + 1);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">{steps[step].label}</label>
            {steps[step].content}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex gap-2 justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
            >
              Back
            </Button>
            <Button type="submit" disabled={loading || !user}>
              {loading ? "Saving..." : step === steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/*
Supabase RLS Policies for 'businesses' table:

1. Enable RLS on the table.

2. Policy: Allow insert if user_id matches auth.uid()
CREATE POLICY "Users can insert their own businesses" ON businesses
  FOR INSERT USING (user_id = auth.uid());

3. Policy: Allow select if user_id matches auth.uid()
CREATE POLICY "Users can view their own businesses" ON businesses
  FOR SELECT USING (user_id = auth.uid());

4. Policy: Allow update if user_id matches auth.uid()
CREATE POLICY "Users can update their own businesses" ON businesses
  FOR UPDATE USING (user_id = auth.uid());

5. Policy: Allow delete if user_id matches auth.uid()
CREATE POLICY "Users can delete their own businesses" ON businesses
  FOR DELETE USING (user_id = auth.uid());
*/ 