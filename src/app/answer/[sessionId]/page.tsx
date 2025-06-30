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
      <form onSubmit={handleSubmit}>
        {questions.map(q => (
          <div key={q.id} className="mb-4">
            <label className="block font-medium mb-1">{q.question}</label>
            <Input
              value={answers[q.id] || ""}
              onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              className="w-full"
              required
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="button" onClick={saveAnswers} variant="outline">
            Save Progress
          </Button>
          <Button type="submit">Submit All</Button>
        </div>
      </form>
    </div>
  );
} 