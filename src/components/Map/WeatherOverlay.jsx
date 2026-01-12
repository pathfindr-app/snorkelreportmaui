function WeatherOverlay({ weather, userWeather }) {
  if (!weather) return null;

  const windRotation = weather.wind?.deg || 0;

  const formatShortTime = (time) => {
    if (!time) return '';
    return time.replace(' AM', 'a').replace(' PM', 'p');
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      <div
        className="backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(5, 21, 32, 0.92) 0%, rgba(3, 11, 18, 0.88) 100%)',
          borderBottom: '1px solid rgba(0, 229, 204, 0.08)',
        }}
      >
        <div className="flex items-center px-4 py-2.5 overflow-x-auto scrollbar-hide gap-5">

          {/* Temperature */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-ocean-50 font-display">
                {weather.temp}
              </span>
              <span className="text-sm text-glow-cyan/50 ml-0.5">°</span>
            </div>
            {weather.description && (
              <span className="text-sm text-ocean-300 capitalize">
                {weather.description}
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-ocean-700/50" />

          {/* Weather Stats */}
          <div className="flex items-center gap-4 text-[13px] text-ocean-300">

            {/* Wind */}
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-ocean-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: `rotate(${windRotation}deg)` }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4l4 4-4 4" />
              </svg>
              <span>{weather.wind?.speed} mph {weather.wind?.direction}</span>
            </div>

            {/* Humidity */}
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21c-4 0-6-3-6-6 0-3.5 6-9 6-9s6 5.5 6 9c0 3-2 6-6 6z" />
              </svg>
              <span>{weather.humidity}%</span>
            </div>

            {/* Visibility */}
            {weather.visibility && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{weather.visibility} mi</span>
              </div>
            )}

            {/* Sunrise/Sunset */}
            {weather.sunrise && (
              <div className="flex items-center gap-1">
                <span className="text-coral-warm/60">↑</span>
                <span>{formatShortTime(weather.sunrise)}</span>
              </div>
            )}
            {weather.sunset && (
              <div className="flex items-center gap-1">
                <span className="text-coral-pink/60">↓</span>
                <span>{formatShortTime(weather.sunset)}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default WeatherOverlay;
