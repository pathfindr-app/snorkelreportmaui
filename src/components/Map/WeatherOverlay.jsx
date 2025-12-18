function WeatherOverlay({ weather }) {
  if (!weather) return null;

  return (
    <div className="absolute top-16 left-0 right-0 z-10 glass mx-4 rounded-lg px-4 py-3">
      <div className="flex items-center justify-between gap-6">
        {/* Left section: Label + Temperature + Description */}
        <div className="flex items-center gap-4">
          <div className="text-ocean-300 text-xs font-medium">Current Weather</div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-ocean-50">{weather.temp}</span>
            <span className="text-ocean-300">°F</span>
          </div>
          
          {weather.description && (
            <div className="text-sm text-ocean-200 capitalize">{weather.description}</div>
          )}
        </div>

        {/* Right section: Details in a row */}
        <div className="flex items-center gap-6 text-xs">
          {/* Wind */}
          <div className="flex items-center gap-1.5 text-ocean-300">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>Wind</span>
            <span className="text-ocean-200">
              {weather.wind?.speed} mph {weather.wind?.direction}
            </span>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-1.5 text-ocean-300">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
            <span>Humidity</span>
            <span className="text-ocean-200">{weather.humidity}%</span>
          </div>

          {/* Visibility */}
          {weather.visibility && (
            <div className="flex items-center gap-1.5 text-ocean-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Visibility</span>
              <span className="text-ocean-200">{weather.visibility} mi</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeatherOverlay;