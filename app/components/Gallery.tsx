'use client';

import React, { useState } from 'react';
import styles from './Gallery.module.css';

const images = [
  '/icons/Rectangle 2.png',
  'http://localhost:3845/assets/8fbf2d82fbef37e89054740cc3374815c97080b7.svg',
  'http://localhost:3845/assets/6c04551600080e28e8100da74bb6e0cd93f98953.svg',
  // Add more images as needed
];

export default function Gallery() {
  const [active, setActive] = useState(0);

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
          <div className={styles['gallery-image-wrapper']}>
            <img className={styles['gallery-image']} src={images[active]} alt="Gallery Example" />
          </div>
          <div className={styles['gallery-carousel']}>
            {images.map((_, idx) => (
              <span
                key={idx}
                className={
                  `${styles['gallery-dot']} ${idx === active ? styles['gallery-dot--active'] : ''}`
                }
                onClick={() => setActive(idx)}
              />
            ))}
          </div>
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