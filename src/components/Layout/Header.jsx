import { formatLastUpdated, formatShortDate } from '../../utils/formatDate';

function Header({
  lastUpdated,
  onPrivateExperienceClick,
  showBackButton,
  onBackClick,
}) {
  return (
    <header className="relative z-50">
      <div className="private-header-frame relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-2.5">
          <div className="private-header-card">
            <div className="private-header-grid">
              <div className="min-w-0 private-header-copy">
                <div className="flex items-center gap-3">
                  {showBackButton && (
                    <button
                      onClick={onBackClick}
                      className="group flex items-center gap-1.5 text-glow-cyan/70 hover:text-glow-cyan transition-all duration-300"
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center border border-glow-cyan/20 group-hover:border-glow-cyan/40 group-hover:bg-glow-cyan/5 transition-all duration-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </button>
                  )}

                  <h1 className="text-xl sm:text-2xl text-ocean-50 tracking-tight leading-none font-semibold">
                    <span className="text-glow-cyan">Snorkel</span>{' '}
                    <span className="text-ocean-100">Report</span>{' '}
                    <span className="text-coral-warm">Maui</span>
                  </h1>
                </div>

                {lastUpdated && (
                  <>
                    <p className="text-[11px] text-ocean-500 hidden sm:flex items-center gap-1.5 mt-1.5">
                      <span className="w-1 h-1 rounded-full bg-glow-cyan/60" />
                      Updated: {formatLastUpdated(lastUpdated)}
                    </p>
                    <p className="text-[11px] text-ocean-500 sm:hidden flex items-center gap-1.5 mt-1.5">
                      <span className="w-1 h-1 rounded-full bg-glow-cyan/60" />
                      {formatShortDate(lastUpdated)}
                    </p>
                  </>
                )}

                <p className="private-header-title mt-1.5">
                  Private Maui snorkel and scuba sessions with Kyle.
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
                <p className="private-header-price mt-1.5">From $135 South · $160 West</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow-cyan/30 to-transparent" />
    </header>
  );
}

export default Header;
