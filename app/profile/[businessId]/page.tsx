"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage({ params }: { params: { businessId: string } }) {
  const businessId = params.businessId;
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [analyzedResults, setAnalyzedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [question_id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    (async () => {
      setLoading(true);
      setError(null);
      // Fetch business by businessId
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();
      if (data) {
        setBusiness(data);
        // Fetch all analyzed results for this business
        const { data: resultsData } = await supabase
          .from("analyzed_results")
          .select("id, questions, created_at")
          .eq("business_id", data.id)
          .order("created_at", { ascending: false });
        setAnalyzedResults(resultsData || []);
      } else {
        setBusiness(null);
      }
      setLoading(false);
    })();
  }, [businessId]);

  // Get latest analyzed questions
  const latestQuestions = analyzedResults.length > 0
    ? Object.entries(analyzedResults[0].questions || {})
    : [];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(a => ({ ...a, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);
    // Save answers as a single row in customer_answers
    const { error } = await supabase.from("customer_answers").insert([
      {
        business_id: businessId,
        user_id: user.id,
        answers: answers,
      }
    ]);
    setSaving(false);
    if (!error) {
      // Send to n8n webhook
      try {
        await fetch("https://n8n.srv824584.hstgr.cloud/webhook/summarise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            business_id: businessId,
            answers,
            questions: Object.fromEntries(latestQuestions),
          }),
        });
      } catch (err) {
        // Ignore webhook errors for user experience
      }
      setSubmitted(true);
    } else {
      setSaveMsg(error.message || "Failed to submit answers.");
    }
  };

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-500">Business not found.</div>
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
            {/* Only show the public answer form below */}
            {latestQuestions.length > 0 && !submitted && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold mb-2">Submit Your Answers</h2>
                {!user ? (
                  <div className="mb-4 text-red-600">Please log in to answer questions.</div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {latestQuestions.map(([qId, qVal]: [string, any], i) => (
                      <div key={qId}>
                        <Label htmlFor={`q_${qId}`}>{qVal}</Label>
                        <Input
                          id={`q_${qId}`}
                          value={answers[qId] || ""}
                          onChange={e => handleAnswerChange(qId, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                    {saveMsg && <div className="text-red-600 text-sm">{saveMsg}</div>}
                    <Button type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit Answers"}</Button>
                  </form>
                )}
              </div>
            )}
            {submitted && (
              <div className="mt-10 text-green-600 text-lg font-semibold">Thank you! Your answers have been submitted.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 