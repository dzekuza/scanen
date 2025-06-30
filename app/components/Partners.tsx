import styles from './Partners.module.css';

export default function Partners() {
  const partners = [
    { name: "Microsoft", hasDot: false },
    { name: "Google", hasDot: true },
    { name: "Apple", hasDot: false },
    { name: "Amazon", hasDot: true },
    { name: "Meta", hasDot: false },
    { name: "Netflix", hasDot: false },
    { name: "Spotify", hasDot: true },
    { name: "Adobe", hasDot: false },
    { name: "Salesforce", hasDot: false },
    { name: "Shopify", hasDot: true },
    { name: "Stripe", hasDot: false },
    { name: "Figma", hasDot: false },
  ];

  return (
    <section className={styles['partners-section']}>
      <div className={styles['partners-marquee']}>
        <div className={styles['partners-track']}>
          {/* First set of partners */}
          {partners.map((partner, index) => (
            <div key={`first-${index}`} className={styles['partner-item']}>
              {partner.hasDot && <div className={styles['partner-dot']}></div>}
              <span className={styles['partner-name']}>{partner.name}</span>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {partners.map((partner, index) => (
            <div key={`second-${index}`} className={styles['partner-item']}>
              {partner.hasDot && <div className={styles['partner-dot']}></div>}
              <span className={styles['partner-name']}>{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
