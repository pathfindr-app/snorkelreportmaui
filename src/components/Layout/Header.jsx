import { formatLastUpdated, formatShortDate } from '../../utils/formatDate';
import brandLogo from '../../../assets/Logo.png';

function Header({
  lastUpdated,
  onPrivateExperienceClick,
  showBackButton,
  onBackClick,
}) {
  return (
    <header className="relative z-50">
      <div className="private-header-frame relative overflow-visible">
        <div className="relative max-w-7xl mx-auto px-4 py-0.5">
          <div className="private-header-card">
            <div className="private-header-layout">
              <section className="private-panel private-panel-left">
                <div className="flex items-start gap-3">
                  {showBackButton && (
                    <button
                      onClick={onBackClick}
                      className="group private-back-btn flex items-center gap-1.5 transition-all duration-300 mt-0.5"
                    >
                      <div className="private-back-btn-ring w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </button>
                  )}

                  <div>
                    <p className="private-panel-eyebrow">Snorkel Report Maui</p>
                    <h2 className="private-panel-title">Daily snorkel conditions updated throughout the day.</h2>
                    <p className="private-panel-copy">
                      Built to help you choose better spots before you head out.
                    </p>
                  </div>
                </div>

                {lastUpdated && (
                  <>
                    <p className="private-updated hidden sm:flex items-center gap-1.5 mt-2">
                      <span className="w-1 h-1 rounded-full bg-[#9dcac3]" />
                      Updated: {formatLastUpdated(lastUpdated)}
                    </p>
                    <p className="private-updated sm:hidden flex items-center gap-1.5 mt-2">
                      <span className="w-1 h-1 rounded-full bg-[#9dcac3]" />
                      {formatShortDate(lastUpdated)}
                    </p>
                  </>
                )}
              </section>

              <div className="private-logo-center">
                <img
                  src={brandLogo}
                  alt="Snorkel Report Maui"
                  className="private-brand-logo"
                />
              </div>

              <section className="private-panel private-panel-right">
                <p className="private-panel-eyebrow">Private Tours with Kyle</p>
                <h2 className="private-panel-title">Private snorkel and scuba photo sessions.</h2>
                <p className="private-panel-copy">
                  PADI Divemaster, 11 years guiding Maui, one group per session, all photos by Kyle.
                </p>

                <div className="private-cta-wrap">
                  <button
                    onClick={onPrivateExperienceClick}
                    className="private-header-book-btn"
                  >
                    Book a Private Session
                  </button>
                  <p className="private-header-price">South from $135 · West from $160</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ceb79c]/35 to-transparent" />
    </header>
  );
}

export default Header;
