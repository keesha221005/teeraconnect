import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Waves } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ForecastStrip({ forecast }) {
  const { t } = useLanguage();

  if (!forecast || !forecast.forecast) return null;

  const weatherIcons = {
    Sunny: { icon: Sun, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    Cloudy: { icon: Cloud, color: 'text-stone-500 bg-stone-50 border-stone-200' },
    Rainy: { icon: CloudRain, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    Stormy: { icon: CloudLightning, color: 'text-red-500 bg-red-50 border-red-200' }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold tracking-tight text-stone-800 px-1">{t('forecastTitle')}</h3>
      
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory">
        {forecast.forecast.map((day, idx) => {
          const config = weatherIcons[day.condition] || weatherIcons.Sunny;
          const IconComponent = config.icon;
          
          return (
            <div 
              key={idx} 
              className="bg-white border-2 border-stone-200 hover:border-stone-300 rounded-2xl p-4 shadow-sm min-w-[140px] w-[140px] flex-shrink-0 snap-start flex flex-col items-center text-center transition-all duration-300"
            >
              <span className="text-xs font-bold text-stone-500 block uppercase">{day.day}</span>
              <span className="text-[10px] font-extrabold text-stone-400 block mt-0.5">{day.date}</span>

              {/* Weather Condition Icon */}
              <div className={`p-3 rounded-2xl border my-3 ${config.color}`}>
                <IconComponent size={28} className="stroke-[2.5]" />
              </div>

              {/* Temp Details */}
              <div className="text-lg font-extrabold text-stone-800">
                {day.tempMax}° / <span className="text-sm font-semibold text-stone-500">{day.tempMin}°</span>
              </div>

              <div className="w-full border-t border-stone-100 my-2 pt-2 space-y-1">
                {/* Wind detail */}
                <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
                  <Wind size={12} className="text-blue-500 stroke-[2.5]" />
                  <span>{day.windSpeedKnots} kt</span>
                </div>
                {/* Wave detail */}
                <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
                  <Waves size={12} className="text-teal-500 stroke-[2.5]" />
                  <span>{day.waveHeightMeters}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
