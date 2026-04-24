import { formatLastUpdated, formatShortDate } from '../../utils/formatDate';
import brandLogo from '../../../assets/Logo.png';

function Header({
  lastUpdated,
  showBackButton,
  onBackClick,
}) {
  const title = showBackButton
    ? 'Daily Maui snorkel map'
    : 'Daily Maui snorkel conditions';
  const subtitle = showBackButton
    ? 'Scores, spot details, and local context in one map.'
    : 'Updated throughout the day so you can choose cleaner water faster.';

  return (
    <header className="relative z-50">
      <div className="relative overflow-visible px-4 pt-4 md:px-6 md:pt-5">
        <div className="mx-auto max-w-[1400px]">
          <div className="header-shell">
            <div className="header-grid">
              <section className="header-panel">
                <div className="flex items-start gap-3">
                  {showBackButton && (
                    <button
                      onClick={onBackClick}
                      className="group header-back-btn mt-0.5 flex items-center gap-1.5 transition-all duration-300"
                      aria-label="Back to report"
                    >
                      <div className="header-back-btn-ring flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </button>
                  )}

                  <div>
                    <p className="header-eyebrow">Snorkel Report Maui</p>
                    <h1 className="header-title">{title}</h1>
                    <p className="header-body">
                      {subtitle}
                    </p>
                  </div>
                </div>

                {lastUpdated && (
                  <>
                    <p className="header-updated mt-5 hidden items-center gap-2 sm:flex">
                      <span className="header-status-dot" />
                      Updated: {formatLastUpdated(lastUpdated)}
                    </p>
                    <p className="header-updated mt-5 flex items-center gap-2 sm:hidden">
                      <span className="header-status-dot" />
                      {formatShortDate(lastUpdated)}
                    </p>
                  </>
                )}
              </section>

              <div className="header-logo-wrap">
                <img
                  src={brandLogo}
                  alt="Snorkel Report Maui"
                  className="header-logo"
                />
              </div>

              <section className="header-aside">
                <div className="header-note">
                  <p className="header-eyebrow">Interactive field map</p>
                  <p className="header-note-title">Spot scores, directions, webcams, and local details.</p>
                </div>
                <div className="header-chip-row">
                  <div className="header-chip">
                    <span className="header-chip-label">Coverage</span>
                    <span className="header-chip-value">West, South, North shores</span>
                  </div>
                  <div className="header-chip">
                    <span className="header-chip-label">Today</span>
                    <span className="header-chip-value">Compare coasts and open the best spots</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
