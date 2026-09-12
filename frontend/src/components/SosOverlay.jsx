import React, { useState, useEffect } from 'react';
import { Phone, Share2, MapPin, AlertOctagon, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SosOverlay({ activeLocationName, contacts = {} }) {
  const { t } = useLanguage();
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setError(t('gpsError'));
      return;
    }

    setFetching(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        });
        setFetching(false);
      },
      (err) => {
        console.error('GPS error:', err);
        setError(t('gpsError'));
        setFetching(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto fetch coordinates on mount for speed in emergencies
  useEffect(() => {
    getGeolocation();
  }, []);

  const shareText = coords 
    ? `SOS! Emergency at sea! Location Coordinates: Lat ${coords.lat}, Lng ${coords.lng}. Map link: https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : `SOS! Emergency at sea near ${activeLocationName}! GPS coordinates unavailable. Please contact rescue team.`;

  const handleWhatsappShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleSmsShare = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    window.open(url, '_self');
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-ocean-red tracking-tight flex items-center justify-center gap-2">
          <AlertOctagon className="animate-pulse" size={28} />
          {t('sosTitle')}
        </h3>
        <p className="text-stone-600 font-semibold max-w-xs mx-auto leading-normal">
          {t('sosInstructions')}
        </p>
      </div>

      {/* Pulsing SOS Button */}
      <div className="flex justify-center py-4">
        <button
          onClick={getGeolocation}
          className="w-48 h-48 rounded-full bg-ocean-red text-white flex flex-col items-center justify-center border-8 border-rose-200 shadow-xl active:scale-95 hover:bg-red-600 transition-all focus:ring-4 focus:ring-rose-300"
        >
          <span className="text-4xl font-black tracking-widest animate-pulse">SOS</span>
          <span className="text-xs font-bold uppercase tracking-wider mt-1 opacity-75">Tap to Refresh GPS</span>
        </button>
      </div>

      {/* GPS Coordinate Display */}
      <div className="ocean-card border-3 border-rose-300 bg-rose-50/30">
        <div className="flex items-center gap-2 border-b pb-2 mb-3 border-stone-200 font-extrabold text-stone-800">
          <MapPin size={20} className="text-ocean-red" />
          <h4>{t('coordinates')}</h4>
        </div>
        
        {fetching && (
          <div className="text-center py-3 text-stone-600 font-bold animate-pulse">
            {t('fetchingCoords')}
          </div>
        )}

        {error && (
          <div className="text-center py-3 text-ocean-red font-bold text-sm">
            {error}
          </div>
        )}

        {coords && !fetching && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-inner">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Latitude</span>
              <span className="text-lg font-black text-stone-800">{coords.lat}</span>
            </div>
            <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-inner">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Longitude</span>
              <span className="text-lg font-black text-stone-800">{coords.lng}</span>
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleWhatsappShare}
            className="bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all text-md shadow-sm"
          >
            <Share2 size={18} />
            WhatsApp
          </button>
          <button
            onClick={handleSmsShare}
            className="bg-stone-100 text-stone-800 border-2 border-stone-300 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 active:scale-95 transition-all text-md shadow-sm"
          >
            <Share2 size={18} />
            SMS Alert
          </button>
        </div>
      </div>

      {/* Emergency Contacts List */}
      <div className="ocean-card space-y-3">
        <h4 className="font-extrabold text-stone-800 tracking-tight text-lg border-b pb-2 flex items-center gap-1.5">
          <Phone size={18} className="text-ocean-teal" />
          {t('emergencyContacts')}
        </h4>
        
        <div className="space-y-3">
          <a 
            href="tel:1554" 
            className="flex justify-between items-center bg-stone-50 border border-stone-200 p-3 rounded-xl hover:bg-stone-100 active:scale-[0.99] transition-all"
          >
            <div>
              <span className="text-[10px] font-extrabold text-ocean-red uppercase block">Coast Guard (Toll-Free)</span>
              <span className="text-md font-extrabold text-stone-800">1554</span>
            </div>
            <span className="bg-rose-100 text-ocean-red p-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center gap-1">
              <Phone size={14} /> Call
            </span>
          </a>

          <a 
            href="tel:1093" 
            className="flex justify-between items-center bg-stone-50 border border-stone-200 p-3 rounded-xl hover:bg-stone-100 active:scale-[0.99] transition-all"
          >
            <div>
              <span className="text-[10px] font-extrabold text-ocean-teal uppercase block">Marine Police (Toll-Free)</span>
              <span className="text-md font-extrabold text-stone-800">1093</span>
            </div>
            <span className="bg-stone-200 text-stone-800 p-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center gap-1">
              <Phone size={14} /> Call
            </span>
          </a>

          {contacts.portOfficer && (
            <a 
              href={`tel:${contacts.portOfficer.replace(/[^0-9]/g, '')}`} 
              className="flex justify-between items-center bg-stone-50 border border-stone-200 p-3 rounded-xl hover:bg-stone-100 active:scale-[0.99] transition-all"
            >
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Port Authority ({activeLocationName.split(',')[0]})</span>
                <span className="text-md font-extrabold text-stone-800">{contacts.portOfficer}</span>
              </div>
              <span className="bg-stone-200 text-stone-800 p-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center gap-1">
                <Phone size={14} /> Call
              </span>
            </a>
          )}

          {contacts.coopLeader && (
            <a 
              href={`tel:${contacts.coopLeader.replace(/[^0-9+]/g, '')}`} 
              className="flex justify-between items-center bg-stone-50 border border-stone-200 p-3 rounded-xl hover:bg-stone-100 active:scale-[0.99] transition-all"
            >
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Co-op Leader</span>
                <span className="text-md font-extrabold text-stone-800">{contacts.coopLeader.split('(')[0].trim()}</span>
                <span className="text-xs text-stone-400 font-bold block">{contacts.coopLeader.includes('(') ? contacts.coopLeader.substring(contacts.coopLeader.indexOf('(')) : ''}</span>
              </div>
              <span className="bg-stone-200 text-stone-800 p-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center gap-1">
                <Phone size={14} /> Call
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
