function WeatherOverlay({ weather }) {
  if (!weather) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      <div className="glass border-b border-white/10">
        <div className="flex items-center px-4 py-2.5 overflow-x-auto scrollbar-hide">
          {/* Temperature - Primary focus */}
          <div className="flex items-center gap-3 pr-4 border-r border-white/20">
            <div className="flex items-baseline">
              <span className="text-3xl font-light text-white">{weather.temp}</span>
              <span className="text-lg text-ocean-300 ml-0.5">°F</span>
            </div>
            {weather.description && (
              <span className="text-sm text-ocean-200 capitalize whitespace-nowrap">
                {weather.description}
              </span>
            )}
          </div>

          {/* Weather Stats */}
          <div className="flex items-center gap-1 pl-4">
            {/* Wind */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <svg 
                className="w-4 h-4 text-ocean-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-white">{weather.wind?.speed}</span>
                <span className="text-xs text-ocean-300">mph {weather.wind?.direction}</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <svg 
                className="w-4 h-4 text-ocean-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 21c-4.5 0-7-3.5-7-7 0-4 7-11 7-11s7 7 7 11c0 3.5-2.5 7-7 7z" 
                />
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-white">{weather.humidity}</span>
                <span className="text-xs text-ocean-300">%</span>
              </div>
            </div>

            {/* Visibility */}
            {weather.visibility && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
                <svg 
                  className="w-4 h-4 text-ocean-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-white">{weather.visibility}</span>
                  <span className="text-xs text-ocean-300">mi</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherOverlay;