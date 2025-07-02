"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoginForm } from "@/components/login-form";

export default function ProfilePage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    logo_url: "",
    email: "",
    phone: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError(null);
      // Fetch business for this user
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setBusiness(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          logo_url: data.logo_url || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        // Fetch questions for this business
        const { data: questionsData } = await supabase
          .from("analyzed_questions")
          .select("*")
          .eq("business_id", data.id);
        setQuestions(questionsData || []);
      } else {
        setBusiness(null);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.from("businesses").insert([
      {
        user_id: user.id,
        name: form.name,
        description: form.description,
        logo_url: form.logo_url,
        email: form.email,
        phone: form.phone,
      },
    ]);
    setCreating(false);
    if (error) setError(error.message);
    else {
      setSuccess("Business page created!");
      window.location.reload();
    }
  };

  if (!user) {
    // Not authenticated, show login/register form
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  if (!business) {
    // No business, show create form (no sidebar)
    return (
      <div className="flex w-full max-w-lg flex-col gap-6 mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Business Page</CardTitle>
            <CardDescription>
              You need to create a business page to access your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <form onSubmit={handleCreateBusiness} className="grid gap-6">
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
                <Button type="submit" isDisabled={creating}>{creating ? "Creating..." : "Create Business Page"}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show business profile and questions
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{business.name}</CardTitle>
          <CardDescription>{business.description}</CardDescription>
          <div className="text-xs text-gray-500 mt-1">
            <b>Business ID:</b> {business.id}
          </div>
        </CardHeader>
        <CardContent>
          {business.logo_url && (
            <img src={business.logo_url} alt="Business Logo" className="mb-4 max-h-32" />
          )}
          <div className="mb-2"><b>Email:</b> {business.email}</div>
          <div className="mb-2"><b>Phone:</b> {business.phone}</div>
          <div className="my-4">
            <Button
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                alert("Public page link copied to clipboard!\n" + window.location.href);
              }}
            >
              Copy Public Page Link
            </Button>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Questions</h2>
            {questions.length === 0 ? (
              <div>No questions found for this business.</div>
            ) : (
              <ul className="list-disc pl-6">
                {questions.map((q: any) => (
                  <li key={q.id} className="mb-2">{q.question}</li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 