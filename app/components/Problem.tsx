export default function Problem() {
  return (
    <section className="problem-section">
      <div className="problem-container">
        {/* Badge */}
        <div className="problem-badge">
          <div className="badge-content">
            <svg
              className="lightbulb-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.75 18.125C13.75 18.2908 13.6841 18.4498 13.5669 18.567C13.4497 18.6842 13.2907 18.75 13.125 18.75H6.87498C6.70922 18.75 6.55025 18.6842 6.43304 18.567C6.31583 18.4498 6.24998 18.2908 6.24998 18.125C6.24998 17.9593 6.31583 17.8003 6.43304 17.6831C6.55025 17.5659 6.70922 17.5 6.87498 17.5H13.125C13.2907 17.5 13.4497 17.5659 13.5669 17.6831C13.6841 17.8003 13.75 17.9593 13.75 18.125ZM16.875 8.12504C16.8777 9.16695 16.6423 10.1957 16.1868 11.1328C15.7314 12.0699 15.0678 12.8905 14.2469 13.5321C14.0934 13.6497 13.9688 13.8009 13.8827 13.9741C13.7965 14.1473 13.7512 14.3379 13.75 14.5313V15C13.75 15.3316 13.6183 15.6495 13.3839 15.8839C13.1494 16.1183 12.8315 16.25 12.5 16.25H7.49998C7.16846 16.25 6.85052 16.1183 6.6161 15.8839C6.38168 15.6495 6.24998 15.3316 6.24998 15V14.5313C6.24985 14.3402 6.20591 14.1517 6.12154 13.9802C6.03716 13.8088 5.91459 13.6589 5.76326 13.5422C4.94436 12.9045 4.28127 12.0887 3.82418 11.1568C3.3671 10.2249 3.128 9.20128 3.12498 8.16332C3.10467 4.43989 6.11404 1.3391 9.83436 1.25004C10.751 1.22795 11.6629 1.38946 12.5162 1.72506C13.3695 2.06065 14.1471 2.56356 14.8031 3.20418C15.4592 3.84479 15.9805 4.61017 16.3363 5.45527C16.6921 6.30036 16.8752 7.2081 16.875 8.12504ZM14.3664 7.39536C14.2043 6.49012 13.7688 5.65626 13.1185 5.00606C12.4681 4.35585 11.6342 3.92051 10.7289 3.75864C10.6479 3.74499 10.5651 3.74742 10.4851 3.76579C10.4051 3.78416 10.3295 3.81811 10.2626 3.8657C10.1957 3.91329 10.1388 3.97359 10.0953 4.04316C10.0517 4.11272 10.0222 4.19019 10.0086 4.27114C9.99493 4.35208 9.99736 4.43493 10.0157 4.51493C10.0341 4.59494 10.0681 4.67055 10.1156 4.73743C10.1632 4.80432 10.2235 4.86118 10.2931 4.90476C10.3627 4.94835 10.4401 4.9778 10.5211 4.99145C11.8156 5.20942 12.914 6.30785 13.1336 7.60473C13.1583 7.75029 13.2338 7.8824 13.3466 7.97764C13.4594 8.07288 13.6023 8.1251 13.75 8.12504C13.7853 8.12483 13.8206 8.12196 13.8554 8.11645C14.0188 8.08856 14.1644 7.99693 14.2602 7.8617C14.356 7.72647 14.3942 7.55873 14.3664 7.39536Z"
                fill="#402FD3"
              />
            </svg>
          </div>
          <div className="badge-text">Problem Solving</div>
        </div>

        {/* Main Content */}
        <div className="problem-main">
          {/* Video Container */}
          <div className="video-container">
            <div className="video-placeholder"></div>
            <button className="play-button">
              <svg
                className="play-button-circle"
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle opacity="0.15" cx="28" cy="28" r="28" fill="#09090B" />
              </svg>
              <svg
                className="play-icon"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25.375 14.0001C25.3757 14.2971 25.2995 14.5894 25.1539 14.8483C25.0082 15.1072 24.798 15.3241 24.5438 15.4777L8.785 25.118C8.51931 25.2807 8.21501 25.3695 7.90352 25.3753C7.59203 25.3811 7.28465 25.3036 7.01313 25.1508C6.74418 25.0005 6.52015 24.7812 6.36405 24.5155C6.20796 24.2498 6.12545 23.9474 6.125 23.6393V4.36084C6.12545 4.05271 6.20796 3.75027 6.36405 3.4846C6.52015 3.21894 6.74418 2.99965 7.01313 2.84928C7.28465 2.69653 7.59203 2.61904 7.90352 2.62481C8.21501 2.63058 8.51931 2.7194 8.785 2.88209L24.5438 12.5224C24.798 12.676 25.0082 12.8929 25.1539 13.1518C25.2995 13.4107 25.3757 13.703 25.375 14.0001Z"
                  fill="#FAFAFA"
                />
              </svg>
            </button>
          </div>

          {/* Text Content */}
          <div className="problem-text">
            <h2 className="problem-title">Stop Wasting Time on Proposals</h2>

            <div className="problem-description">
              <p className="problem-paragraph">
                Manually creating proposals drains your time and rarely feels
                worth the effort — especially when you're juggling clients,
                sales calls, and delivery.
              </p>
              <p className="problem-paragraph">
                With Scanen, you get professional, branded proposals that
                impress clients, speed up approvals, and help you close deals
                faster — without adding to your workload.
              </p>
            </div>

            {/* CTA Button */}
            <button className="problem-cta">
              <span className="cta-text">See How it Works</span>
              <div className="cta-arrow-container">
                <svg
                  className="cta-arrow-down"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3.75V20.25M12 20.25L5.25 13.5M12 20.25L18.75 13.5"
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
