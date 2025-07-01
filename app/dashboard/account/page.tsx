'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AccountPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    logo_url: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, description, logo_url, email, phone")
        .eq("user_id", user.id);
      if (error) setError(error.message);
      else {
        setBusinesses(data || []);
        if (data && data.length > 0) {
          setSelectedBusinessId(data[0].id);
          setForm({ ...data[0] });
        }
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedBusinessId) return;
    const business = businesses.find(b => b.id === selectedBusinessId);
    if (business) setForm({ ...business });
  }, [selectedBusinessId, businesses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    const { error } = await supabase
      .from("businesses")
      .update({
        name: form.name,
        description: form.description,
        logo_url: form.logo_url,
        email: form.email,
        phone: form.phone,
      })
      .eq("id", selectedBusinessId);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess("Business info updated!");
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 mx-auto p-6">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your business info here. Click save when you&apos;re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {businesses.length > 1 && (
                <div className="grid gap-3">
                  <Label htmlFor="business-select">Select Business</Label>
                  <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                    <SelectTrigger className="w-full" id="business-select">
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <form onSubmit={handleSave} className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="business-description">Description</Label>
                  <textarea id="business-description" name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="business-logo">Logo URL</Label>
                  <Input id="business-logo" name="logo_url" value={form.logo_url} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="business-email">Email</Label>
                  <Input id="business-email" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input id="business-phone" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <CardFooter className="p-0">
                  <Button type="submit" isDisabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-current">Current password</Label>
                <Input id="tabs-demo-current" type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-new">New password</Label>
                <Input id="tabs-demo-new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 