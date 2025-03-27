import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button, Box, Typography, Paper, IconButton, CircularProgress, Divider } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { createLazyFileRoute } from '@tanstack/react-router';
import L from 'leaflet';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import CloudIcon from '@mui/icons-material/Cloud';
import WaterIcon from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const mapStyle = {
  height: '70vh',
  width: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
};

const MapControls = ({ onLocate, onZoomIn, onZoomOut, onFullscreen }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1,
        borderRadius: '8px'
      }}
    >
      <IconButton color="primary" onClick={onLocate} title="Locate me">
        <MyLocationIcon />
      </IconButton>
      <IconButton color="primary" onClick={onZoomIn} title="Zoom in">
        <ZoomInIcon />
      </IconButton>
      <IconButton color="primary" onClick={onZoomOut} title="Zoom out">
        <ZoomOutIcon />
      </IconButton>
      <IconButton color="primary" onClick={onFullscreen} title="Fullscreen">
        <FullscreenIcon />
      </IconButton>
    </Paper>
  );
};

const LocationMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on('locationfound', function (e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
};

const WeatherDisplay = ({ position }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!position || position.length !== 2) return;

    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiKey = '542202bc53804761a2634632252703';
        const [lat, lon] = position;
        const baseUrl = 'http://api.weatherapi.com/v1';
        
        // First validate API key
        const validationUrl = `${baseUrl}/current.json?key=${apiKey}&q=London`;
        const validationRes = await fetch(validationUrl);
        
        if (!validationRes.ok) {
          const errorData = await validationRes.json();
          throw new Error(errorData.error?.message || 'API validation failed');
        }

        // Fetch current weather and forecast
        const currentUrl = `${baseUrl}/current.json?key=${apiKey}&q=${lat},${lon}`;
        const forecastUrl = `${baseUrl}/forecast.json?key=${apiKey}&q=${lat},${lon}&days=5`;
        
        const [currentRes, forecastRes] = await Promise.all([
          fetch(currentUrl),
          fetch(forecastUrl)
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
          const currentError = await currentRes.json().catch(() => ({}));
          const forecastError = await forecastRes.json().catch(() => ({}));
          throw new Error(
            currentError.error?.message || 
            forecastError.error?.message || 
            'Weather data request failed'
          );
        }

        const [currentData, forecastData] = await Promise.all([
          currentRes.json(),
          forecastRes.json()
        ]);

        setWeather(currentData);
        setForecast(forecastData);
        
        // Cache data
        localStorage.setItem('weatherCache', JSON.stringify({
          data: currentData,
          forecast: forecastData,
          timestamp: Date.now()
        }));

      } catch (err) {
        console.error('Weather API Error:', err);
        
        // Try to load cached data
        const cached = localStorage.getItem('weatherCache');
        if (cached) {
          const { data, forecast, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 3600000) { // 1 hour cache
            setWeather(data);
            setForecast(forecast);
            setError('Using cached data (last updated: ' + 
              new Date(timestamp).toLocaleTimeString());
            return;
          }
        }
        
        setError(err.message || 'Failed to load weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTimer = setTimeout(fetchWeatherData, 300);
    return () => clearTimeout(fetchTimer);
  }, [position]);

  const getWeatherIcon = (condition) => {
    if (!condition) return <WbSunnyIcon fontSize="large" />;
    
    const conditionText = condition.text.toLowerCase();
    if (conditionText.includes('sunny') || conditionText.includes('clear')) {
      return <WbSunnyIcon fontSize="large" sx={{ color: '#FFA726' }} />;
    } else if (conditionText.includes('rain') || conditionText.includes('drizzle')) {
      return <ThunderstormIcon fontSize="large" sx={{ color: '#42A5F5' }} />;
    } else if (conditionText.includes('cloud')) {
      return <CloudIcon fontSize="large" sx={{ color: '#78909C' }} />;
    }
    return <WbSunnyIcon fontSize="large" />;
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !weather) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: '12px' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: '12px' }}>
      {/* Current Weather */}
      {weather && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {weather.location?.name}, {weather.location?.country}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getWeatherIcon(weather.current.condition)}
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {Math.round(weather.current.temp_c)}°C
              </Typography>
            </Box>
            
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {weather.current.condition.text}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 3,
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AirIcon fontSize="small" sx={{ color: '#757575' }} />
              <Typography variant="body2">Wind: {weather.current.wind_kph} km/h</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WaterIcon fontSize="small" sx={{ color: '#757575' }} />
              <Typography variant="body2">Humidity: {weather.current.humidity}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudIcon fontSize="small" sx={{ color: '#757575' }} />
              <Typography variant="body2">Pressure: {weather.current.pressure_mb} mb</Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* 5-Day Forecast */}
      {forecast && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            5-DAY FORECAST
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {forecast.forecast.forecastday.slice(0, 5).map((day, index) => (
              <Box key={index} sx={{ 
                textAlign: 'center',
                minWidth: '60px'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {getDayName(day.date)}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {Math.round(day.day.avgtemp_c)}°C
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          Note: {error}
        </Typography>
      )}
    </Paper>
  );
};

const MapComponent = () => {
  const [position, setPosition] = useState([-6.175084795513331, 106.94807798715895]);
  const [mapRef, setMapRef] = useState(null);

  const handleLocate = () => {
    if (mapRef) {
      mapRef.locate();
    }
  };

  const handleZoomIn = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() - 1);
    }
  };

  const handleFullscreen = () => {
    const elem = document.querySelector('.leaflet-container');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Location Map
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        <MapContainer 
          style={mapStyle} 
          center={position} 
          zoom={15} 
          scrollWheelZoom={true}
          whenCreated={setMapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <LocationOnIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Our Location
                </Typography>
                <Typography variant="body2">
                  RT.2/RW.1, West Cakung, Cakung, Jakarta 13910
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => {
                    window.open('https://www.google.com/maps?q=-6.175084795513331,106.94807798715895', '_blank');
                  }}
                >
                  Open in Google Maps
                </Button>
              </Box>
            </Popup>
          </Marker>
          <LocationMarker />
        </MapContainer>

        <MapControls 
          onLocate={handleLocate}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreen={handleFullscreen}
        />

        <Paper elevation={3} sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 1000, 
          p: 1.5,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <InfoIcon color="primary" />
          <Typography variant="body2">
            Click and drag to navigate the map
          </Typography>
        </Paper>
      </Box>

      <WeatherDisplay position={position} />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <LocationOnIcon color="primary" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<LocationOnIcon />}
          onClick={() => {
            window.open('https://www.google.com/maps/dir/?api=1&destination=-6.175084795513331,106.94807798715895', '_blank');
          }}
        >
          Get Directions
        </Button>
      </Box>
    </Box>
  );
};

export const Route = createLazyFileRoute('/_protected/map/')({
  component: MapComponent,
});

export default MapComponent;