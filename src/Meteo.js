import { Oval } from 'react-loader-spinner';
import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('favorites')) || []
  );

  const toDateFunction = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDate = new Date();
    const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput('');
      setWeather({ ...weather, loading: true });
      const url = 'https://api.openweathermap.org/data/2.5/forecast';
      const api_key = 'f00c38e0279b7bc85480c3fe775d518c';
      await axios
        .get(url, {
          params: {
            q: input,
            units: 'metric',
            cnt: 6, // Prévisions pour 5 jours
            appid: api_key,
          },
        })
        .then((res) => {
          setWeather({ data: res.data, loading: false, error: false });
        })
        .catch((error) => {
          setWeather({ ...weather, data: {}, error: true });
          setInput('');
        });
    }
  };

  const addToFavorites = (city) => {
    if (!favorites.some(fav => fav.id === city.id)) {
      const updatedFavorites = [...favorites, city];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };

  const removeFromFavorites = (city) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== city.id);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };
  const getLocation = () => {
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeatherByCoordinates(lat, lon);
       });
    } else {
       console.log("Geolocation is not supported by this browser.");
    }
 };
 
 const fetchWeatherByCoordinates = async (lat, lon) => {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    try {
       const response = await axios.get(url);
       setWeather({ data: response.data, loading: false, error: false });
    } catch (error) {
       setWeather({ ...weather, data: {}, error: true });
    }
 };
 
 useEffect(() => {
    getLocation();  // Appel de la fonction au chargement de la page
 }, []);
 
  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          name="query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
      </div>
      {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}
      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}
      {weather && weather.data && weather.data.list && (
        <div>
          <h2>{weather.data.city.name}, {weather.data.city.country}</h2>
          <span>{toDateFunction()}</span>
          <div className="forecast">
            {weather.data.list.slice(0, 5).map((forecast, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(forecast.dt * 1000).toLocaleDateString()}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                  alt={forecast.weather[0].description}
                />
                <p>{Math.round(forecast.main.temp)}°C</p>
                <p>{forecast.weather[0].description}</p>
              </div>
            ))}
          </div>
          <button onClick={() => addToFavorites(weather.data.city)}>
            Ajouter aux favoris
          </button>
        </div>
      )}
      <div>
        <h3>Villes favorites</h3>
        {favorites.length > 0 ? (
          favorites.map((fav, index) => (
            <button key={index} onClick={() => setInput(fav.name)}>
              {fav.name}
            </button>
          ))
        ) : (
          <p>Aucune ville favorite</p>
        )}
      </div>
    </div>
  );
}

export default Grp204WeatherApp;