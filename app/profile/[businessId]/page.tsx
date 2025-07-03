"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MultiStepForm } from '../../../components/ui/multistep-form';
import { PromptBox } from '../../../components/ui/chatgpt-prompt-input';

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
  const [formOpen, setFormOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const businessName = business?.name || '';

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

  async function handleSendMessage(message: string) {
    setChatMessages((msgs) => [...msgs, { role: 'user', content: message }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, question: message, businessName }),
      });
      const data = await res.json();
      setChatMessages((msgs) => [...msgs, { role: 'ai', content: data.answer || data.error || 'No answer.' }]);
    } catch (e) {
      setChatMessages((msgs) => [...msgs, { role: 'ai', content: 'Error contacting AI.' }]);
    }
    setChatLoading(false);
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-500">Business not found.</div>
      </div>
    );
  }

  // Show business profile and questions
  return (
    <div className="w-full min-h-screen bg-background">
      {/* Banner section: full width, edge-to-edge */}
      <div className="w-full px-0 mb-8">
        <div className="relative w-full" style={{ minHeight: 220, height: 220 }}>
          <div className="absolute inset-0 rounded-none overflow-hidden border-b border-muted-foreground/20" style={{ width: '100%', height: '100%' }}>
            <img
              src={business.cover_image_url || "/icons/scanenlogonew.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow mb-2">{business.name}</h1>
              <p className="text-lg md:text-xl text-white drop-shadow mb-4 max-w-2xl">{business.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 my-8">
        <Button onClick={() => setChatOpen(true)}>Chat with AI</Button>
        <Button onClick={() => setFormOpen(true)} variant="outline">Answer in Form</Button>
      </div>
      {/* Chat Modal */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent>
          <div className="flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto max-h-96 bg-muted rounded p-4">
              {chatMessages.length === 0 && <div className="text-muted-foreground text-center">Start the conversation with AI...</div>}
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right mb-2' : 'text-left mb-2'}>
                  <span className={msg.role === 'user' ? 'inline-block bg-primary text-white rounded px-3 py-2' : 'inline-block bg-background border rounded px-3 py-2'}>
                    {msg.content}
                  </span>
                </div>
              ))}
              {chatLoading && <div className="text-center text-muted-foreground">AI is thinking...</div>}
            </div>
            <PromptBox
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const value = chatInput.trim();
                  if (value) {
                    await handleSendMessage(value);
                    setChatInput('');
                  }
                }
              }}
              placeholder="Type your question and press Enter..."
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Form Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <MultiStepForm onSubmit={(data) => { setFormOpen(false); /* handle form data */ }} />
        </DialogContent>
      </Dialog>
      {/* Questions section */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          {latestQuestions.length > 0 && !submitted && (
            <div>
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
      </div>
    </div>
  );
} 