import { useState } from 'react';
import { formatLastUpdated, formatShortDate } from '../../utils/formatDate';

const BRAND_LOGO_SRC = '/brand/snorkelreport-logo.svg';

function Header({
  lastUpdated,
  onPrivateExperienceClick,
  showBackButton,
  onBackClick,
}) {
  const [logoUnavailable, setLogoUnavailable] = useState(false);

  return (
    <header className="relative z-50">
      <div className="private-header-frame relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-2">
          <div className="private-header-card">
            <div className="private-header-grid">
              <div className="min-w-0 private-header-copy">
                <div className="flex items-center gap-3">
                  {showBackButton && (
                    <button
                      onClick={onBackClick}
                      className="group private-back-btn flex items-center gap-1.5 transition-all duration-300"
                    >
                      <div className="private-back-btn-ring w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </button>
                  )}

                  {!logoUnavailable ? (
                    <img
                      src={BRAND_LOGO_SRC}
                      alt="Snorkel Report Maui"
                      className="private-brand-logo"
                      onError={() => setLogoUnavailable(true)}
                    />
                  ) : (
                    <h1 className="private-brand-wordmark">
                      <span className="private-brand-wordmark-main">Snorkel Report</span>{' '}
                      <span className="private-brand-wordmark-accent">Maui</span>
                    </h1>
                  )}
                </div>

                {lastUpdated && (
                  <>
                    <p className="private-updated hidden sm:flex items-center gap-1.5 mt-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#9dcac3]" />
                      Updated: {formatLastUpdated(lastUpdated)}
                    </p>
                    <p className="private-updated sm:hidden flex items-center gap-1.5 mt-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#9dcac3]" />
                      {formatShortDate(lastUpdated)}
                    </p>
                  </>
                )}

                <p className="private-header-title mt-1.5">
                  Private snorkel and scuba photo sessions with Kyle.
                </p>
                <div className="private-header-details mt-1">
                  <span>PADI Divemaster</span>
                  <span>11 years guiding</span>
                  <span>One group per session</span>
                  <span>All photos by Kyle</span>
                </div>
              </div>

              <div className="private-header-cta-box">
                <button
                  onClick={onPrivateExperienceClick}
                  className="private-header-book-btn"
                >
                  Book a Private Session
                </button>
                <p className="private-header-price mt-1.5">South from $135 · West from $160</p>
              </div>
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
