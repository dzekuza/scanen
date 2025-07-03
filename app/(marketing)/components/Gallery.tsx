'use client';

import React, { useState } from 'react';
import styles from './Gallery.module.css';

const images = [
  '/icons/docs ex/Frame 80.png',
  '/icons/docs ex/Frame 81.png',
  '/icons/docs ex/Frame 82.png',
  '/icons/docs ex/Frame 83.png',
  '/icons/docs ex/Frame 84.png',
  '/icons/docs ex/Frame 85.png',
  '/icons/docs ex/Frame 86.png',
];

const VISIBLE_COUNT = 4; // Show 4 at a time (adjust for responsive if needed)

export default function Gallery() {
  const [start, setStart] = useState(0);

  const canGoLeft = start > 0;
  const canGoRight = start + VISIBLE_COUNT < images.length;

  const handleLeft = () => {
    if (canGoLeft) setStart(start - 1);
  };
  const handleRight = () => {
    if (canGoRight) setStart(start + 1);
  };

  return (
    <section className={styles['gallery-section']}>
      <div className={styles['gallery-container']}>
        <div className={styles['gallery-badge']}>
          <span className={styles['gallery-badge-icon']}>
            <img src="/icons/icon-StackSimple.svg" alt="Gallery Icon" />
          </span>
          <span className={styles['gallery-badge-text']}>Gallery</span>
        </div>
        <div className={styles['gallery-header']}>
          <h2 className={styles['gallery-title']}>See What You Can Send</h2>
          <p className={styles['gallery-desc']}>Explore real AI-generated proposals — polished, branded, and ready to impress.</p>
        </div>
        <div className={styles['gallery-main']}>
          <button className={styles['gallery-arrow']} onClick={handleLeft} disabled={!canGoLeft} aria-label="Previous">
            &#60;
          </button>
          <div className={styles['gallery-slider']}>
            {images.slice(start, start + VISIBLE_COUNT).map((src, idx) => (
              <div className={styles['gallery-image-wrapper']} key={src}>
                <img className={styles['gallery-image']} src={src} alt={`Gallery Example ${start + idx + 1}`} />
              </div>
            ))}
          </div>
          <button className={styles['gallery-arrow']} onClick={handleRight} disabled={!canGoRight} aria-label="Next">
            &#62;
          </button>
        </div>
        <div className={styles['gallery-carousel']}>
          {images.map((_, idx) => (
            <span
              key={idx}
              className={
                `${styles['gallery-dot']} ${idx >= start && idx < start + VISIBLE_COUNT ? styles['gallery-dot--active'] : ''}`
              }
            />
          ))}
        </div>
        <button className={styles['gallery-seeall-btn']}>
          See All
          <img
            className={styles['gallery-seeall-arrow']}
            src="/icons/icon-ArrowRight.svg"
            alt="Arrow Right"
          />
        </button>
      </div>
    </section>
  );
} 