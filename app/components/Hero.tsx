import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles['hero-section']}>
      {/* Background gradient blur */}
      <div className={styles['hero-background']}>
        <div className={styles['gradient-blur']}></div>
      </div>

      <div className={styles['hero-container']}>
        <div className={styles['hero-content']}>
          {/* Header Content */}
          <div className={styles['hero-header']}>
            {/* Rating Badge */}
            <div className={styles['rating-badge']}>
              <div className={styles['stars-container']}>
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={styles['star-icon']}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.99992 14.771L6.34316 16.9792C6.2357 17.0322 6.13597 17.0537 6.04397 17.0436C5.95263 17.0329 5.86365 17.0013 5.77702 16.9489C5.68971 16.8952 5.62389 16.8193 5.57957 16.7213C5.53525 16.6232 5.53122 16.5161 5.56748 16.3999L6.5406 12.2596L3.32205 9.46921C3.23139 9.39534 3.17162 9.30703 3.14274 9.20428C3.11386 9.10152 3.12024 9.00314 3.16188 8.90912C3.20352 8.81509 3.25892 8.73786 3.3281 8.67742C3.39794 8.61899 3.49196 8.57937 3.61016 8.55855L7.85724 8.18784L9.51335 4.26715C9.55902 4.15634 9.62484 4.07642 9.7108 4.0274C9.79676 3.97837 9.89313 3.95386 9.99992 3.95386C10.1067 3.95386 10.2034 3.97837 10.29 4.0274C10.3767 4.07642 10.4422 4.15634 10.4865 4.26715L12.1426 8.18784L16.3887 8.55855C16.5075 8.5787 16.6019 8.61866 16.6717 8.67843C16.7416 8.73753 16.7973 8.81442 16.839 8.90912C16.8799 9.00314 16.886 9.10152 16.8571 9.20428C16.8282 9.30703 16.7684 9.39534 16.6778 9.46921L13.4592 12.2596L14.4323 16.3999C14.47 16.5148 14.4663 16.6215 14.4213 16.7203C14.3763 16.819 14.3101 16.8949 14.2228 16.9479C14.1369 17.0017 14.0479 17.0336 13.9559 17.0436C13.8645 17.0537 13.7651 17.0322 13.6577 16.9792L9.99992 14.771Z"
                      fill="#FFCC00"
                    />
                  </svg>
                ))}
              </div>
              <div className={styles['rating-text']}>
                <span className={styles['rating-number']}>2.1M+</span> users worldwide
              </div>
            </div>

            {/* Main Headline */}
            <h1 className={styles['hero-title']}>
              Precision <span className={styles['title-highlight']}>proposals</span>,
              powered by <span className={styles['title-highlight']}>AI</span>
            </h1>

            {/* Description */}
            <p className={styles['hero-description']}>
              Create polished, client-ready proposals in under 3 minutes — no
              formatting, no writing, no second-guessing. Just answer a few
              simple prompts, and let AI handle the heavy lifting.
            </p>
          </div>

          {/* CTA Button */}
          <div className={styles['cta-container']}>
            <button className={styles['cta-button']}>
              <span className={styles['cta-text']}>Generate Proposal</span>
              <div className={styles['cta-icon-container']}>
                <svg
                  className={styles['cta-arrow']}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.75 12H20.25M20.25 12L13.5 5.25M20.25 12L13.5 18.75"
                    stroke="#FAFAFA"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
