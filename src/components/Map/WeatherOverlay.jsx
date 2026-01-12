function WeatherOverlay({ weather, userWeather }) {
  if (!weather) return null;

  const windRotation = weather.wind?.deg || 0;

  const formatShortTime = (time) => {
    if (!time) return '';
    return time.replace(' AM', 'a').replace(' PM', 'p');
  };

  // Compact temperature display
  const TempDisplay = ({ data }) => (
    <div className="flex items-baseline">
      <span className="text-4xl font-semibold text-ocean-50 font-display">
        {data.temp}
      </span>
      <span className="text-base text-glow-cyan/60 ml-0.5">°</span>
      <span className="ml-2 text-xs text-ocean-400">
        {data.locationName}
      </span>
    </div>
  );

  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      <div
        className="backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(5, 21, 32, 0.95) 0%, rgba(3, 11, 18, 0.9) 100%)',
          borderBottom: '1px solid rgba(0, 229, 204, 0.1)',
        }}
      >
        <div className="flex items-center px-4 py-3 overflow-x-auto scrollbar-hide gap-4">

          {/* Temperatures side-by-side */}
          <div
            className="flex items-center gap-5 pr-5 shrink-0"
            style={{ borderRight: '1px solid rgba(0, 229, 204, 0.15)' }}
          >
            <div className="relative">
              <div className="absolute inset-0 w-14 h-14 bg-glow-cyan/20 blur-xl rounded-full" />
              <div className="relative flex items-center gap-5">
                {/* Maalaea Harbor */}
                <TempDisplay data={weather} />

                {/* User location (if available) */}
                {userWeather && (
                  <>
                    <span className="text-glow-cyan/30">|</span>
                    <TempDisplay data={userWeather} />
                  </>
                )}
              </div>
            </div>
            {weather.description && (
              <span className="text-sm text-ocean-100 capitalize whitespace-nowrap font-medium">
                {weather.description}
              </span>
            )}
          </div>

          {/* Weather Stats */}
          <div className="flex items-center gap-2">

            {/* Wind */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
              style={{
                background: 'rgba(0, 229, 204, 0.08)',
                border: '1px solid rgba(0, 229, 204, 0.1)',
              }}
            >
              <svg
                className="w-4 h-4 text-glow-cyan/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: `rotate(${windRotation}deg)` }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4l4 4-4 4" />
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-ocean-100">{weather.wind?.speed}</span>
                <span className="text-xs text-ocean-400">mph {weather.wind?.direction}</span>
              </div>
            </div>

            {/* Humidity */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
              style={{
                background: 'rgba(0, 229, 204, 0.08)',
                border: '1px solid rgba(0, 229, 204, 0.1)',
              }}
            >
              <svg className="w-4 h-4 text-glow-cyan/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21c-4 0-6-3-6-6 0-3.5 6-9 6-9s6 5.5 6 9c0 3-2 6-6 6z" />
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-ocean-100">{weather.humidity}</span>
                <span className="text-xs text-ocean-400">%</span>
              </div>
            </div>

            {/* Visibility */}
            {weather.visibility && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
                style={{
                  background: 'rgba(0, 229, 204, 0.08)',
                  border: '1px solid rgba(0, 229, 204, 0.1)',
                }}
              >
                <svg className="w-4 h-4 text-glow-cyan/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-ocean-100">{weather.visibility}</span>
                  <span className="text-xs text-ocean-400">mi</span>
                </div>
              </div>
            )}

            {/* Sunrise/Sunset */}
            {(weather.sunrise || weather.sunset) && (
              <div
                className="flex items-center gap-3 px-3 py-1.5 rounded-full transition-all duration-300"
                style={{
                  background: 'rgba(255, 126, 103, 0.08)',
                  border: '1px solid rgba(255, 126, 103, 0.1)',
                }}
              >
                {weather.sunrise && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-coral-warm/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="14" r="4" />
                      <path d="M12 6V2m0 4l-2-2m2 2l2-2" strokeLinecap="round" />
                      <path d="M4 14H2m4.343-5.657L4.93 6.93m12.728 0l1.414 1.414M22 14h-2" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-medium text-ocean-100">{formatShortTime(weather.sunrise)}</span>
                  </div>
                )}
                {weather.sunrise && weather.sunset && <span className="text-ocean-600">·</span>}
                {weather.sunset && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-coral-pink/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="10" r="4" />
                      <path d="M12 18v4m0-4l-2 2m2-2l2 2" strokeLinecap="round" />
                      <path d="M4 10H2m4.343 5.657l-1.414 1.414m12.728 0l1.414-1.414M22 10h-2" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-medium text-ocean-100">{formatShortTime(weather.sunset)}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherOverlay;
