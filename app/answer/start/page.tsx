"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StartSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams?.get("customer_id") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
  });

  // Fetch customer info if customer_id is present
  useEffect(() => {
    if (!customerId) return;
    async function fetchCustomer() {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("name, surname, email")
        .eq("id", customerId)
        .single();
      if (data) {
        setCustomer(data);
        setForm(f => ({ ...f, ...data }));
      }
      setLoading(false);
    }
    fetchCustomer();
  }, [customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Create a new customer session
    const { data, error } = await supabase.from("customer_sessions").insert([
      {
        customer_id: customerId,
        name: form.name,
        surname: form.surname,
        email: form.email,
        phone: form.phone,
        status: "in_progress",
      },
    ]).select("id").single();
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data && data.id) {
      router.push(`/answer/${data.id}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Start Your Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium mb-1">Surname</label>
          <Input
            id="surname"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
          <Input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" isDisabled={loading}>{loading ? "Starting..." : "Start Session"}</Button>
      </form>
    </div>
  );
} 