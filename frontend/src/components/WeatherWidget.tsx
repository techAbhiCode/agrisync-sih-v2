import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Open-Meteo WMO Weather interpretation codes
const getWeatherDetails = (code: number) => {
  if (code === 0) return { label: 'Clear sky', icon: <Sun className="h-10 w-10 text-yellow-400" /> };
  if (code === 1 || code === 2 || code === 3) return { label: 'Partly cloudy', icon: <Cloud className="h-10 w-10 text-zinc-300" /> };
  if (code >= 45 && code <= 48) return { label: 'Fog', icon: <Cloud className="h-10 w-10 text-zinc-400" /> };
  if (code >= 51 && code <= 67) return { label: 'Rain', icon: <CloudRain className="h-10 w-10 text-blue-400" /> };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: <Cloud className="h-10 w-10 text-white" /> };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: <CloudRain className="h-10 w-10 text-blue-500" /> };
  if (code >= 95) return { label: 'Thunderstorm', icon: <CloudLightning className="h-10 w-10 text-purple-400" /> };
  return { label: 'Unknown', icon: <Cloud className="h-10 w-10 text-zinc-400" /> };
};

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  code: number;
  forecast: { day: string; max: number; min: number; code: number }[];
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Lucknow, UP'); // Default

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        const data = await res.json();
        
        const forecast = data.daily.time.slice(1, 4).map((time: string, i: number) => {
          const date = new Date(time);
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            max: Math.round(data.daily.temperature_2m_max[i + 1]),
            min: Math.round(data.daily.temperature_2m_min[i + 1]),
            code: data.daily.weather_code[i + 1],
          };
        });

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          code: data.current.weather_code,
          forecast,
        });
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };

    // Try to get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
          setLocationName('Your Location');
        },
        () => {
          // Fallback to Lucknow if location denied
          fetchWeather(26.8467, 80.9462);
        }
      );
    } else {
      fetchWeather(26.8467, 80.9462);
    }
  }, []);

  if (loading) {
    return (
      <Card className="bg-zinc-900/60 backdrop-blur-xl border-zinc-800 shadow-xl h-full flex items-center justify-center min-h-[220px]">
        <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
      </Card>
    );
  }

  if (!weather) return null;

  const currentDetails = getWeatherDetails(weather.code);

  return (
    <Card className="bg-gradient-to-br from-sky-950/40 to-blue-900/20 backdrop-blur-xl border-sky-900/30 shadow-xl h-full relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />
      
      <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
        
        {/* Top: Location & Current Weather */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium mb-2">
              <MapPin className="h-3.5 w-3.5 text-sky-400" />
              {locationName}
            </div>
            <div className="flex items-center gap-3">
              {currentDetails.icon}
              <div>
                <div className="text-4xl font-black text-white tracking-tighter">
                  {weather.temp}°<span className="text-2xl text-zinc-500 font-bold tracking-normal">C</span>
                </div>
                <div className="text-sm font-medium text-sky-400">{currentDetails.label}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 text-xs font-medium text-zinc-400 bg-zinc-950/30 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              {weather.humidity}%
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-3.5 w-3.5 text-teal-400" />
              {weather.windSpeed} km/h
            </div>
          </div>
        </div>

        {/* Bottom: 3-Day Forecast */}
        <div className="border-t border-sky-900/30 pt-4 mt-auto">
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.map((day, i) => {
              const details = getWeatherDetails(day.code);
              return (
                <div key={i} className="flex flex-col items-center bg-zinc-950/30 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-zinc-400 mb-1">{day.day}</span>
                  <div className="scale-75 mb-1">{details.icon}</div>
                  <div className="text-xs font-bold text-zinc-200">
                    {day.max}° <span className="text-zinc-500 font-normal">{day.min}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
