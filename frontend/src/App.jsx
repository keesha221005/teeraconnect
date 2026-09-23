import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import SafetyBanner from './components/SafetyBanner';
import WeatherSummary from './components/WeatherSummary';
import ForecastStrip from './components/ForecastStrip';
import MapView from './components/MapView';
import CommunityBulletin from './components/CommunityBulletin';
import SosOverlay from './components/SosOverlay';
import AdminPanel from './components/AdminPanel';
import FisherProfileModal from './components/FisherProfileModal';
import BuyerDealModal from './components/BuyerDealModal';
import DealsInbox from './components/DealsInbox';
import {
  Home as HomeIcon,
  Calendar,
  Map as MapIcon,
  MessageSquare,
  PhoneCall,
  User as UserIcon,
  RefreshCw,
  Languages,
  LogIn,
  LogOut,
  AlertTriangle,
  ShoppingBag,
  Anchor,
  Building2,
  ShieldCheck
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultLocations = [
  'Veraval Harbor',
  'Sassoon Dock, Mumbai',
  'Panaji Harbor',
  'Mangalore Harbor',
  'Kochi Harbor',
  'Royapuram Harbor, Chennai',
  'Visakhapatnam Harbor',
  'Paradeep Harbor',
  'Digha Harbor'
];

const locationCoordinates = {
  'Veraval Harbor': { lat: 20.9018, lng: 70.3683 },
  'Sassoon Dock, Mumbai': { lat: 18.9103, lng: 72.8182 },
  'Panaji Harbor': { lat: 15.5002, lng: 73.8242 },
  'Mangalore Harbor': { lat: 12.8732, lng: 74.8340 },
  'Kochi Harbor': { lat: 9.9674, lng: 76.2427 },
  'Royapuram Harbor, Chennai': { lat: 13.1114, lng: 80.2974 },
  'Visakhapatnam Harbor': { lat: 17.6896, lng: 83.2986 },
  'Paradeep Harbor': { lat: 20.2608, lng: 86.6669 },
  'Digha Harbor': { lat: 21.6244, lng: 87.5098 }
};

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home'); // home, forecast, map, community, deals, sos, admin
  const [selectedLocation, setSelectedLocation] = useState('Mangalore Harbor');
  const [loading, setLoading] = useState(false);

  // API States
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [zones, setZones] = useState([]);
  const [catches, setCatches] = useState([]);
  const [prices, setPrices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [contacts, setContacts] = useState({});
  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals state
  const [selectedFisher, setSelectedFisher] = useState(null);
  const [selectedDealCatch, setSelectedDealCatch] = useState(null);

  // Auth States
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [regRole, setRegRole] = useState('fisher'); // 'fisher', 'buyer', 'admin'
  const [regBoatType, setRegBoatType] = useState('Mechanized Trawler');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regHarbor, setRegHarbor] = useState('Mangalore Harbor');
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Hydrate user from localStorage
  useEffect(() => {
    const cachedUser = localStorage.getItem('teeraconnect_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
  }, []);

  // Fetch with timeout helper to prevent long loading screens when backend/DB hangs
  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 2000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  // Primary data-fetching orchestrator
  const fetchData = async (locName) => {
    setLoading(true);
    try {
      // 1. Weather
      const weatherRes = await fetchWithTimeout(`${API_BASE}/weather/current?location=${encodeURIComponent(locName)}`);
      if (!weatherRes.ok) throw new Error("Weather request failed");
      const wData = await weatherRes.json();
      setWeather(wData);

      // 2. Forecast
      const forecastRes = await fetchWithTimeout(`${API_BASE}/weather/forecast?location=${encodeURIComponent(locName)}`);
      if (!forecastRes.ok) throw new Error("Forecast request failed");
      const fData = await forecastRes.json();
      setForecast(fData);

      // 3. Contacts
      const contactsRes = await fetchWithTimeout(`${API_BASE}/emergency-contacts?location=${encodeURIComponent(locName)}`);
      if (!contactsRes.ok) throw new Error("Contacts request failed");
      const cData = await contactsRes.json();
      setContacts(cData);

      // 4. Global static feeds (alerts, pricing, zones, catches, deals, users)
      const alertsRes = await fetchWithTimeout(`${API_BASE}/alerts`);
      if (!alertsRes.ok) throw new Error("Alerts request failed");
      const aData = await alertsRes.json();
      setAlerts(aData);

      const zonesRes = await fetchWithTimeout(`${API_BASE}/fishing-zones`);
      if (!zonesRes.ok) throw new Error("Zones request failed");
      const zData = await zonesRes.json();
      setZones(zData);

      const catchesRes = await fetchWithTimeout(`${API_BASE}/catch-reports`);
      if (!catchesRes.ok) throw new Error("Catches request failed");
      const cLogs = await catchesRes.json();
      setCatches(cLogs);

      const pricesRes = await fetchWithTimeout(`${API_BASE}/market-prices`);
      if (!pricesRes.ok) throw new Error("Prices request failed");
      const pLogs = await pricesRes.json();
      setPrices(pLogs);

      const dealsRes = await fetchWithTimeout(`${API_BASE}/deals`);
      if (dealsRes.ok) {
        const dLogs = await dealsRes.json();
        setDeals(dLogs);
      }

      const usersRes = await fetchWithTimeout(`${API_BASE}/users`);
      if (usersRes.ok) {
        const uLogs = await usersRes.json();
        setUsers(uLogs);
      }

    } catch (err) {
      console.warn("Backend unavailable or DB offline. Initializing self-contained offline mock states...", err.message);
      initializeMockStates(locName);
    } finally {
      setLoading(false);
    }
  };

  // Highly robust frontend mock fallbacks if backend server isn't running
  const initializeMockStates = (locName) => {
    const seed = locName.charCodeAt(0) + locName.charCodeAt(locName.length - 1);
    const mockWind = 8 + (seed % 14);
    const mockWave = parseFloat((0.6 + ((seed % 10) / 10)).toFixed(1));
    const isStormy = locName.includes('Chennai') || locName.includes('Visakhapatnam') || locName.includes('Paradeep');

    setWeather({
      location: locName,
      isSimulated: true,
      temp: isStormy ? 25 : 29,
      tempMin: isStormy ? 23 : 26,
      tempMax: isStormy ? 27 : 32,
      windSpeedKnots: isStormy ? 28 : mockWind,
      windDirection: isStormy ? 90 : 210,
      humidity: isStormy ? 95 : 78,
      rainChance: isStormy ? 90 : 20,
      weatherCondition: isStormy ? 'Stormy' : 'Partly Cloudy',
      waveHeightMeters: isStormy ? 3.4 : mockWave,
      tideTimes: [
        { type: 'High', time: '08:45 AM', height: '1.6m' },
        { type: 'Low', time: '02:30 PM', height: '0.4m' },
        { type: 'High', time: '09:15 PM', height: '1.8m' }
      ],
      safetyStatus: isStormy ? 'danger' : mockWind > 20 || mockWave > 2.0 ? 'caution' : 'safe',
      safetyMessage: isStormy
        ? 'DANGER: Cyclone advisory active. DO NOT venture into sea.'
        : mockWind > 20 || mockWave > 2.0
          ? 'CAUTION: Choppy sea and high wave swells.'
          : 'Safe to go out. Clear skies and mild waves.',
      lastUpdated: new Date().toISOString()
    });

    // Mock Forecast
    const mockForecastList = [];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const baseDay = new Date();
    for (let i = 0; i < 7; i++) {
      const fDay = new Date();
      fDay.setDate(baseDay.getDate() + i);
      const daySeed = seed + i;
      mockForecastList.push({
        day: i === 0 ? 'Today' : weekdays[fDay.getDay()],
        date: fDay.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        tempMin: isStormy && i < 2 ? 23 : 26,
        tempMax: isStormy && i < 2 ? 27 : 31,
        windSpeedKnots: isStormy && i < 2 ? 26 : 10 + (daySeed % 8),
        waveHeightMeters: isStormy && i < 2 ? 3.0 : parseFloat((0.6 + (daySeed % 6) / 5).toFixed(1)),
        rainChance: isStormy && i < 2 ? 90 : (daySeed % 5) * 15,
        condition: isStormy && i < 2 ? 'Stormy' : (daySeed % 5) > 3 ? 'Rainy' : 'Sunny'
      });
    }
    setForecast({ location: locName, forecast: mockForecastList });

    // Mock Zones
    setZones([
      { id: '1', name: 'Mangalore Outer Reef', lat: 12.82, lng: 74.78, status: 'safe', notes: 'Excellent visibility. High catch concentration.' },
      { id: '2', name: 'Royapuram Deep Reef', lat: 13.15, lng: 80.35, status: 'danger', notes: 'Storm swell. Wave height > 3m. DO NOT VENTURE OUT.' },
      { id: '3', name: 'Vizag Outer Harbour', lat: 17.65, lng: 83.35, status: 'safe', notes: 'Good wind alignment. Moderate wave height.' },
      { id: '4', name: 'Sassoon Dock Outer', lat: 18.88, lng: 72.78, status: 'safe', notes: 'Active zone, clear weather. Pomfret sightings reported.' }
    ]);

    // Mock Alerts
    setAlerts([
      {
        id: '1',
        title: 'High Wave Advisory',
        body: 'Swell waves of 2.0 to 2.8 meters expected along the southern coast. Mechanized boat operators to monitor condition.',
        severity: 'warning',
        region: 'Kochi Harbor',
        postedBy: 'Co-op Admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Cyclone Warning - Deep Depression',
        body: 'Heavy rainfall and winds up to 45 knots expected. Fishing operations completely suspended for Royapuram (Chennai) & Visakhapatnam.',
        severity: 'danger',
        region: 'Royapuram Harbor, Chennai',
        postedBy: 'Fisheries Department',
        createdAt: new Date().toISOString()
      }
    ]);

    // Mock Contacts
    setContacts({
      location: locName,
      portOfficer: '0824-240 7341',
      coastGuard: '0824-240 8554 (Mangalore HQ)',
      marinePolice: '1093',
      coopLeader: 'Mohammad Ansar (+91 99001 22334)'
    });

    // Mock prices across all harbors
    setPrices([
      { id: 'p1', fishType: 'Mackerel (Bangda)', pricePerKg: 180, location: 'Mangalore Harbor', postedBy: 'Co-op Admin' },
      { id: 'p2', fishType: 'Kingfish (Surmai)', pricePerKg: 550, location: 'Mangalore Harbor', postedBy: 'Co-op Admin' },
      { id: 'p3', fishType: 'Sardine (Tarli)', pricePerKg: 120, location: 'Mangalore Harbor', postedBy: 'Co-op Admin' },
      { id: 'p4', fishType: 'Mackerel (Bangda)', pricePerKg: 200, location: 'Sassoon Dock, Mumbai', postedBy: 'Co-op Admin' },
      { id: 'p5', fishType: 'Pomfret (White)', pricePerKg: 650, location: 'Sassoon Dock, Mumbai', postedBy: 'Co-op Admin' },
      { id: 'p6', fishType: 'Pomfret (White)', pricePerKg: 600, location: 'Panaji Harbor', postedBy: 'Co-op Admin' },
      { id: 'p7', fishType: 'Kingfish (Surmai)', pricePerKg: 520, location: 'Panaji Harbor', postedBy: 'Co-op Admin' },
      { id: 'p8', fishType: 'Prawns (Medium)', pricePerKg: 380, location: 'Veraval Harbor', postedBy: 'Co-op Admin' },
      { id: 'p9', fishType: 'Lobster (Rock)', pricePerKg: 1200, location: 'Veraval Harbor', postedBy: 'Co-op Admin' }
    ]);

    // Mock catches
    setCatches([
      { id: 'c1', fishType: 'Prawns (Medium)', quantityKg: 85, location: 'Veraval Harbor', user: { name: 'Bhavesh Patel', phone: '9876543211', boatType: 'Trawler', harbor: 'Veraval Harbor', isVerified: true }, createdAt: new Date().toISOString() },
      { id: 'c2', fishType: 'Pomfret (White)', quantityKg: 30, location: 'Sassoon Dock, Mumbai', user: { name: 'Devendra Tandel', phone: '9876543212', boatType: 'Gillnetter', harbor: 'Sassoon Dock', isVerified: true }, createdAt: new Date().toISOString() },
      { id: 'c3', fishType: 'Mackerel (Bangda)', quantityKg: 75, location: 'Panaji Harbor', user: { name: 'Francis D\'Souza', phone: '9876543213', boatType: 'Country Boat', harbor: 'Panaji Harbor', isVerified: true }, createdAt: new Date().toISOString() },
      { id: 'c4', fishType: 'Mackerel (Bangda)', quantityKg: 120, location: 'Mangalore Harbor', user: { name: 'Ramesh Gowda', phone: '9876543210', boatType: 'Mechanized Trawler', harbor: 'Mangalore Harbor', isVerified: true }, createdAt: new Date().toISOString() },
      { id: 'c5', fishType: 'Kingfish (Surmai)', quantityKg: 45, location: 'Mangalore Harbor', user: { name: 'Ramesh Gowda', phone: '9876543210', boatType: 'Mechanized Trawler', harbor: 'Mangalore Harbor', isVerified: true }, createdAt: new Date().toISOString() }
    ]);

    // Mock users
    setUsers([
      { id: 'u1', name: 'Ramesh Gowda', phone: '9876543210', role: 'fisher', userType: 'fisher', boatType: 'Mechanized Trawler', harbor: 'Mangalore Harbor', isVerified: true },
      { id: 'u2', name: 'Vikram Sethi', phone: '9888877777', role: 'buyer', userType: 'buyer', companyName: 'Konkan Seafood Exports', harbor: 'Sassoon Dock, Mumbai', isVerified: true },
      { id: 'u3', name: 'Co-op Admin', phone: '9999999999', role: 'admin', userType: 'admin', harbor: 'Mangalore Harbor', isVerified: true }
    ]);

    // Mock deals
    setDeals([
      {
        id: 'd1',
        catchReportId: 'c4',
        buyerId: 'u2',
        proposedPricePerKg: 190,
        requestedQtyKg: 100,
        status: 'pending',
        notes: 'Can pick up directly at Mangalore wharf tomorrow morning.',
        createdAt: new Date().toISOString(),
        buyer: { name: 'Vikram Sethi', phone: '9888877777', companyName: 'Konkan Seafood Exports' },
        catchReport: { fishType: 'Mackerel (Bangda)', quantityKg: 120, location: 'Mangalore Harbor', user: { name: 'Ramesh Gowda', phone: '9876543210' } }
      }
    ]);
  };

  useEffect(() => {
    fetchData(selectedLocation);
  }, [selectedLocation]);

  // Auth Operations
  // Auth Operations
  const resetAuthForm = () => {
    setPhone('');
    setName('');
    setPassword('');
    setAuthError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    if (!cleanPhone || !cleanName || !password) {
      setAuthError('Name, phone number, and password are required');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          password,
          name: cleanName,
          role: regRole,
          userType: regRole,
          boatType: regRole === 'fisher' ? regBoatType : null,
          companyName: regRole === 'buyer' ? regCompanyName : null,
          harbor: regRole === 'admin' ? null : regHarbor
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('teeraconnect_user', JSON.stringify(data.user));
        setShowLoginModal(false);
        resetAuthForm();
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || !password) {
      setAuthError('Phone number and password are required');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('teeraconnect_user', JSON.stringify(data.user));
        setShowLoginModal(false);
        resetAuthForm();
      } else {
        setAuthError(data.error || 'Invalid phone number or password');
      }
    } catch (err) {
      setAuthError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('teeraconnect_user');
  };

  // Add Catch Report
  const handlePostCatch = async (newCatch) => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    let createdReport = null;
    try {
      const res = await fetch(`${API_BASE}/catch-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...newCatch })
      });
      if (res.ok) {
        createdReport = await res.json();
      }
    } catch (err) {
      console.warn('Backend API request failed, creating offline report:', err.message);
    }

    if (!createdReport) {
      createdReport = {
        id: 'catch-' + Date.now(),
        ...newCatch,
        user: { name: user.name || 'Fisherman', phone: user.phone, boatType: user.boatType, harbor: user.harbor },
        createdAt: new Date().toISOString()
      };
    }

    setCatches(prevCatches => [createdReport, ...prevCatches]);
    return true;
  };

  // Add Market Price
  const handlePostPrice = async (newPrice) => {
    let createdPrice = null;
    try {
      const res = await fetch(`${API_BASE}/market-prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrice)
      });
      if (res.ok) {
        createdPrice = await res.json();
      }
    } catch (err) {
      console.warn('Backend API request failed, creating offline price:', err.message);
    }

    if (!createdPrice) {
      createdPrice = {
        id: 'price-' + Date.now(),
        ...newPrice,
        postedBy: newPrice.postedBy || (user ? user.name : 'Fisherman'),
        date: new Date().toISOString()
      };
    }

    setPrices(prevPrices => [createdPrice, ...prevPrices]);
    return true;
  };

  // Create Purchase Deal
  const handleCreateDeal = async (dealData) => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    let newDeal = null;
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });
      if (res.ok) {
        newDeal = await res.json();
      }
    } catch (err) {
      console.warn('Backend API request failed, creating offline deal', err);
    }

    if (!newDeal) {
      const catchObj = catches.find(c => c.id === dealData.catchReportId) || {};
      newDeal = {
        id: 'deal-' + Date.now(),
        catchReportId: dealData.catchReportId,
        buyerId: user.id,
        proposedPricePerKg: dealData.proposedPricePerKg,
        requestedQtyKg: dealData.requestedQtyKg,
        status: 'pending',
        notes: dealData.notes,
        createdAt: new Date().toISOString(),
        buyer: { name: user.name, phone: user.phone, companyName: user.companyName },
        catchReport: catchObj
      };
    }

    setDeals(prev => [newDeal, ...prev]);
    return true;
  };

  // Update Deal Status
  const handleUpdateDealStatus = async (dealId, status) => {
    try {
      await fetch(`${API_BASE}/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('Offline update deal status', err);
    }
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status } : d));
  };

  // Delete Catch Report (Admin)
  const handleDeleteCatch = async (reportId) => {
    if (!user || user.role !== 'admin') return;
    try {
      await fetch(`${API_BASE}/catch-reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' }
      });
    } catch (err) {
      console.warn('Offline delete catch', err);
    }
    setCatches(catches.filter(c => c.id !== reportId));
  };

  // Delete User Account (Admin)
  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Offline delete user', err);
    }
    setUsers(users.filter(u => u.id !== userId));
  };

  // Toggle Verification Badge (Admin)
  const handleToggleVerify = async (userId, isVerified) => {
    try {
      await fetch(`${API_BASE}/users/${userId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified })
      });
    } catch (err) {
      console.warn('Offline verify toggle', err);
    }
    setUsers(users.map(u => u.id === userId ? { ...u, isVerified } : u));
  };

  // Create Warning Alert (Admin)
  const handlePostAlert = async (newAlert) => {
    if (!user || user.role !== 'admin') return false;
    try {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
        body: JSON.stringify({ postedBy: user.name, ...newAlert })
      });
      if (res.ok) {
        fetchData(selectedLocation);
        return true;
      }
    } catch (err) {
      const newOfflineAlert = {
        id: Math.random().toString(),
        ...newAlert,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (newAlert.expiryHours || 24) * 60 * 60 * 1000).toISOString()
      };
      setAlerts([newOfflineAlert, ...alerts]);
      return true;
    }
    return false;
  };

  // Coords for current selected location
  const currentCoords = locationCoordinates[selectedLocation] || { lat: 12.8732, lng: 74.8340 };

  // Filter alerts for the selected region
  const activeRegionAlerts = alerts.filter(a => {
    const regionName = a.region.split(',')[0].trim().toLowerCase();
    const activeName = selectedLocation.split(',')[0].trim().toLowerCase();
    return regionName.includes(activeName) || activeName.includes(regionName);
  });

  return (
    <div className="min-h-screen bg-ocean-bg flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-stone-200">

      {/* 1. APP HEADER */}
      <header className="sticky top-0 bg-white border-b-2 border-stone-200 px-4 py-3 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-ocean-teal text-white rounded-xl flex items-center justify-center font-black text-xl shadow-inner">
            TC
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-stone-800 leading-none">{t('appName')}</h1>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{t('tagline')}</span>
          </div>
        </div>

        {/* Header Controls: Admin + Lang + Profile */}
        <div className="flex items-center gap-1.5">
          {/* Quick Admin Console Button */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`p-2 border rounded-xl flex items-center justify-center font-bold text-xs gap-1 transition-all ${activeTab === 'admin'
              ? 'bg-stone-900 text-white border-stone-900 shadow-md font-extrabold'
              : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
              }`}
            title="Fisheries Admin Console"
          >
            <ShieldCheck size={15} />
            <span className="text-[11px] font-bold">Admin</span>
          </button>

          {/* Quick Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'kn' : lang === 'kn' ? 'ta' : 'en')}
            className="p-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-xl flex items-center justify-center font-bold text-xs uppercase gap-1"
            title="Switch Language"
          >
            <Languages size={15} />
            {lang}
          </button>

          {/* Quick Account */}
          {user ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedFisher(user)}
                className="p-2 bg-teal-50 border border-teal-200 text-ocean-teal rounded-xl flex items-center gap-1 font-bold text-xs"
                title="View Profile"
              >
                <UserIcon size={15} />
                <span className="max-w-[50px] truncate text-[10px]">{user.name.split(' ')[0]}</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-stone-100 hover:bg-red-50 border border-stone-200 text-stone-700 hover:text-ocean-red rounded-xl flex items-center justify-center"
                title="Logout Account"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="p-2 bg-ocean-teal text-white rounded-xl flex items-center justify-center shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
              title="Log In / Register"
            >
              <LogIn size={15} />
            </button>
          )}
        </div>
      </header>

      {/* 2. GLOBAL LOCATION DROPDOWN */}
      <section className="bg-white border-b-2 border-stone-200 px-4 py-3 z-20 flex gap-2 items-center">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="flex-1 w-full bg-stone-50 border-2 border-stone-200 text-stone-800 rounded-xl font-bold py-3 text-md"
        >
          {defaultLocations.map((loc, i) => (
            <option key={i} value={loc}>{loc}</option>
          ))}
        </select>

        <button
          onClick={() => fetchData(selectedLocation)}
          disabled={loading}
          className="p-3.5 bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-700 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </section>

      {/* 3. MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-5">

        {/* Dynamic Alerts Banner */}
        {activeRegionAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border-2 rounded-2xl flex items-start gap-3 shadow-md ${alert.severity === 'danger'
              ? 'bg-rose-50 border-rose-400 text-rose-950'
              : alert.severity === 'warning'
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : 'bg-blue-50 border-blue-400 text-blue-950'
              }`}
          >
            <AlertTriangle className={`stroke-[2.5] flex-shrink-0 ${alert.severity === 'danger' ? 'text-ocean-red' : alert.severity === 'warning' ? 'text-ocean-sandy' : 'text-blue-500'
              }`} size={24} />
            <div>
              <h5 className="font-extrabold text-md tracking-tight leading-snug">{alert.title}</h5>
              <p className="text-xs font-semibold mt-1 opacity-90 leading-relaxed">{alert.body}</p>
              <span className="text-[9px] font-bold block mt-2 opacity-60">Posted by {alert.postedBy}</span>
            </div>
          </div>
        ))}

        {/* TAB RENDERING */}
        {activeTab === 'home' && (
          <div className="space-y-5">
            {weather ? (
              <>
                <SafetyBanner status={weather.safetyStatus} message={weather.safetyMessage} />
                <WeatherSummary weather={weather} />
              </>
            ) : (
              <div className="text-center py-10 text-stone-500 font-semibold">{t('loading')}</div>
            )}
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="space-y-4">
            {forecast ? (
              <ForecastStrip forecast={forecast} />
            ) : (
              <div className="text-center py-10 text-stone-500 font-semibold">{t('loading')}</div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <MapView
              zones={zones}
              centerLat={currentCoords.lat}
              centerLng={currentCoords.lng}
              activeLocationName={selectedLocation}
            />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-4">
            <CommunityBulletin
              catches={catches.filter(c => c.location === selectedLocation || c.location === 'Global')}
              prices={prices.filter(p => p.location === selectedLocation)}
              onPostCatch={handlePostCatch}
              onPostPrice={handlePostPrice}
              onDeleteCatch={handleDeleteCatch}
              onViewFisherProfile={(fisher) => setSelectedFisher(fisher)}
              onRequestDeal={(catchItem) => setSelectedDealCatch(catchItem)}
              user={user}
              locations={defaultLocations}
              selectedLocation={selectedLocation}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'deals' && (
          <DealsInbox
            user={user}
            deals={deals}
            onUpdateDealStatus={handleUpdateDealStatus}
            onViewFisherProfile={(fisher) => setSelectedFisher(fisher)}
          />
        )}

        {activeTab === 'sos' && (
          <SosOverlay
            activeLocationName={selectedLocation}
            contacts={contacts}
          />
        )}

                {activeTab === 'admin' && (
          <AdminPanel
            user={user}
            onLogin={async (phone, pwd) => {
              try {
                const res = await fetch(`${API_BASE}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ phone, password: pwd })
                });
                const data = await res.json();
                if (res.ok && data.user.role === 'admin') {
                  setUser(data.user);
                  localStorage.setItem('teeraconnect_user', JSON.stringify(data.user));
                  return true;
                }
                return false;
              } catch (err) {
                return false;
              }
            }}
            onLogout={handleLogout}
            onPostAlert={handlePostAlert}
            catches={catches}
            prices={prices}
            users={users}
            deals={deals}
            onDeleteCatch={handleDeleteCatch}
            onDeleteUser={handleDeleteUser}
            onToggleVerify={handleToggleVerify}
            onPostPrice={handlePostPrice}
            locations={defaultLocations}
          />
        )}
      </main>

      {/* 4. MOBILE BOTTOM NAV BAR */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t-2 border-stone-200 z-40 shadow-xl grid grid-cols-7 px-1 py-1">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === 'home' ? 'text-ocean-teal font-extrabold bg-ocean-teal/5' : 'text-stone-500'}`}
        >
          <HomeIcon size={16} className={activeTab === 'home' ? 'stroke-[2.5]' : ''} />
          <span className="text-[8px] mt-1 font-bold truncate">{t('home')}</span>
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === 'forecast' ? 'text-ocean-teal font-extrabold bg-ocean-teal/5' : 'text-stone-500'}`}
        >
          <Calendar size={16} className={activeTab === 'forecast' ? 'stroke-[2.5]' : ''} />
          <span className="text-[8px] mt-1 font-bold truncate">Weather</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === 'map' ? 'text-ocean-teal font-extrabold bg-ocean-teal/5' : 'text-stone-500'}`}
        >
          <MapIcon size={16} className={activeTab === 'map' ? 'stroke-[2.5]' : ''} />
          <span className="text-[8px] mt-1 font-bold truncate">{t('map')}</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === 'community' ? 'text-ocean-teal font-extrabold bg-ocean-teal/5' : 'text-stone-500'}`}
        >
          <MessageSquare size={16} className={activeTab === 'community' ? 'stroke-[2.5]' : ''} />
          <span className="text-[8px] mt-1 font-bold truncate">Market</span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === 'deals' ? 'text-ocean-teal font-extrabold bg-ocean-teal/5' : 'text-stone-500'}`}
        >
          <ShoppingBag size={16} className={activeTab === 'deals' ? 'stroke-[2.5]' : ''} />
          <span className="text-[8px] mt-1 font-bold truncate">Deals</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${activeTab === 'admin' ? 'text-stone-900 font-extrabold bg-stone-900/10' : 'text-stone-500'}`}
        >
          <ShieldCheck size={16} className={activeTab === 'admin' ? 'stroke-[2.5]' : ''} />
          <span className="text-[8px] mt-1 font-bold truncate">Admin</span>
        </button>

        <button
          onClick={() => setActiveTab('sos')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all bg-rose-50 hover:bg-rose-100 text-ocean-red ${activeTab === 'sos' ? 'ring-2 ring-rose-400 font-extrabold' : ''}`}
        >
          <PhoneCall size={16} className="stroke-[2.5]" />
          <span className="text-[8px] mt-1 font-extrabold truncate">{t('sos')}</span>
        </button>
      </nav>

      {/* 5. FISHER PROFILE MODAL */}
      {selectedFisher && (
        <FisherProfileModal
          fisher={selectedFisher}
          catches={catches}
          onClose={() => setSelectedFisher(null)}
          onRequestDeal={(catchItem) => setSelectedDealCatch(catchItem)}
        />
      )}

      {/* 6. BUYER DEAL PROPOSAL MODAL */}
      {selectedDealCatch && (
        <BuyerDealModal
          catchItem={selectedDealCatch}
          buyer={user}
          onClose={() => setSelectedDealCatch(null)}
          onSubmitDeal={handleCreateDeal}
        />
      )}

      {/* 7. PHONE LOGIN / REGISTER MODAL WITH ROLE SELECTOR */}
      {showLoginModal && (
        <div className="absolute inset-0 bg-stone-500/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white border-2 border-stone-300 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowLoginModal(false);
                resetAuthForm();
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center font-bold text-stone-600"
            >
              ×
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-ocean-teal/10 text-ocean-teal rounded-full flex items-center justify-center mx-auto mb-2">
                <UserIcon size={24} className="stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-stone-800 tracking-tight">Register / Log In</h3>
              <p className="text-xs font-semibold text-stone-500">Connect with fishers, buyers & co-ops.</p>
            </div>

            {authError && (
              <p className="text-xs text-ocean-red font-black bg-red-50 border border-red-200 p-2.5 rounded-xl">
                {authError}
              </p>
            )}

            <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 py-2 rounded-xl transition-all ${authMode === 'register' ? 'bg-white text-ocean-teal shadow-md font-extrabold' : 'text-stone-500'}`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-2 rounded-xl transition-all ${authMode === 'login' ? 'bg-white text-ocean-teal shadow-md font-extrabold' : 'text-stone-500'}`}
              >
                Log In
              </button>
            </div>

            {authMode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Role Selector Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('fisher');
                      setName('');
                      setPhone('');
                    }}
                    className={`py-2 px-1 rounded-xl flex items-center justify-center gap-0.5 transition-all ${regRole === 'fisher' ? 'bg-white text-ocean-teal shadow-md font-extrabold' : 'text-stone-600'}`}
                  >
                    <Anchor size={12} /> Fisher
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('buyer');
                      setName('');
                      setPhone('');
                    }}
                    className={`py-2 px-1 rounded-xl flex items-center justify-center gap-0.5 transition-all ${regRole === 'buyer' ? 'bg-amber-500 text-white shadow-md font-extrabold' : 'text-stone-600'}`}
                  >
                    <Building2 size={12} /> Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('admin');
                      setName('Co-op Admin');
                      setPhone('9999999999');
                    }}
                    className={`py-2 px-1 rounded-xl flex items-center justify-center gap-0.5 transition-all ${regRole === 'admin' ? 'bg-stone-900 text-white shadow-md font-extrabold' : 'text-stone-600'}`}
                  >
                    <ShieldCheck size={12} /> Admin
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Gowda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {regRole === 'fisher' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-600">Boat Type</label>
                    <select
                      value={regBoatType}
                      onChange={(e) => setRegBoatType(e.target.value)}
                      className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl text-xs font-bold text-stone-800"
                    >
                      <option value="Mechanized Trawler">Mechanized Trawler</option>
                      <option value="Gillnetter Vessel">Gillnetter Vessel</option>
                      <option value="Country Boat (Motorized)">Country Boat (Motorized)</option>
                      <option value="Traditional Non-Motorized">Traditional Non-Motorized</option>
                    </select>
                  </div>
                )}

                {regRole === 'buyer' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-600">Company / Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Konkan Seafood Exports"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {regRole !== 'admin' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-600">Home Harbor / Base</label>
                    <select
                      value={regHarbor}
                      onChange={(e) => setRegHarbor(e.target.value)}
                      className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl text-xs font-bold text-stone-800"
                    >
                      {defaultLocations.map((loc, i) => (
                        <option key={i} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600">Phone Number (10 digits)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600">Password</label>
                  <input
                    type="password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-3.5 mt-2">
                  Create Account
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-3.5 mt-2">
                  Log In
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Quick link button to Admin Console in footer */}
      <footer className="bg-white border-t border-stone-200 py-3 text-center text-xs font-bold text-stone-400 flex items-center justify-center gap-1.5 cursor-pointer pb-24" onClick={() => setActiveTab('admin')}>
        <UserIcon size={12} />
        <span>TeeraConnect Fisheries Admin Console</span>
      </footer>
    </div>
  );
}

