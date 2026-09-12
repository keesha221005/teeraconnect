import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  LogOut, 
  FileWarning, 
  Trash2, 
  Users, 
  FileText, 
  CheckCircle2, 
  BarChart3, 
  ShoppingBag, 
  ShieldCheck, 
  Printer, 
  Plus, 
  Scale, 
  MapPin, 
  DollarSign, 
  AlertTriangle,
  Building2,
  Anchor
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminPanel({ 
  user = null, 
  onLogin, 
  onLogout, 
  onPostAlert, 
  catches = [], 
  prices = [],
  users = [],
  deals = [],
  onDeleteCatch, 
  onDeleteUser,
  onToggleVerify,
  onPostPrice,
  locations = [] 
}) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('9999999999'); // Admin default phone
  const [error, setError] = useState('');
  const [adminTab, setAdminTab] = useState('analytics'); // analytics, users, listings, prices, alerts

  // Alert Form State
  const [alertTitle, setAlertTitle] = useState('');
  const [alertBody, setAlertBody] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [alertRegion, setAlertRegion] = useState(locations[0] || '');
  const [alertExpiry, setAlertExpiry] = useState('24');
  const [alertSuccess, setAlertSuccess] = useState('');

  // Price Control Form State
  const [priceFishType, setPriceFishType] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [priceLocation, setPriceLocation] = useState(locations[0] || '');
  const [priceSuccess, setPriceSuccess] = useState('');

  // User Filter State
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // all, fisher, buyer

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setError('');
      onLogin(phone, '1234');
    } else {
      setError('Incorrect admin password. Use "admin123".');
    }
  };

  const handleAlertSubmit = async (e) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertBody.trim() || !alertRegion) {
      setAlertSuccess('Please complete all alert fields.');
      return;
    }

    const newAlert = {
      title: alertTitle,
      body: alertBody,
      severity: alertSeverity,
      region: alertRegion,
      expiryHours: parseInt(alertExpiry)
    };

    const ok = await onPostAlert(newAlert);
    if (ok) {
      setAlertSuccess('Safety advisory published successfully!');
      setAlertTitle('');
      setAlertBody('');
      setTimeout(() => setAlertSuccess(''), 4000);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    if (!priceFishType.trim() || !pricePerKg || parseFloat(pricePerKg) <= 0 || !priceLocation) {
      setPriceSuccess('Please fill valid species, price per kg, and location.');
      return;
    }

    const ok = await onPostPrice({
      fishType: priceFishType,
      pricePerKg: parseFloat(pricePerKg),
      location: priceLocation,
      postedBy: 'Co-op Admin'
    });

    if (ok) {
      setPriceSuccess(`Market rate for ${priceFishType} updated!`);
      setPriceFishType('');
      setPricePerKg('');
      setTimeout(() => setPriceSuccess(''), 4000);
    }
  };

  // Analytics Metrics Calculation
  const totalVolumeKg = catches.reduce((acc, c) => acc + (parseFloat(c.quantityKg) || 0), 0);
  const avgPrice = prices.length > 0 ? (prices.reduce((acc, p) => acc + (parseFloat(p.pricePerKg) || 0), 0) / prices.length) : 350;
  const estimatedMarketValue = Math.round(totalVolumeKg * avgPrice);
  const fisherCount = users.filter(u => u.role === 'fisher' || u.userType === 'fisher').length || 8;
  const buyerCount = users.filter(u => u.role === 'buyer' || u.userType === 'buyer').length || 4;

  const filteredUsers = users.filter(u => {
    if (userRoleFilter === 'fisher') return u.role === 'fisher' || u.userType === 'fisher';
    if (userRoleFilter === 'buyer') return u.role === 'buyer' || u.userType === 'buyer';
    return true;
  });

  // If not logged in as admin, show lock gate
  if (!user || user.role !== 'admin') {
    return (
      <div className="space-y-4 max-w-sm mx-auto py-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-stone-200 text-stone-700 rounded-full flex items-center justify-center mx-auto border-2 border-stone-300 shadow-inner">
            <Lock size={32} className="stroke-[2.5]" />
          </div>
          <h3 className="text-2xl font-black text-stone-800 tracking-tight">{t('adminTitle')}</h3>
          <p className="text-stone-500 font-bold text-xs">Gated administrator console. Enter password to manage portal.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="bg-white border-2 border-stone-300 rounded-3xl p-5 space-y-4 shadow-xl">
          {error && (
            <p className="text-xs text-ocean-red font-black bg-red-50 border border-red-200 p-2.5 rounded-xl">
              {error}
            </p>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-stone-600">Admin Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-stone-600">{t('adminPassword')}</label>
            <input
              type="password"
              placeholder="e.g. admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
              required
            />
          </div>

          <button type="submit" className="w-full btn-primary py-3.5 mt-2 shadow-md">
            {t('adminSubmit')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Admin Header Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 flex justify-between items-center shadow-lg border border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ocean-teal rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md">
            A
          </div>
          <div>
            <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest block">ADMINISTRATOR</span>
            <h3 className="text-md font-black tracking-tight">{user.name}</h3>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-stone-800 hover:bg-rose-900 border border-stone-700 text-stone-200 hover:text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <LogOut size={14} />
          {t('adminLogout')}
        </button>
      </div>

      {/* Admin Sub-tabs Navigation */}
      <div className="grid grid-cols-5 gap-1 bg-stone-200 p-1.5 rounded-2xl border border-stone-300 text-stone-700 text-[10px] font-extrabold">
        <button
          onClick={() => setAdminTab('analytics')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${adminTab === 'analytics' ? 'bg-white text-ocean-teal shadow-md' : 'hover:bg-stone-100'}`}
        >
          <BarChart3 size={16} />
          <span>Reports</span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${adminTab === 'users' ? 'bg-white text-ocean-teal shadow-md' : 'hover:bg-stone-100'}`}
        >
          <Users size={16} />
          <span>Users</span>
        </button>

        <button
          onClick={() => setAdminTab('listings')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${adminTab === 'listings' ? 'bg-white text-ocean-teal shadow-md' : 'hover:bg-stone-100'}`}
        >
          <FileText size={16} />
          <span>Catches</span>
        </button>

        <button
          onClick={() => setAdminTab('prices')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${adminTab === 'prices' ? 'bg-white text-ocean-teal shadow-md' : 'hover:bg-stone-100'}`}
        >
          <DollarSign size={16} />
          <span>Prices</span>
        </button>

        <button
          onClick={() => setAdminTab('alerts')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${adminTab === 'alerts' ? 'bg-white text-ocean-teal shadow-md' : 'hover:bg-stone-100'}`}
        >
          <FileWarning size={16} />
          <span>Alerts</span>
        </button>
      </div>

      {/* 1. ANALYTICS & PLATFORM REPORTS TAB */}
      {adminTab === 'analytics' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xl font-black text-stone-800 tracking-tight">Platform Overview</h4>
            <button
              onClick={() => window.print()}
              className="bg-white border-2 border-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-stone-50"
            >
              <Printer size={14} /> Print Summary
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border-2 border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400 uppercase">Registered Fishers</span>
                <Anchor size={18} className="text-ocean-teal" />
              </div>
              <div className="text-2xl font-black text-stone-800">{fisherCount}</div>
              <span className="text-[10px] font-bold text-emerald-600 block">Verified Marine Operators</span>
            </div>

            <div className="bg-white border-2 border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400 uppercase">Seafood Buyers</span>
                <ShoppingBag size={18} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-stone-800">{buyerCount}</div>
              <span className="text-[10px] font-bold text-amber-600 block">Wholesalers & Traders</span>
            </div>

            <div className="bg-white border-2 border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400 uppercase">Harvest Volume</span>
                <Scale size={18} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-stone-800">{totalVolumeKg.toLocaleString('en-IN')} kg</div>
              <span className="text-[10px] font-bold text-stone-400 block">Across 9 Coastal Harbors</span>
            </div>

            <div className="bg-white border-2 border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400 uppercase">Est. Value</span>
                <DollarSign size={18} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">₹{estimatedMarketValue.toLocaleString('en-IN')}</div>
              <span className="text-[10px] font-bold text-emerald-600 block">Active Market Turnover</span>
            </div>
          </div>

          {/* Platform Summary Report Card */}
          <div className="bg-white border-2 border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <h5 className="text-md font-extrabold text-stone-800 border-b pb-2 flex items-center justify-between">
              <span>System Activity Audit</span>
              <span className="text-xs font-bold text-stone-400">{new Date().toLocaleDateString('en-IN')}</span>
            </h5>

            <div className="space-y-2 text-xs font-semibold text-stone-600">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Active Fish Catch Listings</span>
                <span className="font-extrabold text-stone-800">{catches.length} items</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Buyer-Seller Purchase Deals</span>
                <span className="font-extrabold text-stone-800">{deals.length || 3} deals</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Harbor Market Rates Configured</span>
                <span className="font-extrabold text-stone-800">{prices.length} harbors</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Active Safety Advisories</span>
                <span className="font-extrabold text-emerald-700">All Harbors Monitored</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USER MANAGEMENT TAB */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xl font-black text-stone-800 tracking-tight">Account Management</h4>
            <div className="flex bg-stone-200 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg ${userRoleFilter === 'all' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setUserRoleFilter('fisher')}
                className={`px-2.5 py-1 rounded-lg ${userRoleFilter === 'fisher' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600'}`}
              >
                Fishers
              </button>
              <button
                onClick={() => setUserRoleFilter('buyer')}
                className={`px-2.5 py-1 rounded-lg ${userRoleFilter === 'buyer' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600'}`}
              >
                Buyers
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 border-2 border-stone-200 border-dashed rounded-2xl text-stone-400 font-bold text-xs">
                No registered accounts found under this role filter.
              </div>
            ) : (
              filteredUsers.map((usr) => (
                <div key={usr.id} className="bg-white border-2 border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                      usr.role === 'buyer' || usr.userType === 'buyer' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-teal-100 text-teal-800 border border-teal-300'
                    }`}>
                      {usr.role === 'buyer' || usr.userType === 'buyer' ? <Building2 size={20} /> : <Anchor size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-extrabold text-stone-800 truncate text-sm">{usr.name}</h5>
                        {usr.isVerified !== false && <ShieldCheck size={14} className="text-ocean-teal flex-shrink-0" title="Verified Account" />}
                      </div>
                      <span className="text-xs font-semibold text-stone-500 block truncate">
                        {usr.phone} | {usr.companyName || usr.boatType || usr.harbor || 'Fisher Community'}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded mt-1 inline-block ${
                        usr.role === 'buyer' || usr.userType === 'buyer' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      }`}>
                        {usr.role === 'buyer' || usr.userType === 'buyer' ? 'Seafood Buyer' : 'Fisherman Operator'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onToggleVerify && onToggleVerify(usr.id, !(usr.isVerified !== false))}
                      className={`p-2 border rounded-xl font-extrabold text-[10px] transition-all flex items-center gap-1 ${
                        usr.isVerified !== false 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-emerald-50'
                      }`}
                      title="Toggle Account Verification"
                    >
                      <ShieldCheck size={14} />
                      {usr.isVerified !== false ? 'Verified' : 'Verify'}
                    </button>
                    <button
                      onClick={() => onDeleteUser && onDeleteUser(usr.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 border border-stone-200 hover:border-rose-300 rounded-xl hover:bg-rose-50 transition-all flex-shrink-0"
                      title="Remove Account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. LISTINGS MODERATION TAB */}
      {adminTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xl font-black text-stone-800 tracking-tight">{t('moderateCatches')}</h4>
            <span className="text-xs font-bold text-stone-500">{catches.length} Active Listings</span>
          </div>

          <div className="space-y-3">
            {catches.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 border-2 border-stone-200 border-dashed rounded-2xl text-stone-400 font-bold text-xs">
                No active catch listings requiring moderation.
              </div>
            ) : (
              catches.map((item) => (
                <div key={item.id} className="bg-white border-2 border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-stone-800 text-sm truncate">{item.fishType}</h5>
                      <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{item.quantityKg} kg</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-stone-500">
                      <MapPin size={12} />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 mt-1 block">Posted by {item.user?.name || 'Fisherman'}</span>
                  </div>

                  <button
                    onClick={() => onDeleteCatch(item.id)}
                    className="p-2.5 text-stone-400 hover:text-rose-600 border border-stone-200 hover:border-rose-300 rounded-xl hover:bg-rose-50 transition-all flex-shrink-0"
                    title="Delete Listing"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. MARKET PRICE CONTROL TAB */}
      {adminTab === 'prices' && (
        <div className="space-y-4">
          <h4 className="text-xl font-black text-stone-800 tracking-tight px-1">Market Price Control</h4>

          <form onSubmit={handlePriceSubmit} className="bg-white border-2 border-stone-300 rounded-2xl p-5 space-y-4 shadow-sm">
            <h5 className="text-md font-extrabold text-stone-800 flex items-center gap-1.5 border-b pb-2">
              <DollarSign size={20} className="text-ocean-teal" /> Update Daily Harbor Price
            </h5>

            {priceSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {priceSuccess}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-stone-600">Fish Species Name</label>
              <input
                type="text"
                placeholder="e.g. Mackerel, Pomfret, Kingfish"
                value={priceFishType}
                onChange={(e) => setPriceFishType(e.target.value)}
                className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-600">Rate per kg (₹)</label>
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
                <label className="text-xs font-bold text-stone-600">Harbor Location</label>
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
              Broadcast Market Rate
            </button>
          </form>
        </div>
      )}

      {/* 5. WEATHER ADVISORIES TAB */}
      {adminTab === 'alerts' && (
        <div className="space-y-4">
          <h4 className="text-xl font-black text-stone-800 tracking-tight px-1">{t('postAlertTitle')}</h4>

          <form onSubmit={handleAlertSubmit} className="bg-white border-2 border-stone-300 rounded-2xl p-5 space-y-4 shadow-sm">
            {alertSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {alertSuccess}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-stone-600">{t('alertTitle')}</label>
              <input
                type="text"
                placeholder="e.g. Cyclone Warning - High Wave Swells"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-stone-600">{t('alertBody')}</label>
              <textarea
                placeholder="Detailed instructions, wind speeds, wave heights, suspended harbor operations..."
                value={alertBody}
                onChange={(e) => setAlertBody(e.target.value)}
                rows={3}
                className="bg-stone-50 border-2 border-stone-200 rounded-xl p-3 text-sm font-semibold text-stone-800 focus:border-ocean-teal"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-600">{t('alertSeverity')}</label>
                <select
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value)}
                  className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                  required
                >
                  <option value="info">Info (Blue Banner)</option>
                  <option value="warning">Warning (Yellow Banner)</option>
                  <option value="danger">Danger (Red Alert Banner)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-600">{t('location')}</label>
                <select
                  value={alertRegion}
                  onChange={(e) => setAlertRegion(e.target.value)}
                  className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                  required
                >
                  {locations.map((loc, i) => (
                    <option key={i} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-stone-600">{t('alertExpiry')}</label>
              <select
                value={alertExpiry}
                onChange={(e) => setAlertExpiry(e.target.value)}
                className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
                required
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (1 Day)</option>
                <option value="48">48 Hours (2 Days)</option>
                <option value="72">72 Hours (3 Days)</option>
              </select>
            </div>

            <button type="submit" className="w-full btn-primary py-3.5 shadow-md">
              Broadcast Emergency Advisory
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
