"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function StartSessionClient() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("user_id") || "";
  const token = searchParams?.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [question_id: string]: string }>({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomerAndQuestions() {
      setLoading(true);
      setError(null);
      // 1. Fetch customer by id and fingerprint
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", userId)
        .eq("fingerprint", token)
        .single();
      if (customerError || !customer) {
        setError("Invalid or expired link. Please contact the business.");
        setLoading(false);
        return;
      }
      setCustomer(customer);
      // 2. Fetch questions for the business
      const { data: questionsData } = await supabase
        .from("analyzed_questions")
        .select("*")
        .eq("business_id", customer.business_id);
      setQuestions(questionsData || []);
      setLoading(false);
    }
    fetchCustomerAndQuestions();
  }, [userId, token]);

  // Save answers
  const saveAnswers = async () => {
    setSaving(true);
    setSaveMsg(null);
    const answerRows = questions.map(q => ({
      user_id: customer.id,
      question_id: q.id,
      answer: answers[q.id] || "",
    }));
    await supabase.from("customer_answers").upsert(answerRows, { onConflict: 'user_id,question_id' });
    setSaving(false);
    setSaveMsg("Progress saved!");
    setTimeout(() => setSaveMsg(null), 2000);
  };

  // Submit (final)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await saveAnswers();
    setSubmitted(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-6">{error}</div>;
  if (submitted) return <div className="text-green-600 text-center p-6">Thank you! Your answers have been submitted.</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Answer Questions</h1>
      <div className="mb-6">
        <div>
          <b>Name:</b> {customer.name} {customer.surname}
        </div>
        <div>
          <b>Email:</b> {customer.email}
        </div>
        <div>
          <b>Phone:</b> {customer.phone}
        </div>
      </div>
      {questions.length === 0 ? (
        <div>No questions found.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              Question {step + 1} of {questions.length}
            </label>
            <div className="mb-2 font-semibold">{questions[step].question}</div>
            <Input
              value={answers[questions[step].id] || ""}
              onChange={e => setAnswers(a => ({ ...a, [questions[step].id]: e.target.value }))}
              className="w-full"
              required
            />
          </div>
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              onClick={saveAnswers}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Progress"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < questions.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep(s => Math.min(questions.length - 1, s + 1))}
                disabled={!answers[questions[step].id]}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={!answers[questions[step].id] || saving}>
                Submit All
              </Button>
            )}
            {saveMsg && <span className="text-green-600 text-sm ml-2">{saveMsg}</span>}
          </div>
        </form>
      )}
    </div>
  );
} 