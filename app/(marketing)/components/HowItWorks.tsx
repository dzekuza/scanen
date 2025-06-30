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
        <div className={styles['howitworks-step-card']}>
          <div
            className={styles['howitworks-step-image']}
            style={{ background: steps[step].imageColor, width: '100%' }}
          />
          <div className={styles['howitworks-step-header']}>
            <span className={styles['howitworks-step-label']}>{steps[step].label}</span>
            <div className={styles['howitworks-step-carousel']}>
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className={
                    `${styles['howitworks-step-dot']} ${idx === step ? styles['howitworks-step-dot--active'] : ''}`
                  }
                />
              ))}
            </div>
          </div>
          <div className={styles['howitworks-step-content']}>
            <h3 className={styles['howitworks-step-title']}>{steps[step].title}</h3>
            <p className={styles['howitworks-step-desc']}>{steps[step].desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
} 