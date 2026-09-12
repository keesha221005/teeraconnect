import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Search, Fish, MapPin, Landmark, DollarSign } from 'lucide-react';

export default function PriceTrendsView({ prices = [], selectedLocation = '' }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate species price trends from existing prices array
  const speciesMap = {};
  prices.forEach(p => {
    if (!speciesMap[p.fishType]) {
      speciesMap[p.fishType] = [];
    }
    speciesMap[p.fishType].push(p);
  });

  const trends = Object.keys(speciesMap).map(fishType => {
    const pList = speciesMap[fishType];
    const pricesArr = pList.map(p => parseFloat(p.pricePerKg) || 0);
    const minPrice = Math.min(...pricesArr);
    const maxPrice = Math.max(...pricesArr);
    const avgPrice = Math.round(pricesArr.reduce((a, b) => a + b, 0) / pricesArr.length);
    const latest = pList[0];
    const previous = pList.length > 1 ? pList[1] : pList[0];
    const diff = parseFloat(latest.pricePerKg) - parseFloat(previous.pricePerKg);
    const trendDirection = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';

    return {
      fishType,
      latestPrice: parseFloat(latest.pricePerKg),
      minPrice,
      maxPrice,
      avgPrice,
      location: latest.location,
      trend: trendDirection,
      diff: Math.abs(diff),
      totalReports: pList.length
    };
  });

  const filteredTrends = trends.filter(t => 
    t.fishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 shadow-lg border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ocean-teal rounded-2xl flex items-center justify-center font-black text-white shadow-md">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest block">MARKET ANALYTICS</span>
            <h3 className="text-md font-black tracking-tight">Species Price Trends</h3>
          </div>
        </div>
        <span className="text-[10px] font-extrabold bg-stone-800 border border-stone-700 text-stone-300 px-2.5 py-1 rounded-xl">
          Live Market
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Filter species (e.g. Mackerel, Pomfret, Kingfish)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:border-ocean-teal focus:outline-none shadow-sm"
        />
      </div>

      {/* Trend Cards Grid */}
      {filteredTrends.length === 0 ? (
        <div className="text-center py-10 bg-white border-2 border-stone-200 rounded-3xl text-stone-500 font-semibold text-xs">
          No species price data available for current search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrends.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border-2 border-stone-200 hover:border-ocean-teal/50 rounded-2xl p-4 space-y-3 shadow-sm transition-all"
            >
              {/* Species Name & Trend Badge */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-ocean-teal flex items-center justify-center font-bold">
                    <Fish size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-800 text-base leading-tight">{item.fishType}</h4>
                    <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {item.location}
                    </span>
                  </div>
                </div>

                {/* Trend Badge */}
                <div className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 ${
                  item.trend === 'up' 
                    ? 'bg-rose-50 border-rose-300 text-rose-700' 
                    : item.trend === 'down' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                      : 'bg-stone-100 border-stone-300 text-stone-600'
                }`}>
                  {item.trend === 'up' && <TrendingUp size={14} />}
                  {item.trend === 'down' && <TrendingDown size={14} />}
                  {item.trend === 'stable' && <Minus size={14} />}
                  <span className="capitalize">{item.trend}</span>
                  {item.diff > 0 && <span className="text-[10px] opacity-80">(₹{item.diff})</span>}
                </div>
              </div>

              {/* Price Stats Grid */}
              <div className="grid grid-cols-3 gap-2 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center text-xs">
                <div>
                  <span className="text-[9px] font-extrabold text-stone-400 uppercase block">LATEST</span>
                  <span className="font-black text-stone-900 text-sm">₹{item.latestPrice}</span>
                  <span className="text-[9px] text-stone-400 font-bold block">/ kg</span>
                </div>
                <div className="border-x border-stone-200">
                  <span className="text-[9px] font-extrabold text-stone-400 uppercase block">AVERAGE</span>
                  <span className="font-black text-ocean-teal text-sm">₹{item.avgPrice}</span>
                  <span className="text-[9px] text-stone-400 font-bold block">/ kg</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-stone-400 uppercase block">RANGE</span>
                  <span className="font-bold text-stone-700 text-xs">₹{item.minPrice} - ₹{item.maxPrice}</span>
                  <span className="text-[9px] text-stone-400 font-bold block">/ kg</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
