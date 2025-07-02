import React from "react";

export type ProposalDocumentProps = {
  business: {
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo_url?: string;
  };
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
    position?: string;
  };
  questions: { [key: string]: string }; // { questionId: questionText }
  answers: { [key: string]: string };   // { questionId: answerText }
};

export function ProposalDocument({ business, customer, questions, answers }: ProposalDocumentProps) {
  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif", maxWidth: 900, margin: "0 auto", background: "#fff", color: "#222", padding: 48, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      {/* Branded Header */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: "4px solid #1e293b", paddingBottom: 24, marginBottom: 32 }}>
        {business.logo_url ? (
          <img src={business.logo_url} alt="Business Logo" style={{ height: 80, marginRight: 32, borderRadius: 8 }} />
        ) : (
          <div style={{ width: 80, height: 80, background: "#e5e7eb", borderRadius: 8, marginRight: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 32, color: "#64748b" }}>
            LOGO
          </div>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>{business.name}</h1>
          {business.description && <div style={{ color: "#475569", fontSize: 18, marginTop: 4 }}>{business.description}</div>}
        </div>
      </div>

      {/* Business Info */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Business Information</h2>
        <div><b>Email:</b> {business.email}</div>
        <div><b>Phone:</b> {business.phone}</div>
        <div><b>Address:</b> {business.address}</div>
        <div><b>Website:</b> {business.website}</div>
      </section>

      {/* Customer Info */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Customer Information</h2>
        <div><b>Name:</b> {customer.name}</div>
        <div><b>Email:</b> {customer.email}</div>
        <div><b>Phone:</b> {customer.phone}</div>
        <div><b>Address:</b> {customer.address}</div>
        <div><b>Company:</b> {customer.company}</div>
        <div><b>Position:</b> {customer.position}</div>
      </section>

      {/* Q&A Section */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Proposal Q&A</h2>
        <ol style={{ paddingLeft: 24 }}>
          {Object.entries(questions).map(([qid, question], idx) => (
            <li key={qid} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#334155" }}>{question}</div>
              <div style={{ marginLeft: 12, color: "#222", fontSize: 16, marginTop: 4, background: "#f1f5f9", borderRadius: 6, padding: 10 }}>
                <b>Answer:</b> {answers[qid] || <span style={{ color: "#aaa" }}>No answer provided</span>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "2px solid #e5e7eb", paddingTop: 24, color: "#64748b", fontSize: 15, textAlign: "center" }}>
        <div>Thank you for considering <b>{business.name}</b> for your project.</div>
        <div style={{ marginTop: 8 }}>For questions, contact us at <a href={`mailto:${business.email}`} style={{ color: "#1e293b", textDecoration: "underline" }}>{business.email}</a> or call {business.phone}.</div>
        <div style={{ marginTop: 8, fontSize: 13 }}>© {new Date().getFullYear()} {business.name}. All rights reserved.</div>
      </footer>
    </div>
  );
} 