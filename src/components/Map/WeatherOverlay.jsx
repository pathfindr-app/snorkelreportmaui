function WeatherOverlay({ weather, userWeather }) {
  if (!weather) return null;

  const windRotation = weather.wind?.deg || 0;

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
            <div className="weather-copy">
              {weather.description && (
                <span className="weather-condition">
                  {weather.description}
                </span>
              )}
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
