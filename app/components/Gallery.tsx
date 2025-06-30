'use client';

import React, { useState } from 'react';

const images = [
  '/icons/Rectangle 2.png',
  'http://localhost:3845/assets/8fbf2d82fbef37e89054740cc3374815c97080b7.svg',
  'http://localhost:3845/assets/6c04551600080e28e8100da74bb6e0cd93f98953.svg',
  // Add more images as needed
];

export default function Gallery() {
  const [active, setActive] = useState(0);

  return (
    <section className="gallery-section">
      <div className="gallery-container">
        <div className="gallery-badge">
          <span className="gallery-badge-icon">
            <img src="/icons/icon-StackSimple.svg" alt="Gallery Icon" />
          </span>
          <span className="gallery-badge-text">Gallery</span>
        </div>
        <div className="gallery-header">
          <h2 className="gallery-title">See What You Can Send</h2>
          <p className="gallery-desc">Explore real AI-generated proposals — polished, branded, and ready to impress.</p>
        </div>
        <div className="gallery-main">
          <div className="gallery-image-wrapper">
            <img className="gallery-image" src={images[active]} alt="Gallery Example" />
          </div>
          <div className="gallery-carousel">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={
                  'gallery-dot' + (idx === active ? ' gallery-dot--active' : '')
                }
                onClick={() => setActive(idx)}
              />
            ))}
          </div>
        </div>
        <button className="gallery-seeall-btn">
          See All
          <img
            className="gallery-seeall-arrow"
            src="/icons/icon-ArrowRight.svg"
            alt="Arrow Right"
          />
        </button>
      </div>
    </section>
  );
} 