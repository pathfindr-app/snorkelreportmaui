import { formatLastUpdated, formatShortDate } from '../../utils/formatDate';

function Header({ lastUpdated, onReportClick, onBookingClick, showBackButton, onBackClick }) {
  return (
    <header className="bg-ocean-900/90 backdrop-blur-sm border-b border-ocean-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back button or Logo */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="text-ocean-300 hover:text-ocean-100 transition-colors flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <div>
              <h1
                className="text-lg sm:text-xl font-semibold text-ocean-50 tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Snorkel Report Maui
              </h1>
              {lastUpdated && (
                <>
                  <p className="text-xs text-ocean-400 hidden sm:block">
                    Updated: {formatLastUpdated(lastUpdated)}
                  </p>
                  <p className="text-xs text-ocean-400 sm:hidden">
                    {formatShortDate(lastUpdated)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBookingClick}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-ocean-950 bg-ocean-300 hover:bg-ocean-200 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Book Activity</span>
              <span className="sm:hidden">Book</span>
            </button>
            <button
              onClick={onReportClick}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-ocean-200 border border-ocean-500 hover:bg-ocean-800 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Submit Report</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
