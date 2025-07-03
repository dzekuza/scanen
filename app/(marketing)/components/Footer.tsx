import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.logoRow}>
            <img src="/icons/scannewwhite.svg" alt="Scanen Logo" className={styles.logo} />
          </div>
          <p className={styles.desc}>
            AI-powered proposal generator for freelancers, studios, and service businesses.
          </p>
        </div>
        <div className={styles.links}>
          <div className={styles.linkCol}>
            <a href="#about">About Us</a>
            <a href="#gallery">Gallery</a>
            <a href="#partners">Partners</a>
            <a href="#contact">Contact Us</a>
            <a href="#help">Help Center</a>
          </div>
          <div className={styles.linkCol}>
            <a href="#instagram">Instagram</a>
            <a href="#facebook">Facebook</a>
            <a href="#twitter">Twitter</a>
            <a href="#youtube">YouTube</a>
          </div>
        </div>
      </div>
      <div className={styles.bottomRow}>
        <span>© 2025 Scanen. All Rights Reserved</span>
        <div className={styles.policies}>
          <a href="#privacy">Privacy Policy</a>
          <span>•</span>
          <a href="#terms">Terms of Service</a>
          <span>•</span>
          <a href="#cookie">Cookie Policy</a>
          <span>•</span>
          <a href="#settings">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
} 