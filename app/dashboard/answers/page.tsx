"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OfferTemplate } from "@/components/offer-template";
import { useDashboardTitle } from "@/components/dashboard-title-context";

export default function AnswersPage() {
  const { user } = useAuth();
  const { setTitle } = useDashboardTitle();
  const [answers, setAnswers] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [analyseLoading, setAnalyseLoading] = useState(false);
  const [analyseMsg, setAnalyseMsg] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Answers");
  }, [setTitle]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      // Get all business IDs for this user
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id);
      const businessIds = (businesses || []).map((b: any) => b.id);
      if (businessIds.length === 0) {
        setAnswers([]);
        setLoading(false);
        return;
      }
      // Fetch all customer_answers for these businesses
      const { data: answersData } = await supabase
        .from("customer_answers")
        .select("id, user_id, answers, answered_at, business_id")
        .in("business_id", businessIds)
        .order("answered_at", { ascending: false });
      setAnswers(answersData || []);
      // Fetch user emails for all user_ids
      const userIds = Array.from(new Set((answersData || []).map((a: any) => a.user_id)));
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, email")
          .in("id", userIds);
        const userMap: Record<string, any> = {};
        (usersData || []).forEach((u: any) => { userMap[u.id] = u; });
        setUsers(userMap);
      }
      setLoading(false);
    })();
  }, [user]);

  // Fetch business info when a card is selected
  useEffect(() => {
    if (!selected) return;
    // If business_id is available in selected, fetch business
    if (selected.business_id) {
      supabase
        .from("businesses")
        .select("*")
        .eq("id", selected.business_id)
        .single()
        .then(({ data }) => setBusiness(data));
    } else {
      setBusiness(null);
    }
  }, [selected]);

  const handleAnalyseOffer = async () => {
    if (!selected) return;
    setAnalyseLoading(true);
    setAnalyseMsg(null);
    try {
      // Fetch business questions from analyzed_results
      let questions: any[] = [];
      if (selected.business_id) {
        const { data: analyzedResults } = await supabase
          .from("analyzed_results")
          .select("questions")
          .eq("business_id", selected.business_id)
          .limit(1)
          .single();
        if (analyzedResults && analyzedResults.questions) {
          questions = analyzedResults.questions;
        }
      }
      await fetch("https://n8n.srv824584.hstgr.cloud/webhook/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selected.user_id,
          business_id: selected.business_id,
          answers: selected.answers,
          questions, // now from analyzed_results
        }),
      });
      setAnalyseMsg("Offer sent for analysis!");
    } catch (err) {
      setAnalyseMsg("Failed to send for analysis.");
    }
    setAnalyseLoading(false);
  };

  return (
    <div className="px-4 lg:px-6">
      {/* Page header as main heading removed, handled by dashboard shell */}
      {loading ? (
        <div>Loading...</div>
      ) : answers.length === 0 ? (
        <div>No answers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {answers.map((a: any) => (
            <Card key={a.id} className="cursor-pointer hover:shadow-lg" onClick={() => setSelected(a)}>
              <CardContent className="p-4">
                <div className="font-semibold">{users[a.user_id]?.email || a.user_id}</div>
                <div className="text-xs text-gray-500">{new Date(a.answered_at).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setShowPreview(false); }}>
        <DialogContent className="max-w-lg w-full sm:max-w-2xl md:max-w-3xl p-0" style={{ maxHeight: '90vh', overflow: 'auto' }}>
          {selected && !showPreview && (
            <div className="p-6">
              <div className="mb-4">
                <div className="text-lg font-semibold mb-2">Customer Info</div>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <div className="mb-2">
                    <span className="font-medium">Name:</span> {users[selected.user_id]?.email || selected.user_id}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {users[selected.user_id]?.email || "N/A"}
                  </div>
                </div>
              </div>
              <div className="mb-2 text-xs text-gray-500">Answered: {new Date(selected.answered_at).toLocaleString()}</div>
              <Button
                onClick={handleAnalyseOffer}
                className="w-full mb-3"
                isDisabled={analyseLoading}
              >
                {analyseLoading ? "Analysing..." : "Analyse Offer"}
              </Button>
              {analyseMsg && <div className="mb-2 text-sm text-green-600">{analyseMsg}</div>}
              <Button onClick={() => setShowPreview(true)} className="w-full">Preview Proposal PDF</Button>
            </div>
          )}
          {selected && showPreview && (
            <div
              className="p-4 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[75vh] overflow-y-auto"
              style={{ minWidth: 350 }}
            >
              <OfferTemplate
                companyName={business?.name || "Business Name"}
                companyEmail={business?.email || ""}
                companyPhone={business?.phone || ""}
                companyAddress={business?.address || ""}
                clientName={users[selected.user_id]?.email || selected.user_id}
                clientEmail={users[selected.user_id]?.email || ""}
                clientCompany={users[selected.user_id]?.company || ""}
                clientAddress={users[selected.user_id]?.address || ""}
                offerNumber={selected.id}
                date={new Date(selected.answered_at).toLocaleDateString()}
                items={[
                  {
                    id: "1",
                    name: "Proposal based on your answers",
                    description: Object.entries(selected.answers || {})
                      .map(([q, a]) => `${q}: ${a}`)
                      .join("; "),
                    quantity: 1,
                    unitPrice: 1200,
                    total: 1200,
                  },
                ]}
                subtotal={1200}
                tax={252}
                total={1452}
                projectSummary={"This proposal is generated based on your submitted answers."}
                methodology={["We use your answers to tailor the proposal."]}
                included={["Unlimited revisions", "3 months support"]}
                notes={"Payment terms: 50% upfront, 50% on delivery."}
              />
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full" onClick={() => alert('PDF export coming soon!')}>Export as PDF</button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 