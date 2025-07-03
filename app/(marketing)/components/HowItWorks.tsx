'use client';

import React, { useState, useEffect } from 'react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    imageColor: '#e4e4e7',
    label: 'STEP 1',
    title: 'Tell us what you offer',
    desc: 'Input your service details — what you do, for whom, and what makes it valuable. Just a few short answers',
  },
  {
    imageColor: '#d1e7dd',
    label: 'STEP 2',
    title: 'Describe your audience',
    desc: 'Share who your ideal clients are so we can tailor your proposal for maximum impact.',
  },
  {
    imageColor: '#ffe5b4',
    label: 'STEP 3',
    title: 'Review and send',
    desc: 'Check your proposal, make edits, and send it with confidence in just one click.',
  },
  {
    imageColor: '#f8d7da',
    label: 'STEP 4',
    title: 'Track responses',
    desc: 'Get notified when your proposal is viewed and track responses in real time.',
  },
];

export default function HowItWorks() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles['howitworks-section']}>
      <div className={styles['howitworks-container']}>
        <div className={styles['howitworks-badge']}>
          <span className={styles['howitworks-badge-icon']}>
            <img src="/icons/icon-steps.svg" alt="How It Works Icon" />
          </span>
          <span className={styles['howitworks-badge-text']}>How It Works</span>
        </div>
        <h2 className={styles['howitworks-title']}>Your Proposal, the Smart Way</h2>
        <div className={styles['howitworks-main']}>
          <div className={styles['howitworks-image-placeholder']} />
          <div className={styles['howitworks-steps']}>
            <div className={styles['howitworks-step']}>
              <span className={styles['howitworks-step-label']}>STEP 1</span>
              <h3 className={styles['howitworks-step-title']}>Share or upload your content</h3>
              <p className={styles['howitworks-step-desc']}>
                Answer a few quick prompts about your service — or upload an existing proposal to speed things up. We'll extract what matters.
              </p>
            </div>
            <div className={styles['howitworks-step']}>
              <span className={styles['howitworks-step-label']}>STEP 2</span>
              <h3 className={styles['howitworks-step-title']}>Let AI generate your proposal</h3>
              <p className={styles['howitworks-step-desc']}>
                Scanen turns your input into a clean, branded, and professional proposal — complete with structure, copy, and modern design.
              </p>
            </div>
            <div className={styles['howitworks-step']}>
              <span className={styles['howitworks-step-label']}>STEP 3</span>
              <h3 className={styles['howitworks-step-title']}>Review, send, done</h3>
              <p className={styles['howitworks-step-desc']}>
                Download as PDF, share via link, or email it directly. Make edits if needed — most users are ready to send in under 3 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 