import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Droplets, Wind, CloudRain, Sun, Compass, 
  MapPin, Calendar, Info, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { TN_DISTRICTS } from '../constants/tn_data';

export const Weather = () => {
  const [district, setDistrict] = useState('Thanjavur');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWeather(district);
  }, [district]);

  const loadWeather = async (targetDistrict) => {
    setLoading(true);
    setError('');
    try {
      const data = await weatherService.getForecast(targetDistrict);
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch meteorological data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Agro-Weather Intelligence
            </h1>
            <Badge variant="primary" size="sm">Tamil Nadu Microclimate</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time agro-meteorology and 7-day forecast tailored for agricultural field planning and spraying windows.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            label="Select District"
            options={TN_DISTRICTS}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label={`Loading agro-meteorological data for ${district}...`} />
        </div>
      ) : weatherData ? (
        <div className="space-y-6">
          {/* Current Conditions Large Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 text-agri-400" />
                  <span className="font-semibold text-white text-sm">{weatherData.district}, Tamil Nadu</span>
                  <span>&bull;</span>
                  <span>{new Date(weatherData.current.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
                    {weatherData.current.temperature}°C
                  </span>
                  <div>
                    <span className="text-lg font-bold text-slate-200 block">
                      {weatherData.current.condition}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Source: {weatherData.provider}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-agri-100 max-w-2xl leading-relaxed">
                  <strong>Agricultural Impact:</strong> {weatherData.current.agricultural_summary}
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs shrink-0">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <Droplets className="w-4 h-4 text-blue-400" /> Humidity
                  </span>
                  <span className="text-base font-bold text-white">{weatherData.current.humidity}%</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <CloudRain className="w-4 h-4 text-teal-400" /> Rain Chance
                  </span>
                  <span className="text-base font-bold text-white">{weatherData.current.rain_probability}%</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <Wind className="w-4 h-4 text-slate-300" /> Wind Speed
                  </span>
                  <span className="text-base font-bold text-white">{weatherData.current.wind_speed} km/h</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <CloudSun className="w-4 h-4 text-amber-400" /> Precipitation
                  </span>
                  <span className="text-base font-bold text-white">{weatherData.current.rainfall} mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-agri-600" />
              <span>7-Day Agro-Meteorological Forecast</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {weatherData.forecast.map((day, idx) => (
                <Card key={idx} className="p-4 flex flex-col justify-between text-xs hover:border-agri-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">{idx === 0 ? 'Tomorrow' : day.day_name.slice(0, 3)}</span>
                      <span className="text-[10px] text-slate-400">{day.date.slice(5)}</span>
                    </div>

                    <div className="my-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-agri-50 text-agri-600 flex items-center justify-center mx-auto mb-2">
                        {day.icon === 'rain' ? <CloudRain className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {day.temperature_max}° <span className="text-slate-400 text-xs font-normal">/ {day.temperature_min}°</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{day.condition}</span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-500 py-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Rain:</span>
                        <span className="font-semibold text-slate-700">{day.rain_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Humidity:</span>
                        <span className="font-semibold text-slate-700">{day.humidity}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-2.5 rounded-b-xl text-[10px] text-slate-600 leading-tight">
                    <strong>Advice:</strong> {day.agri_advice}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
