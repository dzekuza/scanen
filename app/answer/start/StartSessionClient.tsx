"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StartSessionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams?.get("customer_id") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(true);
  const [emailInput, setEmailInput] = useState("");

  // Fetch customer info if customer_id is present
  useEffect(() => {
    if (!customerId) return;
    async function fetchCustomer() {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("id, email")
        .eq("id", customerId)
        .single();
      if (data) {
        setCustomer(data);
        setEmailInput(data.email);
        setEmailModalOpen(false);
        // Immediately start session
        startSession(data.id, data.email);
      }
      setLoading(false);
    }
    fetchCustomer();
  }, [customerId]);

  const startSession = async (customerId: string, email: string) => {
    setLoading(true);
    setError(null);
    // Fetch the customer to get business_id
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, business_id, email")
      .eq("id", customerId)
      .single();
    if (customerError || !customer) {
      setLoading(false);
      setError("Customer not found or missing business.");
      return;
    }
    // Create a new customer session
    const { data, error } = await supabase
      .from("customer_sessions")
      .insert([
        {
          customer_id: customerId,
          business_id: customer.business_id,
          email,
          status: "in_progress",
        },
      ])
      .select("id")
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data && data.id) {
      router.push(`/answer/${data.id}`);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Try to find customer by email
    const { data: existingCustomer, error: findError } = await supabase
      .from("customers")
      .select("id, email")
      .eq("email", emailInput)
      .single();
    if (findError && findError.code !== "PGRST116") {
      setLoading(false);
      setError(findError.message);
      return;
    }
    if (existingCustomer && existingCustomer.id) {
      setCustomer(existingCustomer);
      setEmailModalOpen(false);
      // Immediately start session
      startSession(existingCustomer.id, existingCustomer.email);
    } else {
      setError("No customer found with this email.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Dialog open={emailModalOpen} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Email</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              id="emailInput"
              name="emailInput"
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" isDisabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 