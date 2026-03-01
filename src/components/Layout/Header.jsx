import { formatLastUpdated, formatShortDate } from '../../utils/formatDate';

function Header({
  lastUpdated,
  onReportClick,
  onBookingClick,
  onPrivateExperienceClick,
  showBackButton,
  onBackClick,
}) {
  return (
    <header className="relative z-50">
      {/* Unified header + private funnel */}
      <div
        className="private-funnel-bar relative overflow-hidden backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(5, 21, 32, 0.95) 0%, rgba(3, 11, 18, 0.9) 100%)',
        }}
      >
        <div className="private-funnel-wave" />
        <div className="private-funnel-wave private-funnel-wave-delay" />

        <div className="relative max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
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
              <div className="min-w-0">
                <h1 className="font-display text-lg sm:text-xl text-ocean-50 tracking-wide">
                  <span className="text-glow-cyan">Snorkel</span>{' '}
                  <span className="text-ocean-100">Report</span>{' '}
                  <span className="text-coral-warm">Maui</span>
                </h1>
                {lastUpdated && (
                  <>
                    <p className="text-[11px] text-ocean-500 hidden sm:flex items-center gap-1.5 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-glow-cyan/60" />
                      Updated: {formatLastUpdated(lastUpdated)}
                    </p>
                    <p className="text-[11px] text-ocean-500 sm:hidden flex items-center gap-1.5 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-glow-cyan/60" />
                      {formatShortDate(lastUpdated)}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onBookingClick}
                className="hidden lg:inline-flex glow-btn-outline px-4 py-2 text-sm font-medium rounded-full"
              >
                General Booking
              </button>
              <button
                onClick={onReportClick}
                className="glow-btn-outline px-4 py-2 text-sm font-medium rounded-full"
              >
                <span className="hidden sm:inline">Submit Report</span>
                <span className="sm:hidden">Report</span>
              </button>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-glow-cyan/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-[12px] sm:text-sm text-ocean-100 leading-relaxed">
              Private snorkel or scuba with Kyle: 11-year Maui guide, PADI Divemaster, pro
              underwater photographer, and the builder of this website.
            </p>
            <button
              onClick={onPrivateExperienceClick}
              className="private-funnel-btn shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold"
            >
              Book Your Private Session
            </button>
          </div>
        </div>
      </div>

      {/* Subtle border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow-cyan/30 to-transparent" />
    </header>
  );
}

export default Header;
