import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForecast, setShowForecast] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);  
  const [viewMainPage, setViewMainPage] = useState(false); 

  const fetchWeather = async () => {
    if (!location.trim()) return alert('Enter a valid location');

    setIsLoading(true);
    setError('');
    setHasSearched(true);  
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=895284fb2d2c50a520ea537456963d9c`
      );
      if (!weatherResponse.ok) throw new Error('Location not found');
      const weather = await weatherResponse.json();
      setWeatherData(weather);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=895284fb2d2c50a520ea537456963d9c`
      );
      if (!forecastResponse.ok) throw new Error('Forecast data not found');
      const forecast = await forecastResponse.json();
      setForecastData(forecast);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
    if (weatherData) fetchWeather();
  };

  const handleForecastToggle = () => {
    setShowForecast((prev) => !prev);
  };

  const filteredForecast = forecastData
    ? forecastData.list
        .filter((item) => {
          const forecastDate = new Date(item.dt_txt);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return forecastDate > today;
        })
        .reduce((acc, item) => {
          const forecastDate = new Date(item.dt_txt);
          const day = forecastDate.toLocaleDateString();
          if (!acc.some((forecast) => forecast.date === day)) {
            acc.push({
              date: day,
              temp: Math.round(item.main.temp),
              description: item.weather[0].description,
              icon: item.weather[0].icon,
            });
          }
          return acc;
        }, [] )
        .slice(0, 4)
    : [];

  const handleDownloadWeather = () => {
    if (!weatherData) return alert('No weather data to download');

    const data = {
      location: weatherData.name,
      temperature: weatherData.main.temp,
      condition: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${weatherData.name}_weather.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareWeather = () => {
    if (!weatherData) return alert('No weather data to share');

    const shareData = {
      title: `Weather in ${weatherData.name}`,
      text: `The current temperature in ${weatherData.name} is ${Math.round(weatherData.main.temp)}°${unit === 'metric' ? 'C' : 'F'}. Condition: ${weatherData.weather[0].description}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => console.log('Weather shared successfully!'))
        .catch((error) => console.error('Error sharing weather:', error));
    } else {
      alert('Web share is not supported in this browser.');
    }
  };

  const handleBackToMain = () => {
    setWeatherData(null);
    setForecastData(null);
    setHasSearched(false);
    setLocation('');
    setViewMainPage(true);
  };

  return (
    <div className={`app ${weatherData ? weatherData.weather[0].main.toLowerCase() : 'default'}`}>
      <div className="content-container">
        <div className="main-box">
          <div>
            {!hasSearched && (
              <div className="welcome-container">
                <div className="blinking-text">
                  <h1>Welcome to My Weather Forecast App!</h1>
                  <p className="caption">Search your weather... Enjoy your climate</p>
                </div>
              </div>
            )}
            
            <div className={`search-container ${hasSearched ? 'hidden' : ''}`}>
              <input
                type="text"
                placeholder="Enter a location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
              />
              <button onClick={fetchWeather}>Search</button>
            </div>

            {isLoading && <p className="loading">Fetching weather data...</p>}
            {error && <p className="error">{error}</p>}
            {weatherData && !viewMainPage && (
              <div className="weather-container">
                <div className="main-weather">
                  <h2>{weatherData.name}</h2>
                  <h1>
                    {Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                  </h1>
                  <p className="condition">{weatherData.weather[0].description}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                    alt="weather icon"
                  />
                </div>
                <div className="details-grid">
                  <div className="detail-card">
                    <h3>{weatherData.main.humidity}%</h3>
                    <p>Humidity</p>
                  </div>
                  <div className="detail-card">
                    <h3>{Math.round(weatherData.visibility / 1000)} km</h3>
                    <p>Visibility</p>
                  </div>
                  <div className="detail-card">
                    <h3>{Math.round(weatherData.wind.speed)} m/s</h3>
                    <p>Wind Speed</p>
                  </div>
                </div>
                <button className="unit-toggle" onClick={toggleUnit}>
                  Switch to {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
                </button>
                <button className="forecast-toggle" onClick={handleForecastToggle}>
                  {showForecast ? 'Hide Report' : 'Check Forecast Report'}
                </button>
                <div className="weather-buttons">
                  <button className="download-btn" onClick={handleDownloadWeather}>
                    Download Weather
                  </button>
                  <button className="share-btn" onClick={handleShareWeather}>
                    Share Weather
                  </button>
                  <button className="back-btn" onClick={handleBackToMain}>
                    search again
                  </button>
                </div>
              </div>
            )}

            {showForecast && filteredForecast.length > 0 && !viewMainPage && (
              <div className="forecast-container">
                <h3>UPCOMING 4 DAY FORECAST:</h3>
                <div className="forecast-grid">
                  {filteredForecast.map((item, index) => (
                    <div key={index} className="forecast-card">
                      <h4>{item.date}</h4>
                      <p>{item.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
                      <p>{item.description}</p>
                      <img
                        src={`http://openweathermap.org/img/wn/${item.icon}.png`}
                        alt="weather icon"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
