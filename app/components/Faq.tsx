'use client';

import React, { useState } from 'react';

const faqs = [
  {
    question: 'Can I customize the content and design?',
    answer: 'Yes, you can fully customize both the content and design to match your brand and needs.'
  },
  {
    question: 'How long does it take to generate a proposal?',
    answer: 'Proposals are generated instantly after you provide your details.'
  },
  {
    question: 'What formats do I get the proposal in?',
    answer: 'You can download proposals in PDF and share them via a link.'
  },
  {
    question: 'Is the AI content actually good?',
    answer: 'Our AI is trained on thousands of successful proposals to deliver high-quality, relevant content.'
  },
  {
    question: 'Can I reuse or update past proposals?',
    answer: 'Yes, you can duplicate, edit, and resend any previous proposal.'
  },
  {
    question: 'Do I need design or writing skills to use Scanen?',
    answer: 'No design or writing skills are needed—Scanen handles everything for you.'
  },
  {
    question: 'What industries is Scanen best for?',
    answer: 'Scanen is ideal for agencies, freelancers, consultants, and service businesses in any industry.'
  },
];

const faqIcon = '/icons/Close.svg';
const badgeIcon = '/icons/icon-StackSimple.svg';

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpen(open === idx ? null : idx);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-badge">
          <span className="faq-badge-icon">
            <img src={badgeIcon} alt="FAQ Icon" />
          </span>
          <span className="faq-badge-text">FAQ</span>
        </div>
        <h2 className="faq-title">Got Questions? We've Got Answers</h2>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div className="faq-item" key={idx}>
              <button className="faq-question-btn" onClick={() => handleToggle(idx)} aria-expanded={open === idx}>
                <span className="faq-question">{faq.question}</span>
                <span className={`faq-icon ${open === idx ? 'open' : ''}`}>
                  <img
                    src={faqIcon}
                    alt="Toggle FAQ"
                  />
                </span>
              </button>
              <div className={`faq-answer ${open === idx ? 'open' : ''}`}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 