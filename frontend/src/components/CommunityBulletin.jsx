import React, { useState, useEffect } from 'react';
import { Fish, MapPin, Scale, Plus, Landmark, Trash2, Shield, Search, Camera, CheckCircle2, Image as ImageIcon, TrendingUp, User, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PriceTrendsView from './PriceTrendsView';

export default function CommunityBulletin({ 
  catches = [], 
  prices = [], 
  onPostCatch, 
  onPostPrice, 
  onDeleteCatch,
  onViewFisherProfile,
  onRequestDeal,
  user = null, 
  locations = [],
  selectedLocation = '',
  loading = false
}) {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('catches'); // 'catches', 'prices', or 'trends'
  const [showCatchForm, setShowCatchForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Catch Form Fields
  const [catchFishType, setCatchFishType] = useState('');
  const [catchQuantity, setCatchQuantity] = useState('');
  const [catchLocation, setCatchLocation] = useState(selectedLocation || locations[0] || '');
  const [catchImage, setCatchImage] = useState(null);
  const [catchError, setCatchError] = useState('');

  // Price Form Fields
  const [priceFishType, setPriceFishType] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [priceLocation, setPriceLocation] = useState(selectedLocation || locations[0] || '');
  const [priceError, setPriceError] = useState('');

  // Keep location default in sync with currently active harbor selection
  useEffect(() => {
    if (selectedLocation) {
      setCatchLocation(selectedLocation);
      setPriceLocation(selectedLocation);
    }
  }, [selectedLocation]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Convert uploaded image to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setCatchError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatchImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Catch
  const handleCatchSubmit = async (e) => {
    e.preventDefault();
    if (!catchFishType.trim() || !catchQuantity || parseFloat(catchQuantity) <= 0 || !catchLocation) {
      setCatchError('Please enter valid fish type, quantity, and location.');
      return;
    }
    setCatchError('');
    const success = await onPostCatch({
      fishType: catchFishType,
      quantityKg: parseFloat(catchQuantity),
      location: catchLocation,
      imageUrl: catchImage
    });

    if (success !== false) {
      triggerToast(`Catch report for "${catchFishType}" posted successfully!`);
      setCatchFishType('');
      setCatchQuantity('');
      setCatchImage(null);
      setShowCatchForm(false);
    }
  };

  // Submit Price
  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    if (!priceFishType.trim() || !pricePerKg || parseFloat(pricePerKg) <= 0 || !priceLocation) {
      setPriceError('Please enter valid fish type, price per kg, and location.');
      return;
    }
    setPriceError('');
    const success = await onPostPrice({
      fishType: priceFishType,
      pricePerKg: parseFloat(pricePerKg),
      location: priceLocation,
      postedBy: user ? user.name : 'Fisher'
    });

    if (success !== false) {
      triggerToast(`Market price for "${priceFishType}" updated successfully!`);
      setPriceFishType('');
      setPricePerKg('');
      setShowPriceForm(false);
    }
  };

  // Search filtering
  const filteredCatches = catches.filter(item => 
    item.fishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrices = prices.filter(item => 
    item.fishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-bold animate-bounce">
          <CheckCircle2 size={20} className="flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search species (e.g. Mackerel, Pomfret, Sardine)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:border-ocean-teal focus:outline-none shadow-sm"
        />
      </div>

      {/* Sub-tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-stone-200 p-1.5 rounded-2xl border border-stone-300">
        <button
          onClick={() => setActiveSubTab('catches')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'catches' ? 'bg-white text-ocean-teal shadow-md' : 'text-stone-600'}`}
        >
          <Fish size={15} />
          Catches ({filteredCatches.length})
        </button>
        <button
          onClick={() => setActiveSubTab('prices')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'prices' ? 'bg-white text-ocean-teal shadow-md' : 'text-stone-600'}`}
        >
          <Landmark size={15} />
          Prices ({filteredPrices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('trends')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'trends' ? 'bg-white text-ocean-teal shadow-md' : 'text-stone-600'}`}
        >
          <TrendingUp size={15} />
          Trends
        </button>
      </div>

      {/* 1. CATCH REPORTS SECTION */}
      {activeSubTab === 'catches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="text-xl font-bold text-stone-800 tracking-tight">{t('catchReports')}</h3>
              <span className="text-xs font-semibold text-stone-500">Showing for {selectedLocation || 'Selected Location'}</span>
            </div>
            {user && user.role !== 'buyer' && user.userType !== 'buyer' && (
              <button
                onClick={() => {
                  setCatchLocation(selectedLocation || locations[0] || '');
                  setShowCatchForm(!showCatchForm);
                }}
                className="bg-ocean-teal text-white py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus size={16} />
                {t('postCatch')}
              </button>
            )}
          </div>

          {/* Catch Report Form */}
          {showCatchForm && (
            <form onSubmit={handleCatchSubmit} className="bg-white border-2 border-stone-300 rounded-2xl p-4 space-y-4 shadow-md">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-stone-800">{t('postCatch')}</h4>
                <span className="text-xs font-bold text-ocean-teal bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                  {user ? user.name : 'Fisherman'}
                </span>
              </div>
              
              {catchError && <p className="text-sm text-ocean-red font-bold">{catchError}</p>}
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-stone-600">{t('fishType')}</label>
                <input
                  type="text"
                  placeholder="e.g., Mackerel, Sardine, Pomfret"
                  value={catchFishType}
                  onChange={(e) => setCatchFishType(e.target.value)}
                  className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-stone-600">{t('quantity')} (kg)</label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="Weight in kg"
                    value={catchQuantity}
                    onChange={(e) => setCatchQuantity(e.target.value)}
                    className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-stone-600">{t('location')}</label>
                  <select
                    value={catchLocation}
                    onChange={(e) => setCatchLocation(e.target.value)}
                    className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                    required
                  >
                    {locations.map((loc, i) => (
                      <option key={i} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload Option */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-stone-600 flex items-center gap-1">
                  <Camera size={16} /> Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs font-semibold text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                />
                {catchImage && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-stone-300 max-h-32">
                    <img src={catchImage} alt="Catch Preview" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setCatchImage(null)}
                      className="absolute top-1 right-1 bg-stone-900/70 text-white rounded-full p-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                {t('postBtn')}
              </button>
            </form>
          )}

          {/* Catches List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-stone-500 font-semibold">{t('loading')}</div>
                ) : filteredCatches.length === 0 ? (
                <div className="text-center py-10 px-4 bg-stone-50 border-2 border-stone-200 border-dashed rounded-2xl text-stone-500 font-semibold">
                No catch reports found for {selectedLocation || 'this location'}.<br />
               {user && user.role !== 'buyer' && user.userType !== 'buyer' && (
               <span className="text-xs font-bold text-stone-400 mt-1 block">Tap 'Report Catch' above to share your daily haul!</span>
               )}
                 </div>    
            ) : (
              filteredCatches.map((item) => (
                <div key={item.id} className="ocean-card border-2 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-stone-100 text-ocean-teal rounded-2xl flex-shrink-0 border border-stone-200">
                      <Fish size={28} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-lg font-bold text-stone-800 truncate">{item.fishType}</h4>
                        {user && user.role === 'admin' && (
                          <button
                            onClick={() => onDeleteCatch(item.id)}
                            className="text-stone-400 hover:text-ocean-red p-1 rounded-lg"
                            title={t('deleteBtn')}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-stone-600 text-sm font-semibold">
                        <div className="flex items-center gap-1">
                          <Scale size={14} className="text-stone-500" />
                          <span>{item.quantityKg} kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-stone-500" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Catch Photo if uploaded */}
                  {item.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-stone-200 max-h-48">
                      <img src={item.imageUrl} alt={item.fishType} className="w-full h-44 object-cover" />
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-stone-100 pt-2 text-xs font-bold text-stone-400">
                    <button
                      onClick={() => onViewFisherProfile && onViewFisherProfile(item.user || { name: item.user?.name || 'Fisherman', location: item.location })}
                      className="text-ocean-teal hover:underline flex items-center gap-1 font-bold text-xs"
                    >
                      <User size={14} />
                      {item.user?.name || 'Fisherman'}
                    </button>

                    <div className="flex items-center gap-2">
                      {onRequestDeal && (
                        <button
                          onClick={() => onRequestDeal(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1 rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1"
                        >
                          <ShoppingBag size={12} />
                          Offer Deal
                        </button>
                      )}
                      <span className="text-[10px] text-stone-400">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MARKET PRICES SECTION */}
      {activeSubTab === 'prices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="text-xl font-bold text-stone-800 tracking-tight">{t('priceTrend')}</h3>
              <span className="text-xs font-semibold text-stone-500">Showing for {selectedLocation || 'Selected Location'}</span>
            </div>
            {user && (
              <button
                onClick={() => {
                  setPriceLocation(selectedLocation || locations[0] || '');
                  setShowPriceForm(!showPriceForm);
                }}
                className="bg-ocean-teal text-white py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus size={16} />
                {t('postPrice')}
              </button>
            )}
          </div>

          {/* Price Update Form */}
          {showPriceForm && (
            <form onSubmit={handlePriceSubmit} className="bg-white border-2 border-stone-300 rounded-2xl p-4 space-y-4 shadow-md">
              <h4 className="text-lg font-bold text-stone-800">{t('postPrice')}</h4>
              
              {priceError && <p className="text-sm text-ocean-red font-bold">{priceError}</p>}
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-stone-600">{t('fishType')}</label>
                <input
                  type="text"
                  placeholder="e.g., Mackerel, Sardine, Pomfret"
                  value={priceFishType}
                  onChange={(e) => setPriceFishType(e.target.value)}
                  className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-stone-600">{t('pricePerKg')} (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="₹ per kg"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-stone-600">{t('location')}</label>
                  <select
                    value={priceLocation}
                    onChange={(e) => setPriceLocation(e.target.value)}
                    className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                    required
                  >
                    {locations.map((loc, i) => (
                      <option key={i} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                {t('postBtn')}
              </button>
            </form>
          )}

          {/* Prices Grid */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-stone-500 font-semibold">{t('loading')}</div>
            ) : filteredPrices.length === 0 ? (
              <div className="text-center py-10 px-4 bg-stone-50 border-2 border-stone-200 border-dashed rounded-2xl text-stone-500 font-semibold">
                No market prices found for {selectedLocation || 'this location'}.<br />
                <span className="text-xs font-bold text-stone-400 mt-1 block">Tap 'Update Price' above to share market rates!</span>
              </div>
            ) : (
              filteredPrices.map((item) => (
                <div key={item.id} className="ocean-card flex items-center justify-between border-2">
                  <div className="min-w-0">
                    <h4 className="text-lg font-extrabold text-stone-800 truncate">{item.fishType}</h4>
                    <div className="flex items-center gap-1 mt-1 text-stone-500 text-sm font-bold">
                      <MapPin size={14} />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-2xl font-black text-ocean-teal">₹{item.pricePerKg}<span className="text-xs font-bold text-stone-500">/kg</span></div>
                    <div className="text-[10px] font-bold text-stone-400 mt-0.5 flex items-center justify-end gap-0.5">
                      {item.postedBy === 'Co-op Admin' && <Shield size={10} className="text-ocean-teal" />}
                      <span>{item.postedBy}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. PRICE TRENDS SECTION */}
      {activeSubTab === 'trends' && (
        <PriceTrendsView prices={prices} selectedLocation={selectedLocation} />
      )}
    </div>
  );
}
