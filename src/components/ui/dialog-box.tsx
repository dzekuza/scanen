import React, { useState, ChangeEvent } from 'react';
import { cn } from "@/lib/utils";

export const SendProposalDialog = () => {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setClientName(e.target.value);
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setClientEmail(e.target.value);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSend = () => {
    // TODO: Implement send logic (e.g., API call)
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>Send Proposal</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-neutral-900 animate-fadeIn">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-2xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-1 tracking-tight">Send Proposal</h2>
            <p className="text-neutral-500 mb-7 text-sm">Enter your client's name and email. They'll receive a link to answer questions.</p>
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} autoComplete="off">
              <div className="mb-5">
                <label htmlFor="clientName" className="block text-sm font-semibold mb-2">Client Name</label>
                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300 focus:outline-none transition"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="mb-8">
                <label htmlFor="clientEmail" className="block text-sm font-semibold mb-2">Client Email</label>
                <input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300 focus:outline-none transition"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}; 