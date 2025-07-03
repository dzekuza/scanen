"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AnswerPage({ params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId;
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [question_id: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Fetch session and questions
  useEffect(() => {
    async function fetchSessionAndQuestions() {
      setLoading(true);
      // 1. Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from("customer_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (sessionError) return setLoading(false);
      setSession(sessionData);

      // 2. Fetch questions for business
      const { data: questionsData } = await supabase
        .from("analyzed_questions")
        .select("*")
        .eq("business_id", sessionData.business_id);
      setQuestions(questionsData || []);

      // 3. Fetch existing answers
      const { data: answersData } = await supabase
        .from("customer_answers")
        .select("*")
        .eq("session_id", sessionId);
      const answerMap: { [question_id: string]: string } = {};
      (answersData || []).forEach((a: any) => {
        answerMap[a.question_id] = a.answer;
      });
      setAnswers(answerMap);

      setLoading(false);
    }
    fetchSessionAndQuestions();
  }, [sessionId]);

  // Save progress (auto-save or on button)
  const saveAnswers = async () => {
    setSaving(true);
    setSaveMsg(null);
    await fetch("/api/customer-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        answers: questions.map(q => ({
          question_id: q.id,
          answer: answers[q.id] || "",
        })),
      }),
    });
    setSaving(false);
    setSaveMsg("Progress saved!");
    setTimeout(() => setSaveMsg(null), 2000);
  };

  // Submit (final)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await saveAnswers();
    // Mark session as completed
    await supabase
      .from("customer_sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);
    setSubmitted(true);
    // TODO: Trigger confirmation email (via n8n, Supabase function, or API)
  };

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Session not found.</div>;
  if (submitted) return <div>Thank you! Your answers have been submitted.</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Answer Questions</h1>
      <div className="mb-6">
        <div>
          <b>Name:</b> {session.name} {session.surname}
        </div>
        <div>
          <b>Email:</b> {session.email}
        </div>
        <div>
          <b>Phone:</b> {session.phone}
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