import React from 'react';

export default function WeatherCard({ weather, destination }) {
  const isAvailable = weather && weather.status === 'live' && weather.temperature != null;

  const getWeatherIcon = (iconCode, condition) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('rain')) return '🌧️';
    if (c.includes('cloud')) return '⛅';
    if (c.includes('clear')) return '☀️';
    if (c.includes('snow')) return '❄️';
    if (c.includes('thunder')) return '⛈️';
    return '🌤️';
  };

  return (
    <div className="travel-weather-card">
      <div className="weather-card-header">
        <div className="weather-title-area">
          <span className="weather-header-icon" aria-hidden="true">🌦️</span>
          <div>
            <h4 className="weather-dest-title">Weather in {destination || 'Destination'}</h4>
            <span className="weather-sub">Real-time Forecast</span>
          </div>
        </div>

        {isAvailable ? (
          <span className="badge badge-live" title="Live data from OpenWeatherMap">
            LIVE
          </span>
        ) : (
          <span className="badge badge-unavailable" title="Weather data currently unavailable">
            UNAVAILABLE
          </span>
        )}
      </div>

      <div className="weather-card-body">
        {isAvailable ? (
          <>
            <div className="weather-current-row">
              <div className="weather-temp-block">
                <span className="weather-icon-large">
                  {getWeatherIcon(weather.icon, weather.condition)}
                </span>
                <div>
                  <span className="weather-temperature">{weather.temperature}°C</span>
                  <span className="weather-condition-label">{weather.description || weather.condition}</span>
                </div>
              </div>

              <div className="weather-details-block">
                <div className="weather-detail-item">
                  <span className="detail-label">Feels like</span>
                  <span className="detail-val">{weather.feels_like != null ? `${weather.feels_like}°C` : '--'}</span>
                </div>
                <div className="weather-detail-item">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-val">{weather.humidity != null ? `${weather.humidity}%` : '--'}</span>
                </div>
                <div className="weather-detail-item">
                  <span className="detail-label">Rain Chance</span>
                  <span className="detail-val">{weather.rain_probability != null ? `${weather.rain_probability}%` : '--'}</span>
                </div>
              </div>
            </div>

            {/* Forecast Row */}
            {weather.forecast && weather.forecast.length > 0 && (
              <div className="weather-forecast-strip">
                <span className="forecast-title">Upcoming Days:</span>
                <div className="forecast-chips">
                  {weather.forecast.map((fc, idx) => (
                    <div key={idx} className="forecast-chip">
                      <span className="fc-day">{fc.day}</span>
                      <span className="fc-icon">{getWeatherIcon(fc.icon, fc.condition)}</span>
                      <span className="fc-temp">{fc.temp}°C</span>
                      <span className="fc-cond">{fc.condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="weather-unavailable-box">
            <p>Weather data is temporarily unavailable for this location.</p>
          </div>
        )}
      </div>

      <div className="weather-card-footer">
        <span className="weather-provider-note">
          Provider: <strong>OpenWeatherMap API</strong>
        </span>
      </div>
    </div>
  );
}
