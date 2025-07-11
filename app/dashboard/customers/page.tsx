"use client"

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useDashboardTitle } from "@/components/dashboard-title-context";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabaseClient";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CustomersPage() {
  const { setTitle } = useDashboardTitle();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerSurname, setCustomerSurname] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [pricing, setPricing] = useState<any[]>([]);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any | null>(null);
  const [priceHeadline, setPriceHeadline] = useState("");
  const [priceDescription, setPriceDescription] = useState("");
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, surname, email, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    setTitle("Customers");
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTitle]);

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

  useEffect(() => {
    if (!businessId) return;
    (async () => {
      setPricingLoading(true);
      const { data, error } = await supabase
        .from("pricing")
        .select("id, headline, description, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      setPricing(data || []);
      setPricingLoading(false);
    })();
  }, [businessId]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!user) {
      setError("You must be logged in to add a customer.");
      setLoading(false);
      return;
    }
    // Fetch the user's business_id
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!business) {
      setError("No business found for this user.");
      setLoading(false);
      return;
    }
    const fingerprint = uuidv4();
    const { data: inserted, error } = await supabase.from("customers").insert([
      {
        name: customerName,
        surname: customerSurname,
        email: customerEmail,
        user_id: user.id,
        business_id: business.id,
        fingerprint,
      },
    ]).select("id, fingerprint").single();
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Customer added successfully!");
      setCustomerName("");
      setCustomerSurname("");
      setCustomerEmail("");
      setOpen(false);
      fetchCustomers();
      // Generate and copy the answer link
      const link = `${window.location.origin}/answer/start?user_id=${inserted.id}&token=${inserted.fingerprint}`;
      await navigator.clipboard.writeText(link);
      alert("Answer link copied to clipboard!\n" + link);
    }
    setLoading(false);
  };

  // Placeholder handlers for actions
  const handleEditCustomer = (customer: any) => {
    alert(`Edit customer: ${customer.name} ${customer.surname}`);
  };

  const handleSendProposal = (customer: any) => {
    alert(`Send proposal to ${customer.name} ${customer.surname}`);
  };

  const handleResendProposal = (customer: any) => {
    alert(`Resend proposal to ${customer.name} ${customer.surname}`);
  };

  const handlePreviewProposal = (customer: any) => {
    alert(`Preview proposal for ${customer.name} ${customer.surname}`);
  };

  const handleCopyAnswerLink = async (customer: any) => {
    const link = `${window.location.origin}/answer/start?user_id=${customer.id}&token=${customer.fingerprint}`;
    await navigator.clipboard.writeText(link);
    alert("Answer link copied to clipboard!\n" + link);
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name} ${customer.surname}?`)) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("customers").delete().eq("id", customer.id);
    if (error) setError(error.message);
    else fetchCustomers();
    setLoading(false);
  };

  const handleOpenPricingModal = (price?: any) => {
    setEditingPrice(price || null);
    setPriceHeadline(price?.headline || "");
    setPriceDescription(price?.description || "");
    setPricingModalOpen(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setPricingLoading(true);
    setPricingError(null);
    if (editingPrice) {
      // Update
      const { error } = await supabase
        .from("pricing")
        .update({ headline: priceHeadline, description: priceDescription })
        .eq("id", editingPrice.id);
      if (error) setPricingError(error.message);
    } else {
      // Insert
      const { error } = await supabase
        .from("pricing")
        .insert([{ business_id: businessId, headline: priceHeadline, description: priceDescription }]);
      if (error) setPricingError(error.message);
    }
    setPricingModalOpen(false);
    setEditingPrice(null);
    setPriceHeadline("");
    setPriceDescription("");
    // Refresh
    const { data } = await supabase
      .from("pricing")
      .select("id, headline, description, created_at")
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
      .select("id, headline, description, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    setPricing(data || []);
    setPricingLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex gap-2 mb-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Add Customer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Enter the customer's details to add them to your list.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium mb-1">Name</label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="customerSurname" className="block text-sm font-medium mb-1">Surname</label>
                  <input
                    id="customerSurname"
                    type="text"
                    value={customerSurname}
                    onChange={e => setCustomerSurname(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">Email</label>
                  <input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={loading}
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Customer"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            onClick={() => selectedCustomers.length > 0 && handleEditCustomer(selectedCustomers[0])}
            disabled={selectedCustomers.length === 0}
          >
            Edit
          </Button>
        </div>
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            onClick={() => selectedCustomers.forEach(handleSendProposal)}
            disabled={selectedCustomers.length === 0}
          >
            Send Proposal
          </Button>
          <Button
            size="sm"
            onClick={() => selectedCustomers.forEach(handleResendProposal)}
            disabled={selectedCustomers.length === 0}
          >
            Resend
          </Button>
          <Button
            size="sm"
            onClick={() => selectedCustomers.forEach(handlePreviewProposal)}
            disabled={selectedCustomers.length === 0}
          >
            Preview Proposal
          </Button>
        </div>
      </div>
      {/* Customer table/list */}
      {loading ? (
        <div className="p-8 text-center">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="p-8 text-center">No customers yet.</div>
      ) : (
        <>
          <DataTable
            data={customers.map((c, idx) => ({
              id: c.id || idx,
              name: c.name,
              surname: c.surname,
              email: c.email,
              created_at: c.created_at,
              status: idx % 2 === 0 ? "Proposal sent" : "Proposal filled"
            }))}
            columns={[
              {
                id: 'select',
                header: ({ table }) => (
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
              { accessorKey: 'name', header: 'Name' },
              { accessorKey: 'surname', header: 'Surname' },
              { accessorKey: 'email', header: 'Email' },
              { accessorKey: 'status', header: 'Status',
                cell: info => (
                  <Badge variant={info.getValue() === "Proposal filled" ? "default" : "outline"}>
                    {info.getValue()}
                  </Badge>
                )
              },
              { accessorKey: 'actions', header: 'Actions',
                cell: info => {
                  const row = info.row.original;
                  return (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEditCustomer(row)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleCopyAnswerLink(row)}>
                        Copy Link
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteCustomer(row)}>
                        Delete
                      </Button>
                    </div>
                  );
                }
              },
            ] as ColumnDef<any, any>[]}
            getRowId={row => row.id}
            onRowSelectionChange={setSelectedCustomers}
          />
        </>
      )}
    </div>
  );
} 