function WeatherOverlay({ weather, userWeather }) {
  if (!weather) return null;

  const windRotation = weather.wind?.deg || 0;
  const description = weather.description?.toLowerCase() || '';
  const isClear = description.includes('clear');
  const isRain = description.includes('rain') || description.includes('shower');

  const formatShortTime = (time) => {
    if (!time) return '';
    return time.replace(' AM', 'a').replace(' PM', 'p');
  };

  return (
    <div className="weather-dock-wrap">
      <div className="weather-ribbon">
        <div className="weather-ribbon-inner">
          <div className="weather-primary">
            <div className="flex items-baseline">
              <span className="weather-temp">
                {weather.temp}
              </span>
              <span className="weather-degree">°</span>
            </div>
            <span className="weather-condition-icon" aria-label={weather.description || 'Current conditions'} title={weather.description || 'Current conditions'}>
              {isRain ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 16.5a4.5 4.5 0 01.8-8.93A6 6 0 0119 10.5a3.5 3.5 0 01-.5 6.96" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.5 19.5l-1 1.75M13 18.75l-1.2 2.1M17.5 19.5l-1 1.75" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : isClear ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="4.4" strokeWidth="1.8" />
                  <path d="M12 2.8v2M12 19.2v2M21.2 12h-2M4.8 12h-2M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4M18.5 18.5l-1.4-1.4M6.9 6.9L5.5 5.5" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7.2 17.5h9.2a4 4 0 00.3-7.99A5.8 5.8 0 005.4 10.9 3.45 3.45 0 007.2 17.5z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16.4 7.7A4.4 4.4 0 0012.3 5a4.6 4.6 0 00-4.2 2.6" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <div className="weather-copy">
              <span className="weather-location">{weather.locationName || 'Maui, HI'}</span>
            </div>
          </div>

          <div className="weather-stats">
            <div className="weather-stat">
              <svg
                className="h-3.5 w-3.5 text-[#7ea59e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: `rotate(${windRotation}deg)` }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4l4 4-4 4" />
              </svg>
              <span>{weather.wind?.speed} mph {weather.wind?.direction}</span>
            </div>

            <div className="weather-stat">
              <svg className="h-3.5 w-3.5 text-[#7ea59e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21c-4 0-6-3-6-6 0-3.5 6-9 6-9s6 5.5 6 9c0 3-2 6-6 6z" />
              </svg>
              <span>{weather.humidity}%</span>
            </div>

            {weather.visibility && (
              <div className="weather-stat">
                <svg className="h-3.5 w-3.5 text-[#7ea59e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{weather.visibility} mi</span>
              </div>
            )}

            {weather.sunrise && (
              <div className="weather-stat">
                <span className="text-[#d49c7c]">↑</span>
                <span>{formatShortTime(weather.sunrise)}</span>
              </div>
            )}
            {weather.sunset && (
              <div className="weather-stat">
                <span className="text-[#c88478]">↓</span>
                <span>{formatShortTime(weather.sunset)}</span>
              </div>
            )}

            {userWeather?.temp && (
              <div className="weather-stat">
                <span className="text-[#7ea59e]">Local</span>
                <span>{userWeather.temp}° nearby</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherOverlay;
