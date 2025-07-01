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

  useEffect(() => {
    setTitle("Customers");
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTitle]);

  const fetchCustomers = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setCustomers(data || []);
    setLoading(false);
  };

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
    const { error } = await supabase.from("customers").insert([
      {
        name: customerName,
        surname: customerSurname,
        email: customerEmail,
        user_id: user.id,
      },
    ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Customer added successfully!");
      setCustomerName("");
      setCustomerSurname("");
      setCustomerEmail("");
      setOpen(false);
      fetchCustomers();
    }
    setLoading(false);
  };

  // Placeholder handlers for actions
  const handleSendProposal = (customer: any) => {
    // TODO: Open send proposal modal for this customer
    alert(`Send proposal to ${customer.name} ${customer.surname}`);
  };

  const handleCopyProposalLink = (customer: any) => {
    // TODO: Generate and copy proposal link for this customer
    const link = `${window.location.origin}/answer/start?customer_id=${customer.id}`;
    navigator.clipboard.writeText(link);
    alert("Proposal link copied to clipboard!");
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-semibold">Customers</span>
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
                  <Button type="button" variant="outline" isDisabled={loading}>Cancel</Button>
                </DialogClose>
                <Button type="submit" isDisabled={loading}>{loading ? "Adding..." : "Add Customer"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Customer table/list */}
      <div className="rounded border border-muted p-0 text-muted-foreground">
        {loading ? (
          <div className="p-8 text-center">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center">No customers yet.</div>
        ) : (
          <DataTable data={customers.map((c, idx) => ({
            id: c.id || idx,
            header: c.name,
            type: c.surname,
            status: "Done",
            target: c.email,
            limit: "-",
            reviewer: "-"
          }))} />
        )}
      </div>
    </div>
  );
} 