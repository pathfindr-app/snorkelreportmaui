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
        <div className="private-header-aurora" />
        <div className="private-header-aurora private-header-aurora-delay" />

        <div className="relative max-w-7xl mx-auto px-4 py-3">
          <div className="private-header-card">
            <div className="private-header-grid">
              <div className="min-w-0">
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

                  <h1 className="font-display text-xl sm:text-2xl text-ocean-50 tracking-wide leading-none">
                    <span className="text-glow-cyan">Snorkel</span>{' '}
                    <span className="text-ocean-100">Report</span>{' '}
                    <span className="text-coral-warm">Maui</span>
                  </h1>

                  <span className="private-header-pill hidden sm:inline-flex">Private Experience</span>
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

                <h2 className="text-sm sm:text-lg text-ocean-50 mt-2 font-semibold leading-tight">
                  Private Snorkel and Scuba with Kyle
                </h2>
                <p className="text-xs sm:text-sm text-ocean-200/95 leading-snug mt-1 max-w-4xl">
                  11-year Maui guide, PADI Divemaster, professional underwater photographer, and
                  the person who built this site.
                </p>

                <div className="flex flex-wrap gap-2 mt-2.5">
                  <span className="private-proof-chip">One Group Only</span>
                  <span className="private-proof-chip">All Photos Shot by Kyle</span>
                  <span className="private-proof-chip">Beginners to Advanced</span>
                </div>
              </div>

              <div className="private-header-cta-box">
                <p className="text-[11px] uppercase tracking-[0.16em] text-glow-cyan/70">Private Pricing</p>
                <p className="text-sm text-ocean-100 mt-1.5">South from $135 · West from $160</p>
                <button
                  onClick={onPrivateExperienceClick}
                  className="private-header-book-btn mt-3"
                >
                  Book Your Private Session
                </button>
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
