import React from 'react';
import { Thermometer, Wind, Waves, Droplets, Sunrise, Sunset, Compass, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WeatherSummary({ weather }) {
  const { t } = useLanguage();

  if (!weather) return null;

  // Convert degree to direction name
  const getWindDirectionName = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xl font-bold tracking-tight text-stone-800">{t('weatherTitle')}</h3>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${weather.isSimulated ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
          {weather.isSimulated ? t('simulatedData') : t('realTimeData')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Temp Card */}
        <div className="ocean-card flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Thermometer size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase">{t('tempRange')}</span>
            <div className="text-2xl font-extrabold text-stone-900">{weather.temp}°C</div>
            <span className="text-xs text-stone-500 font-semibold">{weather.tempMin}°C - {weather.tempMax}°C</span>
          </div>
        </div>

        {/* Wind Speed Card */}
        <div className="ocean-card flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wind size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase">{t('wind')}</span>
            <div className="text-2xl font-extrabold text-stone-900">{weather.windSpeedKnots} <span className="text-sm font-medium">{t('knots')}</span></div>
            <span className="text-xs text-stone-500 font-semibold flex items-center gap-0.5">
              <Compass size={12} /> {getWindDirectionName(weather.windDirection)} ({weather.windDirection}°)
            </span>
          </div>
        </div>

        {/* Wave Height Card */}
        <div className="ocean-card flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Waves size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase">{t('waves')}</span>
            <div className="text-2xl font-extrabold text-stone-900">{weather.waveHeightMeters} <span className="text-sm font-medium">{t('meters')}</span></div>
            <span className="text-xs font-semibold text-stone-500">
              {weather.waveHeightMeters > 2.5 ? 'Rough sea' : weather.waveHeightMeters > 1.5 ? 'Moderate swell' : 'Calm waves'}
            </span>
          </div>
        </div>

        {/* Rain Chance Card */}
        <div className="ocean-card flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Droplets size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase">{t('rainChance')}</span>
            <div className="text-2xl font-extrabold text-stone-900">{weather.rainChance}%</div>
            <span className="text-xs font-semibold text-stone-500">{t('humidity')}: {weather.humidity}%</span>
          </div>
        </div>
      </div>

      {/* Tides Schedule Card */}
      <div className="ocean-card">
        <div className="flex items-center gap-2 border-b pb-2 mb-3 border-stone-200">
          <Clock size={20} className="text-stone-600 stroke-[2.5]" />
          <h4 className="font-extrabold text-stone-800 tracking-tight">{t('tides')}</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {weather.tideTimes.map((tide, idx) => (
            <div key={idx} className="bg-stone-50 border border-stone-200 p-2 rounded-xl text-center">
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${tide.type === 'High' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                {tide.type === 'High' ? t('highTide') : t('lowTide')}
              </span>
              <div className="text-sm font-extrabold text-stone-800 mt-1.5">{tide.time}</div>
              <div className="text-xs text-stone-500 font-semibold">{tide.height}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sun Schedule Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="ocean-card flex items-center gap-3 justify-center py-4">
          <Sunrise className="text-amber-500 stroke-[2.5]" size={24} />
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase block">{t('sunrise')}</span>
            <span className="text-sm font-extrabold text-stone-800">06:05 AM</span>
          </div>
        </div>
        <div className="ocean-card flex items-center gap-3 justify-center py-4">
          <Sunset className="text-orange-500 stroke-[2.5]" size={24} />
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase block">{t('sunset')}</span>
            <span className="text-sm font-extrabold text-stone-800">06:45 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
