import styles from './Hero.module.css';

const STAR_SVG = "http://localhost:3845/assets/41024ed099eef2058cc34238feaa6ce4dff87551.svg";
const ARROW_SVG = "http://localhost:3845/assets/b9aef493b821b4051b1bc1667623d4232480fdc1.svg";
const BG_SVG = "http://localhost:3845/assets/52167ed8b0f67df513dc1255886170d4f9032680.svg";

function Badge() {
  return (
    <div className={styles['badge']}>
      <div className={styles['badge-border']} />
      <div className={styles['badge-content']}>
        <div className={styles['badge-stars']}>
          {[...Array(5)].map((_, i) => (
            <img key={i} src={STAR_SVG} alt="star" className={styles['star-icon']} />
          ))}
        </div>
        <div className={styles['badge-text']}>
          <span className={styles['badge-number']}>2.1M+</span> users worldwide
        </div>
      </div>
    </div>
  );
}

function ButtonMain() {
  return (
    <button className={styles['cta-button']}>
      <span className={styles['cta-text']}>Generate Proposal</span>
      <span className={styles['cta-icon-container']}>
        <img src={ARROW_SVG} alt="Arrow Right" className={styles['cta-arrow']} />
      </span>
    </button>
  );
}

export default function Hero() {
  return (
    <section className={styles['hero-section']}>
      {/* Decorative Background SVG */}
      <div className={styles['hero-background']}>
        <img src={BG_SVG} alt="Background" className={styles['background-svg']} />
      </div>
      <div className={styles['hero-container']}>
        <div className={styles['hero-content']}>
          <Badge />
          <h1 className={styles['hero-title']}>
            Precision <span className={styles['title-highlight']}>proposals</span>, powered by <span className={styles['title-highlight']}>AI</span>
          </h1>
          <p className={styles['hero-description']}>
            Create polished, client-ready proposals in under 3 minutes — no formatting, no writing, no second-guessing
          </p>
          <ButtonMain />
        </div>
      </div>
    </section>
  );
}
